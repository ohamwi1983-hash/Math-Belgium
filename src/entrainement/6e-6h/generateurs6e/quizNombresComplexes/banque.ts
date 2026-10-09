/**
 * Couche A — banque de contenu pour "Nombres complexes" (quiz vrai/faux), chapitre 7 du chantier
 * 6e (6h), ajout ultérieur (6gen68). 315 affirmations PRÉ-ÉCRITES (35 par thème, 9 thèmes, proche de
 * 50/50 vrai/faux), chacune vérifiée mathématiquement à la rédaction (calculs directs, cohérence
 * avec les générateurs déjà établis du chapitre pour les formules/pièges classiques) — jamais
 * générées procéduralement, voir `core6e/quizNombresComplexes.types.ts`.
 *
 * Un thème par générateur déjà établi du chapitre 7 (6gen34 à 6gen42). `enonce`/`justification`
 * sont des `FragmentConsigne[]` (texte/LaTeX mêlés, jamais de `string` brute), même convention que
 * 6gen65/66/67.
 *
 * Les 20 premières affirmations de chaque thème forment la banque d'origine (12 vraies/8 fausses).
 * Les 15 suivantes sont un enrichissement portant sur des nuances non couvertes par les 20 premières
 * (calculs concrets sur d'autres valeurs, propriétés de module/argument non encore testées, cas
 * dégénérés, conditions d'existence des lieux, etc. — 6 vraies/9 fausses, ce qui ramène chaque
 * thème à 18 vraies/17 fausses), vérifiées directement contre les générateurs sources 6gen34-6gen42
 * — jamais une simple reformulation d'une affirmation déjà présente dans les 20 premières.
 */
import type { FragmentConsigne, QuestionVraiFaux, VarianteQuizNombresComplexes } from "../../core6e/quizNombresComplexes.types";

function texte(valeur: string): FragmentConsigne {
  return { type: "texte", valeur };
}
function latex(valeur: string): FragmentConsigne {
  return { type: "latex", valeur };
}

export const BANQUE_QUIZ_NOMBRES_COMPLEXES: Record<VarianteQuizNombresComplexes, QuestionVraiFaux[]> = {
  // ==========================================================================
  // Thème 1 — Opérations de base et puissances de i, ref 6gen34
  // ==========================================================================
  operationsBase: [
    {
      enonce: [latex("(3+2i)+(1-5i) = 4-3i"), texte(".")],
      reponse: true,
      justification: [texte("On additionne séparément les parties réelles ("), latex("3+1=4"), texte(") et les parties imaginaires ("), latex("2-5=-3"), texte(").")],
    },
    {
      enonce: [latex("(3+2i)-(1-5i) = 2-3i"), texte(".")],
      reponse: false,
      justification: [texte("La partie imaginaire est "), latex("2-(-5)=7"), texte(", pas "), latex("-3"), texte(" : le résultat correct est "), latex("2+7i"), texte(".")],
    },
    {
      enonce: [texte("Le conjugué de "), latex("z=5-3i"), texte(" est "), latex("\\bar z=5+3i"), texte(".")],
      reponse: true,
      justification: [texte("Le conjugué garde la partie réelle et change le signe de la partie imaginaire.")],
    },
    {
      enonce: [texte("Le conjugué de "), latex("z=5-3i"), texte(" est "), latex("\\bar z=-5-3i"), texte(".")],
      reponse: false,
      justification: [texte("Ceci est l'opposé de "), latex("z"), texte(" ("), latex("-z"), texte("), pas son conjugué : le conjugué change seulement le signe de la partie IMAGINAIRE, jamais celui de la partie réelle.")],
    },
    {
      enonce: [texte("Pour tout complexe "), latex("z"), texte(", "), latex("z+\\bar z"), texte(" est un nombre réel.")],
      reponse: true,
      justification: [texte("On a "), latex("z+\\bar z = 2\\,\\text{Re}(z)"), texte(", toujours réel.")],
    },
    {
      enonce: [texte("Pour tout complexe "), latex("z"), texte(" non réel, "), latex("z-\\bar z"), texte(" est un nombre réel.")],
      reponse: false,
      justification: [texte("On a "), latex("z-\\bar z = 2i\\,\\text{Im}(z)"), texte(", un nombre purement IMAGINAIRE (non nul puisque "), latex("z"), texte(" n'est pas réel) — jamais réel dans ce cas.")],
    },
    {
      enonce: [texte("Pour "), latex("z=a+bi"), texte(", "), latex("z\\cdot\\bar z = a^2+b^2"), texte(", un réel positif ou nul.")],
      reponse: true,
      justification: [texte("C'est le calcul direct : "), latex("(a+bi)(a-bi)=a^2-(bi)^2=a^2+b^2"), texte(".")],
    },
    {
      enonce: [latex("(2+i)(3-i) = 7+i"), texte(".")],
      reponse: true,
      justification: [texte("En développant : "), latex("6-2i+3i-i^2=6+i-(-1)=7+i"), texte(".")],
    },
    {
      enonce: [latex("(2+i)(3-i) = 5+5i"), texte(".")],
      reponse: false,
      justification: [texte("Le développement correct donne "), latex("7+i"), texte(" (voir calcul détaillé), pas "), latex("5+5i"), texte(".")],
    },
    {
      enonce: [latex("i^2=-1"), texte(", donc "), latex("i"), texte(" est une racine carrée de "), latex("-1"), texte(".")],
      reponse: true,
      justification: [texte("C'est la définition même du nombre imaginaire "), latex("i"), texte(".")],
    },
    {
      enonce: [latex("i^2=1"), texte(", car "), latex("i"), texte(" est défini comme la racine carrée de "), latex("1"), texte(".")],
      reponse: false,
      justification: [texte("Piège classique de signe : "), latex("i"), texte(" est défini comme une racine carrée de "), latex("-1"), texte(", donc "), latex("i^2=-1"), texte(", jamais "), latex("+1"), texte(".")],
    },
    {
      enonce: [latex("i^3=-i"), texte(".")],
      reponse: true,
      justification: [texte("On a "), latex("i^3=i^2\\cdot i=(-1)\\cdot i=-i"), texte(".")],
    },
    {
      enonce: [latex("i^4=-1"), texte(".")],
      reponse: false,
      justification: [texte("On a "), latex("i^4=(i^2)^2=(-1)^2=1"), texte(", pas "), latex("-1"), texte(".")],
    },
    {
      enonce: [texte("Les puissances de "), latex("i"), texte(" sont périodiques de période 4 : "), latex("i^0=1,\\ i^1=i,\\ i^2=-1,\\ i^3=-i"), texte(", puis le cycle recommence.")],
      reponse: true,
      justification: [texte("C'est le cycle de base, conséquence directe de "), latex("i^4=1"), texte(".")],
    },
    {
      enonce: [texte("Pour diviser "), latex("a+bi"), texte(" par "), latex("c+di"), texte(", on multiplie numérateur et dénominateur par le conjugué du DÉNOMINATEUR, "), latex("c-di"), texte(".")],
      reponse: true,
      justification: [texte("C'est la technique standard : elle rend le dénominateur réel, puisque "), latex("(c+di)(c-di)=c^2+d^2"), texte(".")],
    },
    {
      enonce: [texte("Pour diviser "), latex("a+bi"), texte(" par "), latex("c+di"), texte(", on multiplie numérateur et dénominateur par le conjugué du NUMÉRATEUR, "), latex("a-bi"), texte(".")],
      reponse: false,
      justification: [texte("C'est le conjugué du DÉNOMINATEUR qu'il faut utiliser, jamais celui du numérateur — sinon le dénominateur reste complexe.")],
    },
    {
      enonce: [latex("\\dfrac{1+i}{1-i} = i"), texte(".")],
      reponse: true,
      justification: [texte("En multipliant par le conjugué "), latex("1+i"), texte(" : numérateur "), latex("(1+i)^2=2i"), texte(", dénominateur "), latex("1^2+1^2=2"), texte(", donc "), latex("2i/2=i"), texte(".")],
    },
    {
      enonce: [latex("\\dfrac{1+i}{1-i} = 1"), texte(".")],
      reponse: false,
      justification: [texte("Le calcul correct (voir ci-dessus) donne "), latex("i"), texte(", pas "), latex("1"), texte(".")],
    },
    {
      enonce: [latex("i^{2021}=i"), texte(", car "), latex("2021"), texte(" laisse le reste "), latex("1"), texte(" dans la division par "), latex("4"), texte(".")],
      reponse: true,
      justification: [texte("On a "), latex("2021=4\\times505+1"), texte(", donc "), latex("i^{2021}=i^1=i"), texte(".")],
    },
    {
      enonce: [latex("i^{-1}=-i"), texte(".")],
      reponse: true,
      justification: [texte("On vérifie "), latex("i\\times(-i)=-i^2=1"), texte(" : "), latex("-i"), texte(" est bien l'inverse de "), latex("i"), texte(".")],
    },

    // --- Enrichissement (15 affirmations supplémentaires, nuances non couvertes ci-dessus) ---
    {
      enonce: [latex("(2+3i)^2 = -5+12i"), texte(".")],
      reponse: true,
      justification: [texte("En développant : "), latex("4+2\\times2\\times3i+9i^2 = 4+12i-9 = -5+12i"), texte(".")],
    },
    {
      enonce: [latex("(2+3i)^2 = 2^2+(3i)^2 = -5"), texte(", le carré d'une somme étant la somme des carrés.")],
      reponse: false,
      justification: [texte("Le double produit "), latex("2\\times2\\times3i=12i"), texte(" est oublié : le résultat correct est "), latex("-5+12i"), texte(", jamais un réel.")],
    },
    {
      enonce: [latex("(1+i)^3 = 1^3+i^3 = 1-i"), texte(".")],
      reponse: false,
      justification: [texte("Un cube ne se distribue jamais terme à terme : "), latex("(1+i)^3=(1+i)(1+i)^2=(1+i)\\cdot2i=2i+2i^2=-2+2i"), texte(".")],
    },
    {
      enonce: [texte("Diviser par "), latex("i"), texte(" revient à multiplier par "), latex("-i"), texte(" : pour tout complexe "), latex("z"), texte(", "), latex("z/i=-iz"), texte(".")],
      reponse: true,
      justification: [texte("Puisque "), latex("1/i=-i"), texte(" (car "), latex("i\\times(-i)=1"), texte("), diviser par "), latex("i"), texte(" et multiplier par "), latex("-i"), texte(" sont la même opération.")],
    },
    {
      enonce: [latex("\\dfrac{3+2i}{i} = -2+3i"), texte(".")],
      reponse: false,
      justification: [texte("On multiplie par "), latex("-i"), texte(" : "), latex("(3+2i)(-i)=-3i-2i^2=2-3i"), texte(" — les parties réelle et imaginaire sont ici interverties et mal signées.")],
    },
    {
      enonce: [texte("Pour tout complexe "), latex("z"), texte(", "), latex("\\text{Re}(z)=\\dfrac{z+\\bar z}{2}"), texte(" et "), latex("\\text{Im}(z)=\\dfrac{z-\\bar z}{2i}"), texte(".")],
      reponse: true,
      justification: [texte("On a "), latex("z+\\bar z=2\\,\\text{Re}(z)"), texte(" et "), latex("z-\\bar z=2i\\,\\text{Im}(z)"), texte(" : il suffit de diviser par "), latex("2"), texte(" et par "), latex("2i"), texte(".")],
    },
    {
      enonce: [texte("Pour tout complexe "), latex("z"), texte(", "), latex("\\text{Im}(z)=\\dfrac{z-\\bar z}{2}"), texte(".")],
      reponse: false,
      justification: [texte("Il manque le facteur "), latex("i"), texte(" au dénominateur : "), latex("\\dfrac{z-\\bar z}{2}=i\\,\\text{Im}(z)"), texte(", un imaginaire pur, pas le réel "), latex("\\text{Im}(z)"), texte(".")],
    },
    {
      enonce: [texte("Pour "), latex("z=a+bi"), texte(" non nul, "), latex("\\dfrac{1}{z}=\\dfrac{a-bi}{a^2+b^2}"), texte(".")],
      reponse: true,
      justification: [texte("C'est la multiplication par le conjugué du dénominateur : "), latex("\\dfrac{1}{a+bi}=\\dfrac{a-bi}{(a+bi)(a-bi)}=\\dfrac{a-bi}{a^2+b^2}"), texte(".")],
    },
    {
      enonce: [texte("Pour tout complexe non nul "), latex("z"), texte(", l'inverse de "), latex("z"), texte(" est son conjugué : "), latex("1/z=\\bar z"), texte(".")],
      reponse: false,
      justification: [texte("On a "), latex("1/z=\\bar z/(a^2+b^2)"), texte(" : l'égalité "), latex("1/z=\\bar z"), texte(" n'a lieu que si "), latex("a^2+b^2=1"), texte(", jamais en général ("), latex("z=2"), texte(" donne "), latex("1/z=1/2\\neq2"), texte(").")],
    },
    {
      enonce: [latex("i^{100}=1"), texte(".")],
      reponse: true,
      justification: [latex("100=4\\times25"), texte(" : le reste dans la division par "), latex("4"), texte(" est "), latex("0"), texte(", donc "), latex("i^{100}=i^0=1"), texte(".")],
    },
    {
      enonce: [latex("i^{50}=1"), texte(".")],
      reponse: false,
      justification: [latex("50=4\\times12+2"), texte(" : le reste est "), latex("2"), texte(", donc "), latex("i^{50}=i^2=-1"), texte(", pas "), latex("+1"), texte(".")],
    },
    {
      enonce: [latex("i+i^2+i^3+i^4 = 1"), texte(".")],
      reponse: false,
      justification: [texte("La somme vaut "), latex("i-1-i+1=0"), texte(", pas "), latex("1"), texte(" : un cycle complet de 4 puissances de "), latex("i"), texte(" se compense exactement.")],
    },
    {
      enonce: [texte("La somme de 4 puissances CONSÉCUTIVES de "), latex("i"), texte(" ("), latex("i^k+i^{k+1}+i^{k+2}+i^{k+3}"), texte(") vaut toujours "), latex("0"), texte(", quel que soit l'entier "), latex("k"), texte(".")],
      reponse: true,
      justification: [texte("On met "), latex("i^k"), texte(" en évidence : "), latex("i^k(1+i+i^2+i^3)=i^k(1+i-1-i)=0"), texte(".")],
    },
    {
      enonce: [latex("\\dfrac{2+i}{1-i} = \\dfrac{3+i}{2}"), texte(".")],
      reponse: false,
      justification: [texte("En multipliant par le conjugué "), latex("1+i"), texte(" : numérateur "), latex("(2+i)(1+i)=2+2i+i-1=1+3i"), texte(", dénominateur "), latex("1^2+1^2=2"), texte(" — le résultat est "), latex("\\dfrac{1+3i}{2}"), texte(", pas "), latex("\\dfrac{3+i}{2}"), texte(".")],
    },
    {
      enonce: [texte("La partie réelle d'un produit est le produit des parties réelles : "), latex("\\text{Re}(z_1z_2)=\\text{Re}(z_1)\\cdot\\text{Re}(z_2)"), texte(".")],
      reponse: false,
      justification: [texte("Contre-exemple immédiat avec "), latex("z_1=z_2=i"), texte(" : "), latex("\\text{Re}(i\\cdot i)=\\text{Re}(-1)=-1"), texte(", alors que "), latex("\\text{Re}(i)\\cdot\\text{Re}(i)=0\\times0=0"), texte(".")],
    },
  ],

  // ==========================================================================
  // Thème 2 — Affixes et racines carrées, ref 6gen35
  // ==========================================================================
  affixesRacines: [
    {
      enonce: [texte("Si "), latex("A"), texte(" a pour affixe "), latex("z_A=2+3i"), texte(", alors le vecteur "), latex("\\vec{OA}"), texte(" a aussi pour affixe "), latex("2+3i"), texte(".")],
      reponse: true,
      justification: [texte("Quand l'origine est "), latex("O"), texte(", l'affixe d'un vecteur "), latex("\\vec{OA}"), texte(" coïncide avec celle du point "), latex("A"), texte(".")],
    },
    {
      enonce: [texte("Si "), latex("A"), texte(" a pour affixe "), latex("z_A=2+3i"), texte(", alors le vecteur "), latex("\\vec{AO}"), texte(" a aussi pour affixe "), latex("2+3i"), texte(".")],
      reponse: false,
      justification: [texte("L'affixe de "), latex("\\vec{AO}"), texte(" est "), latex("z_O-z_A=-z_A=-2-3i"), texte(", l'opposé — pas la même valeur que "), latex("\\vec{OA}"), texte(".")],
    },
    {
      enonce: [texte("Le milieu "), latex("M"), texte(" du segment "), latex("[AB]"), texte(" a pour affixe "), latex("z_M=\\dfrac{z_A+z_B}{2}"), texte(".")],
      reponse: true,
      justification: [texte("C'est la formule usuelle du milieu, transposée aux affixes.")],
    },
    {
      enonce: [texte("Le milieu "), latex("M"), texte(" du segment "), latex("[AB]"), texte(" a pour affixe "), latex("z_M=z_A+z_B"), texte(".")],
      reponse: false,
      justification: [texte("Il manque la division par "), latex("2"), texte(" : sans elle, on obtient le double du milieu, pas le milieu lui-même.")],
    },
    {
      enonce: [texte("La distance "), latex("AB"), texte(" est donnée par "), latex("AB=|z_B-z_A|"), texte(".")],
      reponse: true,
      justification: [texte("Le module d'une différence d'affixes correspond exactement à la distance entre les deux points.")],
    },
    {
      enonce: [texte("La distance "), latex("AB"), texte(" est donnée par "), latex("AB=|z_A+z_B|"), texte(".")],
      reponse: false,
      justification: [texte("C'est la DIFFÉRENCE des affixes qu'il faut prendre, jamais leur somme, pour obtenir une distance.")],
    },
    {
      enonce: [texte("Pour "), latex("z_A=1+2i"), texte(" et "), latex("z_B=4+6i"), texte(", "), latex("AB=5"), texte(".")],
      reponse: true,
      justification: [texte("On a "), latex("z_B-z_A=3+4i"), texte(", de module "), latex("\\sqrt{3^2+4^2}=5"), texte(".")],
    },
    {
      enonce: [texte("Pour "), latex("z_A=1+2i"), texte(" et "), latex("z_B=4+6i"), texte(", "), latex("AB=7"), texte(".")],
      reponse: false,
      justification: [texte("Le calcul correct (voir ci-dessus) donne "), latex("AB=5"), texte(", pas "), latex("7"), texte(".")],
    },
    {
      enonce: [texte("Pour trouver une racine carrée de "), latex("a+bi"), texte(" sous forme "), latex("x+iy"), texte(", on pose "), latex("(x+iy)^2=a+bi"), texte(" puis on résout le système obtenu en identifiant parties réelle et imaginaire.")],
      reponse: true,
      justification: [texte("C'est la méthode générale : développer "), latex("(x+iy)^2=x^2-y^2+2xyi"), texte(", puis identifier à "), latex("a+bi"), texte(".")],
    },
    {
      enonce: [texte("Dans ce système, on ajoute souvent l'équation "), latex("x^2+y^2=\\sqrt{a^2+b^2}"), texte(" (module de "), latex("a+bi"), texte(") pour faciliter la résolution.")],
      reponse: true,
      justification: [texte("Prendre le module des deux membres de "), latex("(x+iy)^2=a+bi"), texte(" donne "), latex("x^2+y^2=|a+bi|=\\sqrt{a^2+b^2}"), texte(", une 3e équation qui simplifie grandement la résolution.")],
    },
    {
      enonce: [texte("Dans ce système, l'équation supplémentaire tirée du module est "), latex("x^2+y^2=a^2+b^2"), texte(".")],
      reponse: false,
      justification: [texte("C'est une confusion classique entre le module et le module AU CARRÉ : la bonne équation est "), latex("x^2+y^2=\\sqrt{a^2+b^2}"), texte(", pas "), latex("a^2+b^2"), texte(".")],
    },
    {
      enonce: [texte("Pour trouver les racines carrées de "), latex("3+4i"), texte(" sous forme "), latex("x+iy"), texte(", on obtient le système "), latex("x^2-y^2=3"), texte(", "), latex("2xy=4"), texte(", "), latex("x^2+y^2=5"), texte(" (car "), latex("|3+4i|=5"), texte(").")],
      reponse: true,
      justification: [texte("On a bien "), latex("\\sqrt{3^2+4^2}=5"), texte(", et les 2 premières équations viennent de l'identification des parties réelle/imaginaire.")],
    },
    {
      enonce: [texte("En résolvant ce système, on trouve "), latex("x^2=4"), texte(" et "), latex("y^2=1"), texte(", donc les racines carrées de "), latex("3+4i"), texte(" sont "), latex("\\pm(2+i)"), texte(".")],
      reponse: true,
      justification: [texte("En additionnant/soustrayant "), latex("x^2-y^2=3"), texte(" et "), latex("x^2+y^2=5"), texte(", on obtient "), latex("x^2=4"), texte(", "), latex("y^2=1"), texte("; comme "), latex("2xy=4>0"), texte(", "), latex("x"), texte(" et "), latex("y"), texte(" ont le même signe.")],
    },
    {
      enonce: [texte("Un nombre complexe non nul possède UNE SEULE racine carrée.")],
      reponse: false,
      justification: [texte("Il en possède toujours EXACTEMENT DEUX, opposées l'une de l'autre — jamais une seule (sauf le cas particulier "), latex("z=0"), texte(").")],
    },
    {
      enonce: [texte("Un nombre complexe non nul possède exactement 2 racines carrées, opposées l'une de l'autre.")],
      reponse: true,
      justification: [texte("Si "), latex("z_0"), texte(" est une racine carrée de "), latex("w"), texte(", alors "), latex("(-z_0)^2=z_0^2=w"), texte(" aussi : ce sont les 2 seules solutions.")],
    },
    {
      enonce: [texte("Si "), latex("z_0"), texte(" est une racine carrée de "), latex("w"), texte(", alors "), latex("-z_0"), texte(" est aussi une racine carrée de "), latex("w"), texte(".")],
      reponse: true,
      justification: [texte("Car "), latex("(-z_0)^2=(-1)^2z_0^2=z_0^2=w"), texte(".")],
    },
    {
      enonce: [texte("Si "), latex("ABCD"), texte(" est un parallélogramme (dans cet ordre), alors "), latex("z_D=z_A+z_B+z_C"), texte(".")],
      reponse: false,
      justification: [texte("La bonne relation est "), latex("z_D=z_A-z_B+z_C"), texte(" (diagonales de même milieu) — additionner "), latex("z_B"), texte(" au lieu de le soustraire est une erreur classique.")],
    },
    {
      enonce: [texte("Si "), latex("ABCD"), texte(" est un parallélogramme (dans cet ordre), les diagonales "), latex("[AC]"), texte(" et "), latex("[BD]"), texte(" ont le même milieu, ce qui donne "), latex("z_D=z_A-z_B+z_C"), texte(".")],
      reponse: true,
      justification: [texte("Égaler les milieux "), latex("\\dfrac{z_A+z_C}{2}=\\dfrac{z_B+z_D}{2}"), texte(" donne directement "), latex("z_D=z_A+z_C-z_B"), texte(".")],
    },
    {
      enonce: [texte("Le module d'une différence d'affixes correspond à une distance entre deux points du plan.")],
      reponse: true,
      justification: [texte("C'est la définition même utilisée pour calculer une longueur "), latex("AB"), texte(" à partir des affixes.")],
    },
    {
      enonce: [texte("Le module d'une somme d'affixes correspond toujours, lui aussi, directement à une distance "), latex("AB"), texte(" entre deux points du plan.")],
      reponse: false,
      justification: [texte("La convention de ce chapitre associe une distance "), latex("AB"), texte(" spécifiquement à une DIFFÉRENCE d'affixes ("), latex("|z_B-z_A|"), texte("), pas à une somme — "), latex("|z_A+z_B|"), texte(" est la distance entre "), latex("A"), texte(" et le point d'affixe "), latex("-z_B"), texte(", pas entre "), latex("A"), texte(" et "), latex("B"), texte(".")],
    },

    // --- Enrichissement (15 affirmations supplémentaires, nuances non couvertes ci-dessus) ---
    {
      enonce: [texte("Pour trouver les racines carrées d'un nombre complexe, on calcule d'abord son module puis on résout directement, sans jamais avoir à poser "), latex("z=x+iy"), texte(".")],
      reponse: false,
      justification: [texte("La méthode part au contraire de "), latex("z=x+iy"), texte(" et de "), latex("(x+iy)^2=a+bi"), texte(" : c'est l'identification des parties réelle/imaginaire qui donne le système, et "), latex("\\sqrt{a^2+b^2}"), texte(" n'apparaît qu'ENSUITE, comme 3e équation obtenue en élevant les 2 premières au carré et en les additionnant.")],
    },
    {
      enonce: [texte("La 3e équation "), latex("x^2+y^2=\\sqrt{a^2+b^2}"), texte(" s'obtient en ÉLEVANT AU CARRÉ les deux équations "), latex("x^2-y^2=a"), texte(" et "), latex("2xy=b"), texte(", puis en les ADDITIONNANT membre à membre.")],
      reponse: true,
      justification: [texte("On obtient "), latex("(x^2-y^2)^2+(2xy)^2=a^2+b^2"), texte(", soit "), latex("x^4+2x^2y^2+y^4=(x^2+y^2)^2=a^2+b^2"), texte(", d'où "), latex("x^2+y^2=\\sqrt{a^2+b^2}"), texte(".")],
    },
    {
      enonce: [texte("La 3e équation s'obtient en additionnant DIRECTEMENT "), latex("x^2-y^2=a"), texte(" et "), latex("2xy=b"), texte(", sans les élever au carré au préalable.")],
      reponse: false,
      justification: [texte("Cette addition directe donnerait "), latex("x^2-y^2+2xy=a+b"), texte(", qui n'apporte rien : c'est en élevant D'ABORD les 2 équations au carré que le membre de gauche devient le carré parfait "), latex("(x^2+y^2)^2"), texte(".")],
    },
    {
      enonce: [texte("Après avoir élevé les deux équations au carré, le membre de gauche de la somme est le carré parfait "), latex("(x^2+y^2)^2"), texte(" ; comme "), latex("x^2+y^2\\geq0"), texte(", on peut en prendre la racine carrée RÉELLE sans aucune ambiguïté de signe.")],
      reponse: true,
      justification: [latex("x^4-2x^2y^2+y^4"), texte(" (1re équation au carré) additionné à "), latex("4x^2y^2"), texte(" (2e équation au carré) donne "), latex("x^4+2x^2y^2+y^4=(x^2+y^2)^2"), texte(" — et "), latex("x^2+y^2"), texte(", somme de 2 carrés réels, est toujours positif ou nul.")],
    },
    {
      enonce: [texte("Une fois "), latex("x^2"), texte(" et "), latex("y^2"), texte(" connus par somme et différence, c'est l'équation "), latex("2xy=b"), texte(" qui fixe le SIGNE RELATIF de "), latex("x"), texte(" et "), latex("y"), texte(" (même signe si "), latex("b>0"), texte(", signes opposés si "), latex("b<0"), texte(") — elle ne sert qu'à la toute fin.")],
      reponse: true,
      justification: [texte("Les équations 1 et 3 ne donnent que "), latex("x^2"), texte(" et "), latex("y^2"), texte(", donc "), latex("x"), texte(" et "), latex("y"), texte(" au signe près ; seul le signe du produit "), latex("2xy=b"), texte(" permet de trancher entre les couples restants.")],
    },
    {
      enonce: [texte("Une fois "), latex("x^2"), texte(" et "), latex("y^2"), texte(" connus, les 4 couples "), latex("(\\pm x;\\pm y)"), texte(" sont tous des racines carrées de "), latex("a+bi"), texte(".")],
      reponse: false,
      justification: [texte("Seuls 2 des 4 couples respectent la condition de signe "), latex("2xy=b"), texte(" — et ce sont bien 2 racines OPPOSÉES, jamais 4 racines distinctes.")],
    },
    {
      enonce: [texte("La 3e équation "), latex("x^2+y^2=\\sqrt{a^2+b^2}"), texte(" n'est valable que si "), latex("a"), texte(" et "), latex("b"), texte(" sont tous deux positifs.")],
      reponse: false,
      justification: [texte("Elle est valable pour "), latex("a"), texte(" et "), latex("b"), texte(" de signes QUELCONQUES : le calcul ne fait intervenir que "), latex("a^2"), texte(" et "), latex("b^2"), texte(", et "), latex("\\sqrt{a^2+b^2}"), texte(" est toujours défini et positif.")],
    },
    {
      enonce: [texte("Les racines carrées de "), latex("5-12i"), texte(" sont "), latex("3-2i"), texte(" et "), latex("-3+2i"), texte(".")],
      reponse: true,
      justification: [texte("Le système donne "), latex("x^2-y^2=5"), texte(", "), latex("2xy=-12"), texte(", "), latex("x^2+y^2=\\sqrt{169}=13"), texte(", d'où "), latex("x^2=9"), texte(", "), latex("y^2=4"), texte(" et, via "), latex("2xy<0"), texte(", des signes opposés. Vérification : "), latex("(3-2i)^2=9-12i-4=5-12i"), texte(".")],
    },
    {
      enonce: [texte("Les racines carrées de "), latex("5-12i"), texte(" sont "), latex("3+2i"), texte(" et "), latex("-3-2i"), texte(".")],
      reponse: false,
      justification: [texte("Le signe relatif est faux : "), latex("(3+2i)^2=9+12i-4=5+12i"), texte(", le CONJUGUÉ du nombre demandé. Comme "), latex("2xy=-12<0"), texte(", "), latex("x"), texte(" et "), latex("y"), texte(" doivent être de signes OPPOSÉS.")],
    },
    {
      enonce: [texte("Si "), latex("a+bi=(x+iy)^2"), texte(" avec "), latex("x"), texte(" et "), latex("y"), texte(" ENTIERS, alors "), latex("a^2+b^2"), texte(" est toujours un carré parfait, égal à "), latex("(x^2+y^2)^2"), texte(".")],
      reponse: true,
      justification: [texte("Avec "), latex("a=x^2-y^2"), texte(" et "), latex("b=2xy"), texte(" : "), latex("a^2+b^2=x^4-2x^2y^2+y^4+4x^2y^2=(x^2+y^2)^2"), texte(" — c'est ce qui garantit que la 3e équation ne fait jamais apparaître de radical à évaluer.")],
    },
    {
      enonce: [texte("L'affixe du vecteur "), latex("\\vec{AB}"), texte(" est "), latex("z_A-z_B"), texte(".")],
      reponse: false,
      justification: [texte("C'est "), latex("z_B-z_A"), texte(" (arrivée moins départ) : "), latex("z_A-z_B"), texte(" est l'affixe du vecteur OPPOSÉ "), latex("\\vec{BA}"), texte(".")],
    },
    {
      enonce: [texte("Le quadrilatère "), latex("ABCD"), texte(" est un parallélogramme si, et seulement si, les vecteurs "), latex("\\vec{AB}"), texte(" et "), latex("\\vec{DC}"), texte(" ont la MÊME affixe.")],
      reponse: true,
      justification: [latex("z_B-z_A=z_C-z_D"), texte(" équivaut à "), latex("z_D=z_A-z_B+z_C"), texte(", exactement la relation du parallélogramme.")],
    },
    {
      enonce: [texte("Pour que "), latex("ABCD"), texte(" soit un parallélogramme, il suffit que les longueurs "), latex("AB"), texte(" et "), latex("CD"), texte(" soient égales.")],
      reponse: false,
      justification: [texte("L'égalité des longueurs ne dit rien de la DIRECTION ni du SENS : il faut l'égalité VECTORIELLE "), latex("\\vec{AB}=\\vec{DC}"), texte(" (même affixe), bien plus forte que "), latex("|z_B-z_A|=|z_D-z_C|"), texte(".")],
    },
    {
      enonce: [texte("Le point d'affixe "), latex("\\dfrac{z_A+z_B+z_C}{3}"), texte(" est le milieu du segment "), latex("[AB]"), texte(".")],
      reponse: false,
      justification: [texte("C'est le centre de gravité du TRIANGLE "), latex("ABC"), texte(" : le milieu de "), latex("[AB]"), texte(" a pour affixe "), latex("\\dfrac{z_A+z_B}{2}"), texte(", sans "), latex("z_C"), texte(".")],
    },
    {
      enonce: [texte("Deux points distincts "), latex("A"), texte(" et "), latex("B"), texte(" ont toujours des affixes de modules différents.")],
      reponse: false,
      justification: [texte("Contre-exemple : "), latex("z_A=1"), texte(" et "), latex("z_B=-1"), texte(" sont distincts mais de même module "), latex("1"), texte(" — tous les points d'un même cercle centré en "), latex("O"), texte(" partagent ce module.")],
    },
  ],

  // ==========================================================================
  // Thème 3 — Équations dans ℂ, ref 6gen36
  // ==========================================================================
  equationsComplexes: [
    {
      enonce: [texte("Si le discriminant "), latex("\\Delta"), texte(" d'une équation du second degré à coefficients réels est strictement négatif, alors l'équation admet deux solutions complexes conjuguées.")],
      reponse: true,
      justification: [texte("C'est le résultat central de ce chapitre : "), latex("\\Delta<0"), texte(" donne 2 racines complexes, conjuguées l'une de l'autre.")],
    },
    {
      enonce: [texte("Si "), latex("\\Delta<0"), texte(", l'équation du second degré n'admet aucune solution, ni réelle ni complexe.")],
      reponse: false,
      justification: [texte("Elle n'admet aucune solution RÉELLE, mais elle admet bien 2 solutions COMPLEXES conjuguées — la résolution ne s'arrête jamais à « pas de solution » dans ℂ.")],
    },
    {
      enonce: [texte("Pour "), latex("az^2+bz+c=0"), texte(" ("), latex("a,b,c"), texte(" réels) avec "), latex("\\Delta<0"), texte(", les solutions sont "), latex("z=\\dfrac{-b\\pm i\\sqrt{|\\Delta|}}{2a}"), texte(".")],
      reponse: true,
      justification: [texte("Puisque "), latex("\\Delta<0"), texte(", on écrit "), latex("\\Delta=-|\\Delta|=i^2|\\Delta|"), texte(", d'où "), latex("\\sqrt{\\Delta}=i\\sqrt{|\\Delta|}"), texte(".")],
    },
    {
      enonce: [texte("Pour "), latex("az^2+bz+c=0"), texte(" avec "), latex("\\Delta<0"), texte(", les solutions sont "), latex("z=\\dfrac{-b\\pm\\sqrt{\\Delta}}{2a}"), texte(", en laissant "), latex("\\Delta"), texte(" négatif directement sous la racine carrée.")],
      reponse: false,
      justification: [texte("Une racine carrée d'un réel négatif n'a pas de sens sans faire apparaître "), latex("i"), texte(" explicitement : il faut écrire "), latex("i\\sqrt{|\\Delta|}"), texte(", jamais laisser un radical réel sur un nombre négatif.")],
    },
    {
      enonce: [texte("Pour "), latex("z^2+2z+5=0"), texte(", les solutions sont "), latex("z=-1+2i"), texte(" et "), latex("z=-1-2i"), texte(".")],
      reponse: true,
      justification: [texte("On a "), latex("\\Delta=4-20=-16"), texte(", "), latex("\\sqrt{|\\Delta|}=4"), texte(", donc "), latex("z=\\dfrac{-2\\pm4i}{2}=-1\\pm2i"), texte(".")],
    },
    {
      enonce: [texte("Pour "), latex("z^2+2z+5=0"), texte(", les solutions sont "), latex("z=1+2i"), texte(" et "), latex("z=1-2i"), texte(".")],
      reponse: false,
      justification: [texte("Erreur de signe sur la partie réelle : le calcul correct (voir ci-dessus) donne "), latex("-1\\pm2i"), texte(", pas "), latex("1\\pm2i"), texte(".")],
    },
    {
      enonce: [texte("Une équation bicarrée est de la forme "), latex("az^4+bz^2+c=0"), texte(" ("), latex("a\\neq0"), texte("), qui se ramène à une équation du second degré via le changement de variable "), latex("u=z^2"), texte(".")],
      reponse: true,
      justification: [texte("C'est la définition et la méthode standard des équations bicarrées.")],
    },
    {
      enonce: [texte("Une équation bicarrée "), latex("az^4+bz^2+c=0"), texte(" se résout en posant "), latex("u=z"), texte(", ramenant directement à une équation du second degré.")],
      reponse: false,
      justification: [texte("Le bon changement de variable est "), latex("u=z^2"), texte(", pas "), latex("u=z"), texte(" — sinon l'équation obtenue reste de degré 4, pas 2.")],
    },
    {
      enonce: [texte("Après résolution de l'équation intermédiaire en "), latex("u"), texte(", chaque valeur de "), latex("u\\neq0"), texte(" fournit exactement 2 valeurs de "), latex("z"), texte(" (les 2 racines carrées de "), latex("u"), texte(").")],
      reponse: true,
      justification: [texte("Chaque "), latex("u\\neq0"), texte(" a 2 racines carrées complexes opposées, qui redonnent chacune une valeur de "), latex("z"), texte(" via "), latex("z^2=u"), texte(".")],
    },
    {
      enonce: [texte("Après résolution de l'équation en "), latex("u"), texte(", chaque valeur de "), latex("u"), texte(" fournit une seule valeur de "), latex("z"), texte(".")],
      reponse: false,
      justification: [texte("Sauf pour "), latex("u=0"), texte(", chaque "), latex("u"), texte(" fournit 2 valeurs opposées de "), latex("z"), texte(", pas une seule.")],
    },
    {
      enonce: [texte("Pour "), latex("z^4-5z^2+4=0"), texte(", en posant "), latex("u=z^2"), texte(", on obtient "), latex("u^2-5u+4=0"), texte(", dont les solutions sont "), latex("u=1"), texte(" et "), latex("u=4"), texte(".")],
      reponse: true,
      justification: [texte("Discriminant "), latex("25-16=9"), texte(", racine "), latex("3"), texte(", donc "), latex("u=\\dfrac{5\\pm3}{2}"), texte(", soit "), latex("4"), texte(" ou "), latex("1"), texte(".")],
    },
    {
      enonce: [texte("Pour "), latex("z^4-5z^2+4=0"), texte(", les 4 solutions sont "), latex("z=1,\\ z=-1,\\ z=2,\\ z=-2"), texte(".")],
      reponse: true,
      justification: [texte("Racines carrées de "), latex("u=1"), texte(" : "), latex("\\pm1"), texte(". Racines carrées de "), latex("u=4"), texte(" : "), latex("\\pm2"), texte(".")],
    },
    {
      enonce: [texte("Pour "), latex("z^4+5z^2+4=0"), texte(", les solutions sont "), latex("z=1,\\ z=-1,\\ z=2,\\ z=-2"), texte(" (les mêmes que pour "), latex("z^4-5z^2+4=0"), texte(").")],
      reponse: false,
      justification: [texte("Ici "), latex("u^2+5u+4=0"), texte(" donne "), latex("u=-1"), texte(" ou "), latex("u=-4"), texte(", toutes deux NÉGATIVES : les 4 solutions sont "), latex("z=\\pm i"), texte(" et "), latex("z=\\pm2i"), texte(", pas des réels.")],
    },
    {
      enonce: [texte("Pour "), latex("z^4+5z^2+4=0"), texte(", les 4 solutions sont "), latex("z=i,\\ z=-i,\\ z=2i,\\ z=-2i"), texte(".")],
      reponse: true,
      justification: [texte("Avec "), latex("u=-1"), texte(" ("), latex("z^2=-1\\Rightarrow z=\\pm i"), texte(") et "), latex("u=-4"), texte(" ("), latex("z^2=-4\\Rightarrow z=\\pm2i"), texte(").")],
    },
    {
      enonce: [texte("Dans ℂ, tout polynôme de degré "), latex("n"), texte(" ("), latex("n\\geq1"), texte(") admet exactement "), latex("n"), texte(" racines, comptées avec multiplicité (théorème fondamental de l'algèbre).")],
      reponse: true,
      justification: [texte("C'est le théorème fondamental de l'algèbre — vrai dans ℂ, contrairement à ℝ où certains polynômes n'ont aucune racine réelle.")],
    },
    {
      enonce: [texte("Dans ℂ, un polynôme de degré 4 peut n'admettre aucune racine.")],
      reponse: false,
      justification: [texte("Cela contredirait le théorème fondamental de l'algèbre : dans ℂ, un polynôme de degré 4 admet TOUJOURS 4 racines (avec multiplicité), jamais aucune.")],
    },
    {
      enonce: [texte("Si "), latex("z_0"), texte(" est une racine complexe non réelle d'un polynôme à coefficients RÉELS, alors son conjugué "), latex("\\bar z_0"), texte(" est aussi une racine de ce polynôme.")],
      reponse: true,
      justification: [texte("C'est un résultat classique : les racines non réelles d'un polynôme réel viennent toujours par paires conjuguées.")],
    },
    {
      enonce: [texte("Si "), latex("z_0"), texte(" est une racine complexe d'un polynôme à coefficients COMPLEXES quelconques (non tous réels), alors son conjugué "), latex("\\bar z_0"), texte(" est nécessairement aussi une racine.")],
      reponse: false,
      justification: [texte("Cette propriété exige des coefficients RÉELS — pour un polynôme à coefficients véritablement complexes, elle tombe en général en défaut.")],
    },
    {
      enonce: [texte("Factoriser un polynôme réel de degré 2 à discriminant négatif dans ℂ donne "), latex("a(z-z_0)(z-\\bar z_0)"), texte(", où "), latex("z_0"), texte(" et "), latex("\\bar z_0"), texte(" sont les deux racines complexes conjuguées.")],
      reponse: true,
      justification: [texte("C'est la factorisation directe à partir des deux racines trouvées.")],
    },
    {
      enonce: [texte("Le produit "), latex("(z-z_0)(z-\\bar z_0)"), texte(", pour "), latex("z_0"), texte(" complexe non réel, redonne bien un polynôme à COEFFICIENTS RÉELS en "), latex("z"), texte(".")],
      reponse: true,
      justification: [texte("Ce produit vaut "), latex("z^2-(z_0+\\bar z_0)z+z_0\\bar z_0"), texte(", et "), latex("z_0+\\bar z_0"), texte(" ainsi que "), latex("z_0\\bar z_0"), texte(" sont tous deux réels.")],
    },

    // --- Enrichissement (15 affirmations supplémentaires, nuances non couvertes ci-dessus) ---
    {
      enonce: [texte("Pour résoudre une équation linéaire faisant intervenir à la fois "), latex("z"), texte(" et "), latex("\\bar z"), texte(", on pose "), latex("z=x+iy"), texte(" et on identifie parties réelle et imaginaire, ce qui donne un système de 2 équations RÉELLES à 2 inconnues.")],
      reponse: true,
      justification: [texte("C'est la méthode standard : "), latex("z"), texte(" et "), latex("\\bar z"), texte(" ne peuvent pas être manipulés comme une seule inconnue, mais "), latex("x"), texte(" et "), latex("y"), texte(" le peuvent.")],
    },
    {
      enonce: [texte("Une équation linéaire en "), latex("z"), texte(" et "), latex("\\bar z"), texte(" se résout en isolant "), latex("z"), texte(" comme dans ℝ, en traitant "), latex("\\bar z"), texte(" comme une constante.")],
      reponse: false,
      justification: [latex("\\bar z"), texte(" dépend de "), latex("z"), texte(" : ce n'est jamais une constante indépendante. Il faut poser "), latex("z=x+iy"), texte(" et identifier les parties réelle et imaginaire.")],
    },
    {
      enonce: [texte("Pour "), latex("az^2+bz+c=0"), texte(" à coefficients COMPLEXES, le discriminant "), latex("\\Delta=b^2-4ac"), texte(" est en général complexe : il faut alors en calculer une racine carrée complexe "), latex("\\delta"), texte(" (méthode du système "), latex("x^2-y^2"), texte(" / "), latex("2xy"), texte("), puis "), latex("z=\\dfrac{-b\\pm\\delta}{2a}"), texte(".")],
      reponse: true,
      justification: [texte("La formule "), latex("\\dfrac{-b\\pm\\delta}{2a}"), texte(" reste valable avec des coefficients complexes, "), latex("\\delta"), texte(" désignant n'importe laquelle des 2 racines carrées complexes de "), latex("\\Delta"), texte(".")],
    },
    {
      enonce: [texte("Quand les coefficients de "), latex("az^2+bz+c=0"), texte(" sont complexes, on peut encore conclure « pas de solution » si "), latex("\\Delta"), texte(" n'est pas un réel positif.")],
      reponse: false,
      justification: [texte("Dans ℂ, tout "), latex("\\Delta"), texte(" (réel négatif ou franchement complexe) possède 2 racines carrées : l'équation admet TOUJOURS 2 solutions, jamais aucune.")],
    },
    {
      enonce: [texte("Quand "), latex("\\Delta"), texte(" est complexe (non réel), les 2 solutions de "), latex("az^2+bz+c=0"), texte(" sont toujours conjuguées l'une de l'autre.")],
      reponse: false,
      justification: [texte("Les racines ne viennent par paires conjuguées que si les COEFFICIENTS sont réels — ce qui est exclu ici, puisqu'un "), latex("\\Delta"), texte(" non réel suppose des coefficients complexes.")],
    },
    {
      enonce: [latex("z^2-(3+i)z+(2+2i)=0"), texte(" admet "), latex("z=2"), texte(" comme solution.")],
      reponse: true,
      justification: [texte("On remplace : "), latex("4-(3+i)\\times2+2+2i=4-6-2i+2+2i=0"), texte(".")],
    },
    {
      enonce: [texte("Pour "), latex("z^2-(3+i)z+(2+2i)=0"), texte(", la somme des 2 racines vaut "), latex("-(3+i)"), texte(".")],
      reponse: false,
      justification: [texte("La somme vaut "), latex("-b/a"), texte(" avec "), latex("b=-(3+i)"), texte(", soit "), latex("+(3+i)"), texte(" — un signe est oublié.")],
    },
    {
      enonce: [texte("Pour "), latex("z^2-(3+i)z+(2+2i)=0"), texte(", sachant que "), latex("z=2"), texte(" est solution, la seconde solution est "), latex("1-i"), texte(".")],
      reponse: false,
      justification: [texte("La somme des racines vaut "), latex("3+i"), texte(", donc la seconde est "), latex("(3+i)-2=1+i"), texte(", pas "), latex("1-i"), texte(" (vérification par le produit : "), latex("2(1+i)=2+2i"), texte(").")],
    },
    {
      enonce: [texte("Une équation RATIONNELLE en "), latex("z"), texte(" impose une condition d'existence : les valeurs de "), latex("z"), texte(" annulant le dénominateur sont exclues de l'ensemble des solutions.")],
      reponse: true,
      justification: [texte("La division par "), latex("0"), texte(" reste impossible dans ℂ comme dans ℝ : ces valeurs doivent être écartées avant de conclure.")],
    },
    {
      enonce: [texte("Une équation rationnelle en "), latex("z"), texte(" n'impose aucune condition d'existence, puisque dans ℂ toute division est possible.")],
      reponse: false,
      justification: [texte("Dans ℂ, tout complexe NON NUL est inversible, mais la division par "), latex("0"), texte(" reste impossible : la condition d'existence sur le dénominateur subsiste.")],
    },
    {
      enonce: [texte("Pour une équation de degré 4 à coefficients réels dont on repère une racine rationnelle évidente "), latex("r"), texte(", on divise le polynôme par "), latex("(z-r)"), texte(" pour se ramener au degré 3, puis on recommence.")],
      reponse: true,
      justification: [texte("C'est la méthode de la racine évidente + division polynomiale, qui abaisse le degré d'une unité à chaque racine trouvée.")],
    },
    {
      enonce: [texte("Les solutions de "), latex("z^4+1=0"), texte(" sont "), latex("z=\\pm1"), texte(" et "), latex("z=\\pm i"), texte(".")],
      reponse: false,
      justification: [texte("Aucune de ces 4 valeurs ne convient : "), latex("1^4+1=2"), texte(" et "), latex("i^4+1=1+1=2"), texte(", jamais "), latex("0"), texte(". Les vraies solutions sont "), latex("\\pm\\dfrac{\\sqrt2}{2}\\pm i\\dfrac{\\sqrt2}{2}"), texte(".")],
    },
    {
      enonce: [texte("Une équation du 2e degré à coefficients RÉELS avec "), latex("\\Delta=0"), texte(" admet 2 solutions complexes conjuguées distinctes.")],
      reponse: false,
      justification: [latex("\\Delta=0"), texte(" donne une racine RÉELLE DOUBLE "), latex("z=-b/(2a)"), texte(" — c'est "), latex("\\Delta<0"), texte(" (strictement) qui produit 2 solutions complexes conjuguées distinctes.")],
    },
    {
      enonce: [latex("z^4-16=0"), texte(" admet exactement 2 solutions dans ℂ : "), latex("z=2"), texte(" et "), latex("z=-2"), texte(".")],
      reponse: false,
      justification: [texte("En posant "), latex("u=z^2"), texte(" : "), latex("u^2=16"), texte(" donne "), latex("u=4"), texte(" ET "), latex("u=-4"), texte(", donc 4 solutions "), latex("\\pm2"), texte(" et "), latex("\\pm2i"), texte(" — la branche négative est oubliée ici.")],
    },
    {
      enonce: [latex("z^4-16=0"), texte(" admet 4 solutions dans ℂ : "), latex("2,\\ -2,\\ 2i,\\ -2i"), texte(".")],
      reponse: true,
      justification: [latex("u=z^2"), texte(" donne "), latex("u=4"), texte(" ("), latex("z=\\pm2"), texte(") et "), latex("u=-4"), texte(" ("), latex("z=\\pm2i"), texte("), et l'on vérifie "), latex("(2i)^4=16"), texte(".")],
    },
  ],

  // ==========================================================================
  // Thème 4 — Forme trigonométrique, module, argument et opérations, ref 6gen37
  // ==========================================================================
  formeTrigonometrique: [
    {
      enonce: [texte("Le module de "), latex("z=a+bi"), texte(" est "), latex("|z|=\\sqrt{a^2+b^2}"), texte(".")],
      reponse: true,
      justification: [texte("C'est la définition du module, distance du point à l'origine.")],
    },
    {
      enonce: [texte("Le module de "), latex("z=a+bi"), texte(" est "), latex("|z|=a^2+b^2"), texte(".")],
      reponse: false,
      justification: [texte("Il manque la racine carrée : "), latex("a^2+b^2"), texte(" est le module AU CARRÉ, pas le module lui-même.")],
    },
    {
      enonce: [texte("Pour "), latex("z=3+4i"), texte(", "), latex("|z|=5"), texte(".")],
      reponse: true,
      justification: [texte("On a "), latex("\\sqrt{3^2+4^2}=\\sqrt{25}=5"), texte(".")],
    },
    {
      enonce: [texte("L'argument d'un nombre complexe non nul est l'angle (à "), latex("2\\pi"), texte(" près) que fait le vecteur associé avec l'axe des réels positifs.")],
      reponse: true,
      justification: [texte("C'est la définition géométrique de "), latex("\\arg(z)"), texte(".")],
    },
    {
      enonce: [texte("L'argument d'un nombre complexe est toujours compris entre "), latex("0"), texte(" et "), latex("\\pi"), texte(".")],
      reponse: false,
      justification: [texte("L'argument est défini modulo "), latex("2\\pi"), texte(" (souvent choisi dans "), latex("]-\\pi;\\pi]"), texte("), pas restreint à "), latex("[0;\\pi]"), texte(".")],
    },
    {
      enonce: [texte("Dans la forme trigonométrique "), latex("z=r(\\cos\\theta+i\\sin\\theta)"), texte(", "), latex("r"), texte(" peut être négatif, par exemple si "), latex("z"), texte(" est situé dans le troisième quadrant.")],
      reponse: false,
      justification: [texte("Le module "), latex("r=|z|"), texte(" est toujours positif ou nul, jamais négatif — c'est l'angle "), latex("\\theta"), texte(" qui code la position angulaire (quadrant), pas le signe de "), latex("r"), texte(".")],
    },
    {
      enonce: [texte("La forme exponentielle de "), latex("z"), texte(" est "), latex("z=re^{i\\theta}"), texte(", avec les mêmes "), latex("r"), texte(" et "), latex("\\theta"), texte(" que la forme trigonométrique.")],
      reponse: true,
      justification: [texte("C'est la formule d'Euler appliquée à l'écriture de "), latex("z"), texte(" : "), latex("e^{i\\theta}=\\cos\\theta+i\\sin\\theta"), texte(".")],
    },
    {
      enonce: [texte("Pour multiplier deux complexes sous forme trigonométrique/exponentielle, on multiplie les modules et on ADDITIONNE les arguments.")],
      reponse: true,
      justification: [texte("C'est la propriété centrale de la forme exponentielle : "), latex("r_1e^{i\\theta_1}\\cdot r_2e^{i\\theta_2}=r_1r_2\\,e^{i(\\theta_1+\\theta_2)}"), texte(".")],
    },
    {
      enonce: [texte("Pour multiplier deux complexes sous forme trigonométrique/exponentielle, on ADDITIONNE les modules et on MULTIPLIE les arguments.")],
      reponse: false,
      justification: [texte("C'est l'inverse de la vraie règle : les modules se MULTIPLIENT, les arguments s'ADDITIONNENT — jamais le contraire.")],
    },
    {
      enonce: [texte("Pour diviser deux complexes sous forme trigonométrique/exponentielle, on divise les modules et on SOUSTRAIT les arguments (numérateur moins dénominateur).")],
      reponse: true,
      justification: [texte("C'est la propriété symétrique du produit : "), latex("\\dfrac{r_1e^{i\\theta_1}}{r_2e^{i\\theta_2}}=\\dfrac{r_1}{r_2}\\,e^{i(\\theta_1-\\theta_2)}"), texte(".")],
    },
    {
      enonce: [texte("Pour diviser deux complexes sous forme trigonométrique/exponentielle, on soustrait les modules et on divise les arguments.")],
      reponse: false,
      justification: [texte("C'est encore l'inverse de la vraie règle : les modules se DIVISENT, les arguments se SOUSTRAIENT.")],
    },
    {
      enonce: [texte("Si "), latex("z_1=2e^{i\\pi/3}"), texte(" et "), latex("z_2=3e^{i\\pi/6}"), texte(", alors "), latex("z_1z_2=6e^{i\\pi/2}"), texte(".")],
      reponse: true,
      justification: [texte("Modules : "), latex("2\\times3=6"), texte(". Arguments : "), latex("\\pi/3+\\pi/6=\\pi/2"), texte(".")],
    },
    {
      enonce: [texte("Si "), latex("z_1=2e^{i\\pi/3}"), texte(" et "), latex("z_2=3e^{i\\pi/6}"), texte(", alors "), latex("z_1z_2=5e^{i\\pi/2}"), texte(".")],
      reponse: false,
      justification: [texte("Les modules se MULTIPLIENT ("), latex("2\\times3=6"), texte("), ils ne s'additionnent pas ("), latex("2+3=5"), texte(" est faux ici).")],
    },
    {
      enonce: [texte("Pour "), latex("a>0"), texte(", l'argument de "), latex("a+bi"), texte(" (avec "), latex("b"), texte(" réel quelconque) est "), latex("\\arg(z)=\\arctan(b/a)"), texte(".")],
      reponse: true,
      justification: [texte("Quand "), latex("a>0"), texte(" (1er ou 4e quadrant), la formule naïve "), latex("\\arctan(b/a)"), texte(" donne directement le bon argument, sans correction.")],
    },
    {
      enonce: [texte("Pour tout complexe "), latex("a+bi"), texte(" avec "), latex("a<0"), texte(", l'argument est aussi "), latex("\\arctan(b/a)"), texte(", sans aucune correction.")],
      reponse: false,
      justification: [texte("Piège classique de quadrant : quand "), latex("a<0"), texte(", il faut AJOUTER (ou soustraire) "), latex("\\pi"), texte(" à "), latex("\\arctan(b/a)"), texte(" pour obtenir le bon argument.")],
    },
    {
      enonce: [texte("Pour "), latex("z=-1+i"), texte(" ("), latex("a<0"), texte("), il faut ajouter (ou soustraire) "), latex("\\pi"), texte(" à la valeur "), latex("\\arctan(b/a)"), texte(" pour obtenir l'argument correct.")],
      reponse: true,
      justification: [texte("C'est exactement la correction de quadrant nécessaire dès que "), latex("a<0"), texte(".")],
    },
    {
      enonce: [latex("|z_1\\cdot z_2| = |z_1|\\cdot|z_2|"), texte(", pour tous complexes "), latex("z_1,z_2"), texte(".")],
      reponse: true,
      justification: [texte("Le module d'un produit est le produit des modules — conséquence directe de la règle sur les formes exponentielles.")],
    },
    {
      enonce: [latex("\\arg(z_1\\cdot z_2) = \\arg(z_1)\\cdot\\arg(z_2)"), texte(" (produit des arguments), pour tous complexes non nuls "), latex("z_1,z_2"), texte(".")],
      reponse: false,
      justification: [texte("Les arguments s'ADDITIONNENT dans un produit, ils ne se multiplient jamais entre eux.")],
    },
    {
      enonce: [texte("Deux nombres complexes non nuls ont le même module et des arguments opposés si, et seulement si, ils sont conjugués l'un de l'autre.")],
      reponse: true,
      justification: [texte("Le conjugué de "), latex("re^{i\\theta}"), texte(" est "), latex("re^{-i\\theta}"), texte(" : même module, argument opposé.")],
    },
    {
      enonce: [texte("Un angle multiple de "), latex("\\pi/6"), texte(" ou "), latex("\\pi/4"), texte(" est qualifié de « remarquable » car son cosinus et son sinus s'expriment exactement (racines, fractions), sans approximation décimale.")],
      reponse: true,
      justification: [texte("C'est la définition utilisée sur toute la plateforme pour cette banque d'angles.")],
    },

    // --- Enrichissement (15 affirmations supplémentaires, nuances non couvertes ci-dessus) ---
    {
      enonce: [latex("|z^n| = |z|^n"), texte(", pour tout complexe "), latex("z"), texte(" et tout entier "), latex("n\\geq1"), texte(".")],
      reponse: true,
      justification: [texte("Le module d'un produit est le produit des modules, appliqué "), latex("n"), texte(" fois au même facteur "), latex("z"), texte(".")],
    },
    {
      enonce: [latex("\\arg(z^n) \\equiv \\arg(z)"), texte(" (l'argument est inchangé par élévation à la puissance "), latex("n"), texte("), pour "), latex("z"), texte(" non nul.")],
      reponse: false,
      justification: [texte("Les arguments s'ADDITIONNENT dans un produit : "), latex("\\arg(z^n)\\equiv n\\cdot\\arg(z)\\pmod{2\\pi}"), texte(", jamais "), latex("\\arg(z)"), texte(" seul (sauf si "), latex("n=1"), texte(").")],
    },
    {
      enonce: [latex("\\arg(z^n) \\equiv n\\cdot\\arg(z) \\pmod{2\\pi}"), texte(", pour "), latex("z"), texte(" non nul et "), latex("n"), texte(" entier.")],
      reponse: true,
      justification: [texte("C'est la formule de Moivre écrite en termes d'argument : "), latex("(re^{i\\theta})^n=r^ne^{in\\theta}"), texte(".")],
    },
    {
      enonce: [texte("La forme trigonométrique de "), latex("z=1+i\\sqrt3"), texte(" est "), latex("2\\left(\\cos\\dfrac{\\pi}{3}+i\\sin\\dfrac{\\pi}{3}\\right)"), texte(".")],
      reponse: true,
      justification: [latex("|z|=\\sqrt{1+3}=2"), texte(" et "), latex("\\cos\\theta=1/2"), texte(", "), latex("\\sin\\theta=\\sqrt3/2"), texte(", donc "), latex("\\theta=\\pi/3"), texte(".")],
    },
    {
      enonce: [texte("La forme trigonométrique de "), latex("z=1+i\\sqrt3"), texte(" est "), latex("2\\left(\\cos\\dfrac{\\pi}{6}+i\\sin\\dfrac{\\pi}{6}\\right)"), texte(".")],
      reponse: false,
      justification: [texte("Le module "), latex("2"), texte(" est correct, mais "), latex("2(\\cos(\\pi/6)+i\\sin(\\pi/6))=\\sqrt3+i"), texte(", pas "), latex("1+i\\sqrt3"), texte(" : les rôles de "), latex("\\cos"), texte(" et "), latex("\\sin"), texte(" sont intervertis, l'argument correct est "), latex("\\pi/3"), texte(".")],
    },
    {
      enonce: [latex("|z|=0"), texte(" si, et seulement si, "), latex("z=0"), texte(" — et l'argument de "), latex("0"), texte(" n'est pas défini.")],
      reponse: true,
      justification: [latex("\\sqrt{a^2+b^2}=0"), texte(" impose "), latex("a=b=0"), texte(" ; et le point "), latex("O"), texte(" ne détermine aucune direction, donc aucun angle.")],
    },
    {
      enonce: [texte("Le nombre "), latex("0"), texte(" admet "), latex("0"), texte(" comme argument, par convention.")],
      reponse: false,
      justification: [texte("L'argument n'est défini que pour un complexe NON NUL : le vecteur nul ne fait aucun angle avec l'axe des réels.")],
    },
    {
      enonce: [texte("Le réel "), latex("-2"), texte(" s'écrit sous forme trigonométrique "), latex("2(\\cos\\pi+i\\sin\\pi)"), texte(".")],
      reponse: true,
      justification: [latex("|-2|=2"), texte(" et le point est sur l'axe des réels négatifs, d'argument "), latex("\\pi"), texte(" : "), latex("2(-1+0i)=-2"), texte(".")],
    },
    {
      enonce: [latex("|z_1+z_2| = |z_1|+|z_2|"), texte(", pour tous complexes "), latex("z_1,z_2"), texte(".")],
      reponse: false,
      justification: [texte("C'est une INÉGALITÉ ("), latex("|z_1+z_2|\\leq|z_1|+|z_2|"), texte("), avec égalité seulement si les deux ont le même argument : "), latex("z_1=1"), texte(", "), latex("z_2=-1"), texte(" donne "), latex("0\\neq2"), texte(".")],
    },
    {
      enonce: [latex("|\\bar z| = -|z|"), texte(".")],
      reponse: false,
      justification: [texte("Un module n'est jamais négatif : "), latex("|\\bar z|=\\sqrt{a^2+(-b)^2}=\\sqrt{a^2+b^2}=|z|"), texte(" — conjuguer ne change pas le module, seulement le signe de l'argument.")],
    },
    {
      enonce: [texte("Pour "), latex("z"), texte(" non nul de module "), latex("r"), texte(", le module de "), latex("1/z"), texte(" vaut encore "), latex("r"), texte(".")],
      reponse: false,
      justification: [texte("Le module d'un quotient est le quotient des modules : "), latex("|1/z|=1/r"), texte(", jamais "), latex("r"), texte(" (sauf si "), latex("r=1"), texte(").")],
    },
    {
      enonce: [latex("e^{i\\pi}=1"), texte(".")],
      reponse: false,
      justification: [latex("e^{i\\pi}=\\cos\\pi+i\\sin\\pi=-1+0i=-1"), texte(" : c'est l'identité d'Euler "), latex("e^{i\\pi}+1=0"), texte(", jamais "), latex("+1"), texte(".")],
    },
    {
      enonce: [texte("Un complexe non nul est un IMAGINAIRE PUR si, et seulement si, son argument est un multiple de "), latex("\\pi"), texte(".")],
      reponse: false,
      justification: [texte("Un argument multiple de "), latex("\\pi"), texte(" caractérise les complexes RÉELS (axe horizontal) ; un imaginaire pur non nul vérifie "), latex("\\arg(z)\\equiv\\pi/2\\pmod\\pi"), texte(" (axe vertical).")],
    },
    {
      enonce: [texte("Un complexe non nul "), latex("z"), texte(" est RÉEL si, et seulement si, "), latex("\\arg(z)\\equiv0\\pmod\\pi"), texte(".")],
      reponse: true,
      justification: [texte("Modulo "), latex("\\pi"), texte(", les arguments "), latex("0"), texte(" (réels positifs) et "), latex("\\pi"), texte(" (réels négatifs) sont réunis : c'est exactement l'axe des réels privé de "), latex("O"), texte(".")],
    },
    {
      enonce: [texte("Deux complexes ayant le même module sont nécessairement égaux.")],
      reponse: false,
      justification: [texte("Un même module ne fixe que le CERCLE sur lequel se trouve le point : "), latex("1"), texte(" et "), latex("i"), texte(" ont tous deux pour module "), latex("1"), texte(" sans être égaux — il faut aussi le même argument.")],
    },
  ],

  // ==========================================================================
  // Thème 5 — Formule de Moivre, ref 6gen38
  // ==========================================================================
  formuleMoivre: [
    {
      enonce: [texte("La formule de Moivre énonce que "), latex("(\\cos\\theta+i\\sin\\theta)^n = \\cos(n\\theta)+i\\sin(n\\theta)"), texte(", pour tout entier "), latex("n"), texte(".")],
      reponse: true,
      justification: [texte("C'est l'énoncé exact de la formule de Moivre.")],
    },
    {
      enonce: [texte("La formule de Moivre énonce que "), latex("(\\cos\\theta+i\\sin\\theta)^n = n(\\cos\\theta+i\\sin\\theta)"), texte(".")],
      reponse: false,
      justification: [texte("C'est une confusion entre puissance et multiplication : l'exposant "), latex("n"), texte(" porte sur toute l'expression ET sur l'angle "), latex("(n\\theta)"), texte(", il ne multiplie jamais simplement l'expression par "), latex("n"), texte(".")],
    },
    {
      enonce: [texte("La formule de Moivre se démontre en écrivant "), latex("\\cos\\theta+i\\sin\\theta = e^{i\\theta}"), texte(" et en utilisant les propriétés de l'exponentielle.")],
      reponse: true,
      justification: [texte("C'est la démonstration standard : "), latex("(e^{i\\theta})^n=e^{in\\theta}"), texte(", qui redonne "), latex("\\cos(n\\theta)+i\\sin(n\\theta)"), texte(" via la formule d'Euler.")],
    },
    {
      enonce: [texte("Pour développer "), latex("\\cos(nx)"), texte(" et "), latex("\\sin(nx)"), texte(" en fonction de "), latex("\\cos(x)"), texte(" et "), latex("\\sin(x)"), texte(", on développe "), latex("(\\cos x+i\\sin x)^n"), texte(" par le binôme de Newton, puis on sépare parties réelle et imaginaire.")],
      reponse: true,
      justification: [texte("C'est la méthode systématique de ce générateur : développement binomial, puis identification.")],
    },
    {
      enonce: [texte("Pour développer "), latex("\\cos(nx)"), texte(" et "), latex("\\sin(nx)"), texte(", on développe "), latex("(\\cos x+i\\sin x)^n"), texte(" par le binôme, puis on additionne simplement tous les termes obtenus sans les séparer.")],
      reponse: false,
      justification: [texte("Il faut impérativement SÉPARER les termes réels (partie "), latex("\\cos(nx)"), texte(") des termes imaginaires (partie "), latex("\\sin(nx)"), texte("), jamais les additionner en bloc.")],
    },
    {
      enonce: [texte("Dans le développement de "), latex("(\\cos x+i\\sin x)^n"), texte(" par le binôme, chaque terme contient un facteur "), latex("i^k"), texte(" qu'il faut simplifier selon le cycle "), latex("i^0=1,\\ i^1=i,\\ i^2=-1,\\ i^3=-i"), texte(".")],
      reponse: true,
      justification: [texte("Chaque terme du binôme contient "), latex("(i\\sin x)^k=i^k\\sin^k x"), texte(", et "), latex("i^k"), texte(" doit être résolu selon ce cycle.")],
    },
    {
      enonce: [texte("Dans ce développement, tous les termes "), latex("i^k"), texte(" valent "), latex("1"), texte(", quelle que soit la valeur de "), latex("k"), texte(".")],
      reponse: false,
      justification: [texte("Piège central du générateur : "), latex("i^k"), texte(" vaut "), latex("1,\\ i,\\ -1"), texte(" ou "), latex("-i"), texte(" selon "), latex("k"), texte(" modulo 4 — jamais toujours "), latex("1"), texte(".")],
    },
    {
      enonce: [texte("Les termes où "), latex("k"), texte(" est PAIR ("), latex("k=0,2,4,\\dots"), texte(") contribuent à la partie RÉELLE du développement, une fois "), latex("i^k"), texte(" simplifié.")],
      reponse: true,
      justification: [texte("Pour "), latex("k"), texte(" pair, "), latex("i^k=\\pm1"), texte(", un réel : ces termes forment la partie réelle "), latex("\\cos(nx)"), texte(".")],
    },
    {
      enonce: [texte("Les termes où "), latex("k"), texte(" est PAIR contribuent à la partie IMAGINAIRE du développement.")],
      reponse: false,
      justification: [texte("C'est l'inverse : les "), latex("k"), texte(" PAIRS donnent la partie RÉELLE, les "), latex("k"), texte(" IMPAIRS donnent la partie imaginaire.")],
    },
    {
      enonce: [texte("Les termes où "), latex("k"), texte(" est IMPAIR ("), latex("k=1,3,5,\\dots"), texte(") contribuent à la partie IMAGINAIRE du développement, une fois "), latex("i^k"), texte(" simplifié.")],
      reponse: true,
      justification: [texte("Pour "), latex("k"), texte(" impair, "), latex("i^k=\\pm i"), texte(", un imaginaire pur : ces termes forment la partie "), latex("i\\sin(nx)"), texte(".")],
    },
    {
      enonce: [texte("Pour "), latex("n=2"), texte(", la formule de Moivre donne "), latex("\\cos(2x)=\\cos^2x-\\sin^2x"), texte(" et "), latex("\\sin(2x)=2\\sin x\\cos x"), texte(".")],
      reponse: true,
      justification: [texte("Ce sont les formules usuelles de l'angle double, retrouvées ici via le binôme d'ordre 2.")],
    },
    {
      enonce: [texte("Pour "), latex("n=2"), texte(", la formule de Moivre donne "), latex("\\cos(2x)=2\\cos x\\sin x"), texte(" et "), latex("\\sin(2x)=\\cos^2x-\\sin^2x"), texte(".")],
      reponse: false,
      justification: [texte("Les 2 formules sont ÉCHANGÉES : c'est "), latex("\\cos(2x)"), texte(" qui vaut "), latex("\\cos^2x-\\sin^2x"), texte(", et "), latex("\\sin(2x)"), texte(" qui vaut "), latex("2\\sin x\\cos x"), texte(".")],
    },
    {
      enonce: [texte("Pour "), latex("n=3"), texte(", on obtient "), latex("\\cos(3x)=\\cos^3x-3\\cos x\\sin^2x"), texte(".")],
      reponse: true,
      justification: [texte("En développant "), latex("(\\cos x+i\\sin x)^3"), texte(" et en isolant la partie réelle (termes "), latex("k=0"), texte(" et "), latex("k=2"), texte("), on obtient exactement cette expression.")],
    },
    {
      enonce: [texte("Pour "), latex("n=3"), texte(", on obtient "), latex("\\sin(3x)=3\\sin^3x-\\cos^3x"), texte(".")],
      reponse: false,
      justification: [texte("La bonne formule est "), latex("\\sin(3x)=3\\cos^2x\\sin x-\\sin^3x"), texte(", pas celle-ci.")],
    },
    {
      enonce: [texte("Pour "), latex("n=3"), texte(", on obtient "), latex("\\sin(3x)=3\\cos^2x\\sin x-\\sin^3x"), texte(".")],
      reponse: true,
      justification: [texte("C'est la partie imaginaire (termes "), latex("k=1"), texte(" et "), latex("k=3"), texte(") du développement de "), latex("(\\cos x+i\\sin x)^3"), texte(".")],
    },
    {
      enonce: [texte("Le coefficient binomial "), latex("C(n,k)"), texte(" apparaissant dans le développement de "), latex("(\\cos x+i\\sin x)^n"), texte(" se calcule de la même façon que dans le développement classique de "), latex("(a+b)^n"), texte(".")],
      reponse: true,
      justification: [texte("Le binôme de Newton s'applique ici exactement comme pour "), latex("(a+b)^n"), texte(", avec "), latex("a=\\cos x"), texte(" et "), latex("b=i\\sin x"), texte(".")],
    },
    {
      enonce: [texte("Le coefficient binomial "), latex("C(n,k)"), texte(" dépend de "), latex("x"), texte(", et change donc pour chaque valeur de l'angle.")],
      reponse: false,
      justification: [texte("Les coefficients binomiaux sont purement COMBINATOIRES (ils ne dépendent que de "), latex("n"), texte(" et "), latex("k"), texte("), jamais de "), latex("x"), texte(".")],
    },
    {
      enonce: [texte("Oublier UN SEUL signe négatif provenant d'un "), latex("i^2"), texte(" ou d'un "), latex("i^4"), texte(" dans le développement (par exemple traiter "), latex("i^2"), texte(" comme "), latex("+1"), texte(" au lieu de "), latex("-1"), texte(") rend le résultat final incorrect, même si tous les autres termes sont corrects.")],
      reponse: true,
      justification: [texte("C'est le piège central : chaque puissance de "), latex("i"), texte(" doit être résolue INDIVIDUELLEMENT, une seule erreur de signe suffit à fausser le résultat.")],
    },
    {
      enonce: [texte("La formule de Moivre reste valable aussi bien pour "), latex("n"), texte(" positif que pour "), latex("n"), texte(" négatif (entier).")],
      reponse: true,
      justification: [texte("La démonstration via "), latex("(e^{i\\theta})^n=e^{in\\theta}"), texte(" reste valable pour tout entier "), latex("n"), texte(", positif ou négatif.")],
    },
    {
      enonce: [texte("La formule de Moivre n'est valable que pour "), latex("n"), texte(" pair, jamais pour "), latex("n"), texte(" impair.")],
      reponse: false,
      justification: [texte("Elle est valable pour TOUT entier "), latex("n"), texte(", pair ou impair (c'est même pour "), latex("n"), texte(" impair, comme "), latex("n=3"), texte(", qu'elle est utilisée dans ce générateur).")],
    },

    // --- Enrichissement (15 affirmations supplémentaires, nuances non couvertes ci-dessus) ---
    {
      enonce: [texte("Le développement de "), latex("(\\cos x+i\\sin x)^n"), texte(" par le binôme comporte exactement "), latex("n+1"), texte(" termes.")],
      reponse: true,
      justification: [texte("L'indice "), latex("k"), texte(" parcourt "), latex("0,1,\\dots,n"), texte(", soit "), latex("n+1"), texte(" valeurs — une par terme.")],
    },
    {
      enonce: [texte("Le développement de "), latex("(\\cos x+i\\sin x)^n"), texte(" comporte exactement "), latex("n"), texte(" termes.")],
      reponse: false,
      justification: [texte("Il en comporte "), latex("n+1"), texte(" : "), latex("k"), texte(" va de "), latex("0"), texte(" à "), latex("n"), texte(" INCLUS — oublier le terme "), latex("k=0"), texte(" est l'erreur classique.")],
    },
    {
      enonce: [texte("Pour "), latex("n=4"), texte(" : "), latex("\\cos(4x)=\\cos^4x-6\\cos^2x\\sin^2x+\\sin^4x"), texte(".")],
      reponse: true,
      justification: [texte("Partie réelle des termes "), latex("k=0,2,4"), texte(" : "), latex("\\cos^4x"), texte(", "), latex("\\binom{4}{2}\\cos^2x\\,i^2\\sin^2x=-6\\cos^2x\\sin^2x"), texte(", et "), latex("i^4\\sin^4x=\\sin^4x"), texte(".")],
    },
    {
      enonce: [texte("Pour "), latex("n=4"), texte(" : "), latex("\\sin(4x)=4\\cos^3x\\sin x+4\\cos x\\sin^3x"), texte(".")],
      reponse: false,
      justification: [texte("Le terme "), latex("k=3"), texte(" contient "), latex("i^3=-i"), texte(", donc un signe MOINS : "), latex("\\sin(4x)=4\\cos^3x\\sin x-4\\cos x\\sin^3x"), texte(".")],
    },
    {
      enonce: [texte("Pour "), latex("n=4"), texte(" : "), latex("\\sin(4x)=4\\cos^3x\\sin x-4\\cos x\\sin^3x"), texte(".")],
      reponse: true,
      justification: [texte("Partie imaginaire des termes "), latex("k=1"), texte(" ("), latex("4\\cos^3x\\cdot i\\sin x"), texte(") et "), latex("k=3"), texte(" ("), latex("4\\cos x\\cdot i^3\\sin^3x=-4i\\cos x\\sin^3x"), texte(").")],
    },
    {
      enonce: [texte("Dans le développement de "), latex("(\\cos x+i\\sin x)^5"), texte(", le terme d'indice "), latex("k=2"), texte(" est réel POSITIF, car "), latex("i^2\\binom{5}{2}=+10"), texte(".")],
      reponse: false,
      justification: [latex("i^2=-1"), texte(", donc ce terme vaut "), latex("-10\\cos^3x\\sin^2x"), texte(" : il est bien réel, mais de coefficient NÉGATIF.")],
    },
    {
      enonce: [texte("Dans le développement de "), latex("(\\cos x+i\\sin x)^5"), texte(", le terme d'indice "), latex("k=2"), texte(" vaut "), latex("-10\\cos^3x\\sin^2x"), texte(".")],
      reponse: true,
      justification: [latex("\\binom{5}{2}=10"), texte(", "), latex("\\cos^{5-2}x=\\cos^3x"), texte(" et "), latex("(i\\sin x)^2=-\\sin^2x"), texte(", d'où "), latex("-10\\cos^3x\\sin^2x"), texte(".")],
    },
    {
      enonce: [texte("Le coefficient binomial "), latex("\\binom{6}{3}"), texte(" vaut "), latex("15"), texte(".")],
      reponse: false,
      justification: [latex("\\binom{6}{3}=\\dfrac{6\\times5\\times4}{3\\times2\\times1}=20"), texte(" — "), latex("15"), texte(" est la valeur de "), latex("\\binom{6}{2}"), texte(".")],
    },
    {
      enonce: [texte("Pour "), latex("n=6"), texte(", le terme d'indice "), latex("k=3"), texte(" a pour coefficient binomial "), latex("20"), texte(" et, comme "), latex("i^3=-i"), texte(", il contribue à "), latex("\\sin(6x)"), texte(" par "), latex("-20\\cos^3x\\sin^3x"), texte(".")],
      reponse: true,
      justification: [latex("\\binom{6}{3}=20"), texte(" et "), latex("(i\\sin x)^3=-i\\sin^3x"), texte(", donc le terme vaut "), latex("-20i\\cos^3x\\sin^3x"), texte(" : sa partie imaginaire est "), latex("-20\\cos^3x\\sin^3x"), texte(".")],
    },
    {
      enonce: [texte("La formule de Moivre permet aussi d'écrire "), latex("(\\cos x+i\\sin x)^n=\\cos^nx+i\\sin^nx"), texte(".")],
      reponse: false,
      justification: [texte("Une puissance ne se distribue jamais sur une somme : le développement fait apparaître "), latex("n+1"), texte(" termes croisés, et le résultat est "), latex("\\cos(nx)+i\\sin(nx)"), texte(" — l'exposant porte sur l'ANGLE, pas sur chaque fonction.")],
    },
    {
      enonce: [texte("Dans chaque terme du développement de "), latex("(\\cos x+i\\sin x)^n"), texte(", la somme des exposants de "), latex("\\cos x"), texte(" et de "), latex("\\sin x"), texte(" vaut toujours "), latex("n"), texte(".")],
      reponse: true,
      justification: [texte("Le terme d'indice "), latex("k"), texte(" est en "), latex("\\cos^{n-k}x\\cdot\\sin^kx"), texte(" : la somme des exposants vaut "), latex("(n-k)+k=n"), texte(", pour tout "), latex("k"), texte(".")],
    },
    {
      enonce: [texte("Dans le développement de "), latex("(\\cos x+i\\sin x)^n"), texte(", tous les termes portent le même signe.")],
      reponse: false,
      justification: [texte("Les signes suivent le cycle de "), latex("i^k"), texte(" ("), latex("+,+,-,-,+,+,\\dots"), texte(" une fois "), latex("i"), texte(" mis en facteur) : ils alternent par paires, jamais tous identiques.")],
    },
    {
      enonce: [texte("Les identités obtenues par Moivre (par exemple "), latex("\\cos(3x)=\\cos^3x-3\\cos x\\sin^2x"), texte(") ne sont valables que pour des angles remarquables "), latex("x"), texte(".")],
      reponse: false,
      justification: [texte("Ce sont des identités ALGÉBRIQUES, valables pour TOUT réel "), latex("x"), texte(" — le caractère remarquable de l'angle n'intervient jamais dans le développement binomial.")],
    },
    {
      enonce: [texte("La formule de Moivre s'applique telle quelle à un complexe de module quelconque : "), latex("(r\\cos\\theta+ir\\sin\\theta)^n=\\cos(n\\theta)+i\\sin(n\\theta)"), texte(".")],
      reponse: false,
      justification: [texte("Le module s'élève lui aussi à la puissance "), latex("n"), texte(" : "), latex("(re^{i\\theta})^n=r^n(\\cos(n\\theta)+i\\sin(n\\theta))"), texte(" — la formule de Moivre au sens strict suppose "), latex("r=1"), texte(".")],
    },
    {
      enonce: [texte("Pour "), latex("n=3"), texte(", "), latex("\\cos(3x)=4\\cos^3x-3\\cos x"), texte(" et "), latex("\\cos(3x)=\\cos^3x-3\\cos x\\sin^2x"), texte(" sont deux formules différentes, qui ne peuvent pas être vraies en même temps.")],
      reponse: false,
      justification: [texte("Elles sont ÉGALES : en remplaçant "), latex("\\sin^2x=1-\\cos^2x"), texte(", on obtient "), latex("\\cos^3x-3\\cos x(1-\\cos^2x)=4\\cos^3x-3\\cos x"), texte(" — même identité, écrite en une ou deux fonctions.")],
    },
  ],

  // ==========================================================================
  // Thème 6 — Racines n-ièmes d'un nombre complexe, ref 6gen39
  // ==========================================================================
  racinesNiemes: [
    {
      enonce: [texte("Les "), latex("n"), texte(" racines n-ièmes d'un nombre complexe non nul "), latex("z=re^{i\\theta}"), texte(" sont données par "), latex("z_k = r^{1/n}\\,e^{i(\\theta+2k\\pi)/n}"), texte(", pour "), latex("k=0,1,\\dots,n-1"), texte(".")],
      reponse: true,
      justification: [texte("C'est la formule générale des racines n-ièmes d'un nombre complexe.")],
    },
    {
      enonce: [texte("Les racines n-ièmes de "), latex("z=re^{i\\theta}"), texte(" sont données par "), latex("z_k = r^{1/n}\\,e^{i(\\theta+k\\pi)/n}"), texte(", pour "), latex("k=0,1,\\dots,n-1"), texte(".")],
      reponse: false,
      justification: [texte("L'espacement angulaire correct est en "), latex("2k\\pi"), texte(", pas "), latex("k\\pi"), texte(" — cette formule erronée donnerait un espacement 2 fois trop petit entre les racines.")],
    },
    {
      enonce: [texte("Un nombre complexe non nul possède exactement "), latex("n"), texte(" racines n-ièmes distinctes ("), latex("n\\geq1"), texte(").")],
      reponse: true,
      justification: [texte("C'est une conséquence directe de la formule : les "), latex("n"), texte(" valeurs de "), latex("k=0,\\dots,n-1"), texte(" donnent "), latex("n"), texte(" angles distincts modulo "), latex("2\\pi"), texte(".")],
    },
    {
      enonce: [texte("Un nombre complexe non nul possède une infinité de racines n-ièmes distinctes.")],
      reponse: false,
      justification: [texte("Il en possède exactement "), latex("n"), texte(" — au-delà de "), latex("k=n-1"), texte(", les angles obtenus se répètent modulo "), latex("2\\pi"), texte(".")],
    },
    {
      enonce: [texte("Les "), latex("n"), texte(" racines n-ièmes de "), latex("z"), texte(" sont réparties régulièrement sur un cercle de centre "), latex("O"), texte(" et de rayon "), latex("r^{1/n}"), texte(", les angles entre 2 racines consécutives valant "), latex("2\\pi/n"), texte(".")],
      reponse: true,
      justification: [texte("C'est la traduction géométrique directe de la formule : chaque incrément de "), latex("k"), texte(" ajoute "), latex("2\\pi/n"), texte(" à l'angle.")],
    },
    {
      enonce: [texte("Les "), latex("n"), texte(" racines n-ièmes de "), latex("z"), texte(" sont réparties régulièrement sur un cercle, les angles entre 2 racines consécutives valant "), latex("\\pi/n"), texte(".")],
      reponse: false,
      justification: [texte("L'espacement correct est "), latex("2\\pi/n"), texte(", pas "), latex("\\pi/n"), texte(" — même erreur d'un facteur 2 que pour la formule générale.")],
    },
    {
      enonce: [texte("Toutes les racines n-ièmes d'un même nombre complexe non nul ont le même module "), latex("r^{1/n}"), texte(".")],
      reponse: true,
      justification: [texte("Le module ne dépend pas de "), latex("k"), texte(" dans la formule "), latex("z_k=r^{1/n}e^{i(\\theta+2k\\pi)/n}"), texte(" — seul l'argument change.")],
    },
    {
      enonce: [texte("Les racines n-ièmes d'un même nombre complexe ont des modules différents, seuls leurs arguments coïncident.")],
      reponse: false,
      justification: [texte("C'est l'inverse : le module est le MÊME pour toutes les racines, ce sont les arguments qui diffèrent.")],
    },
    {
      enonce: [texte("Les racines n-ièmes de l'unité (racines de "), latex("z^n=1"), texte(") sont les nombres "), latex("e^{2ik\\pi/n}"), texte(", pour "), latex("k=0,1,\\dots,n-1"), texte(".")],
      reponse: true,
      justification: [texte("C'est le cas particulier "), latex("\\theta=0"), texte(", "), latex("r=1"), texte(" de la formule générale.")],
    },
    {
      enonce: [texte("Pour "), latex("n=4"), texte(", les 4 racines quatrièmes de l'unité sont "), latex("1,\\ i,\\ -1,\\ -i"), texte(".")],
      reponse: true,
      justification: [texte("Ce sont "), latex("e^{2ik\\pi/4}"), texte(" pour "), latex("k=0,1,2,3"), texte(", soit les 4 points de l'axe.")],
    },
    {
      enonce: [texte("Pour "), latex("n=3"), texte(", les 3 racines cubiques de l'unité sont "), latex("1,\\ i,\\ -i"), texte(".")],
      reponse: false,
      justification: [texte("Les vraies racines cubiques de l'unité sont "), latex("1,\\ e^{2i\\pi/3},\\ e^{4i\\pi/3}"), texte(" — "), latex("i"), texte(" et "), latex("-i"), texte(" sont des racines QUATRIÈMES de l'unité, pas cubiques.")],
    },
    {
      enonce: [texte("Pour "), latex("n=2"), texte(", les 2 racines carrées de l'unité sont "), latex("1"), texte(" et "), latex("-1"), texte(".")],
      reponse: true,
      justification: [texte("Ce sont les 2 solutions de "), latex("z^2=1"), texte(".")],
    },
    {
      enonce: [texte("Si "), latex("k"), texte(" prend une valeur en dehors de "), latex("\\{0,1,\\dots,n-1\\}"), texte(" (par exemple "), latex("k=n"), texte("), la formule "), latex("z_k"), texte(" redonne l'une des "), latex("n"), texte(" racines déjà obtenues (angle congru modulo "), latex("2\\pi"), texte(").")],
      reponse: true,
      justification: [texte("Pour "), latex("k=n"), texte(", l'angle vaut "), latex("\\theta/n+2\\pi"), texte(", identique (modulo "), latex("2\\pi"), texte(") à l'angle obtenu pour "), latex("k=0"), texte(".")],
    },
    {
      enonce: [texte("Chaque valeur entière de "), latex("k"), texte(" ("), latex("k=0,1,2,\\dots"), texte(") donne une nouvelle racine n-ième distincte, sans jamais de répétition.")],
      reponse: false,
      justification: [texte("Piège classique : les racines se RÉPÈTENT tous les "), latex("n"), texte(" valeurs de "), latex("k"), texte(" — il n'y en a jamais plus de "), latex("n"), texte(" distinctes.")],
    },
    {
      enonce: [texte("Trouver les racines n-ièmes d'un nombre complexe nécessite d'abord d'écrire ce nombre sous forme trigonométrique ou exponentielle (module et argument).")],
      reponse: true,
      justification: [texte("La formule des racines n-ièmes s'exprime en fonction du module et de l'argument, jamais directement depuis la forme algébrique.")],
    },
    {
      enonce: [texte("Trouver les racines n-ièmes d'un nombre complexe se fait directement à partir de sa forme algébrique "), latex("a+bi"), texte(", sans passer par le module et l'argument.")],
      reponse: false,
      justification: [texte("La méthode passe nécessairement par le module et l'argument — il n'existe pas de formule directe utilisable depuis "), latex("a+bi"), texte(" seul.")],
    },
    {
      enonce: [texte("La somme des "), latex("n"), texte(" racines n-ièmes de l'unité ("), latex("n\\geq2"), texte(") vaut "), latex("0"), texte(".")],
      reponse: true,
      justification: [texte("C'est une identité classique (le coefficient de "), latex("z^{n-1}"), texte(" dans "), latex("z^n-1"), texte(" est nul, donc la somme des racines l'est aussi).")],
    },
    {
      enonce: [texte("Le produit des racines n-ièmes de "), latex("z"), texte(" n'est pas toujours égal à "), latex("z"), texte(" (par exemple si "), latex("n\\geq2"), texte(", il vaut généralement une autre valeur liée à "), latex("z"), texte(").")],
      reponse: true,
      justification: [texte("Exemple concret pour "), latex("n=2"), texte(" : les 2 racines carrées de "), latex("z_0"), texte(" sont "), latex("\\pm\\sqrt{z_0}"), texte(", de produit "), latex("-z_0"), texte(", pas "), latex("z_0"), texte(".")],
    },
    {
      enonce: [texte("Les racines n-ièmes de "), latex("-1"), texte(" sont exactement les racines n-ièmes de l'unité multipliées par une racine n-ième de "), latex("-1"), texte(" particulière, par exemple "), latex("e^{i\\pi/n}"), texte(".")],
      reponse: true,
      justification: [texte("C'est une propriété générale : les racines n-ièmes de "), latex("w"), texte(" s'obtiennent en multipliant UNE racine n-ième particulière de "), latex("w"), texte(" par chacune des racines n-ièmes de l'unité.")],
    },
    {
      enonce: [texte("Les racines n-ièmes de "), latex("-1"), texte(" sont toujours purement imaginaires, quel que soit "), latex("n"), texte(".")],
      reponse: false,
      justification: [texte("Contre-exemple pour "), latex("n=3"), texte(" : "), latex("z=-1"), texte(" lui-même est une racine cubique réelle de "), latex("-1"), texte(" (puisque "), latex("(-1)^3=-1"), texte("), pas purement imaginaire.")],
    },

    // --- Enrichissement (15 affirmations supplémentaires, nuances non couvertes ci-dessus) ---
    {
      enonce: [texte("Les 3 racines cubiques de l'unité sont "), latex("1"), texte(", "), latex("-\\dfrac12+i\\dfrac{\\sqrt3}{2}"), texte(" et "), latex("-\\dfrac12-i\\dfrac{\\sqrt3}{2}"), texte(".")],
      reponse: true,
      justification: [texte("Ce sont "), latex("e^{2ik\\pi/3}"), texte(" pour "), latex("k=0,1,2"), texte(" : "), latex("\\cos(2\\pi/3)=-1/2"), texte(" et "), latex("\\sin(2\\pi/3)=\\sqrt3/2"), texte(".")],
    },
    {
      enonce: [texte("Les 3 racines cubiques de "), latex("8"), texte(" sont "), latex("2"), texte(", "), latex("-2"), texte(" et "), latex("0"), texte(".")],
      reponse: false,
      justification: [latex("(-2)^3=-8"), texte(" et "), latex("0^3=0"), texte(" : aucune des deux ne convient. Les 3 racines cubiques de "), latex("8"), texte(" sont "), latex("2"), texte(", "), latex("-1+i\\sqrt3"), texte(" et "), latex("-1-i\\sqrt3"), texte(".")],
    },
    {
      enonce: [texte("Les 3 racines cubiques de "), latex("8"), texte(" sont "), latex("2"), texte(", "), latex("-1+i\\sqrt3"), texte(" et "), latex("-1-i\\sqrt3"), texte(".")],
      reponse: true,
      justification: [texte("Ce sont "), latex("2e^{2ik\\pi/3}"), texte(" : le module est "), latex("8^{1/3}=2"), texte(", et "), latex("2(-1/2\\pm i\\sqrt3/2)=-1\\pm i\\sqrt3"), texte(".")],
    },
    {
      enonce: [texte("Un réel strictement positif ne possède qu'UNE seule racine cubique : sa racine cubique réelle.")],
      reponse: false,
      justification: [texte("Dans ℝ oui, mais dans ℂ il en possède TROIS (une réelle et deux complexes conjuguées) — c'est tout l'objet de ce chapitre.")],
    },
    {
      enonce: [texte("L'équation "), latex("z^n=w^n"), texte(" ("), latex("w\\neq0"), texte(") équivaut à "), latex("z=w\\cdot\\zeta"), texte(", où "), latex("\\zeta"), texte(" parcourt les "), latex("n"), texte(" racines n-ièmes de l'unité.")],
      reponse: true,
      justification: [latex("z^n=w^n \\Leftrightarrow (z/w)^n=1"), texte(" : le quotient "), latex("z/w"), texte(" est donc exactement une racine n-ième de l'unité — c'est l'astuce qui évite de recalculer module et argument de "), latex("w^n"), texte(".")],
    },
    {
      enonce: [texte("L'équation "), latex("z^n=w^n"), texte(" ("), latex("w\\neq0"), texte(") n'admet que les 2 solutions "), latex("z=w"), texte(" et "), latex("z=-w"), texte(", quel que soit "), latex("n"), texte(".")],
      reponse: false,
      justification: [texte("Elle en admet "), latex("n"), texte(" (une par racine n-ième de l'unité). Pour "), latex("n=3"), texte(", "), latex("-w"), texte(" n'est d'ailleurs même pas solution : "), latex("(-w)^3=-w^3\\neq w^3"), texte(".")],
    },
    {
      enonce: [texte("Les racines sixièmes de l'unité forment un hexagone régulier inscrit dans le cercle unité, et contiennent à la fois "), latex("1"), texte(", "), latex("-1"), texte(" et les 2 racines cubiques NON RÉELLES de l'unité.")],
      reponse: true,
      justification: [texte("Ce sont les "), latex("e^{ik\\pi/3}"), texte(", "), latex("k=0,\\dots,5"), texte(" : on y trouve "), latex("k=0"), texte(" ("), latex("1"), texte("), "), latex("k=3"), texte(" ("), latex("-1"), texte(") et "), latex("k=2,4"), texte(" ("), latex("e^{2i\\pi/3}"), texte(" et "), latex("e^{4i\\pi/3}"), texte("), qui sont bien les racines cubiques non réelles.")],
    },
    {
      enonce: [texte("Les racines n-ièmes de l'unité ont toutes une partie réelle positive.")],
      reponse: false,
      justification: [texte("Elles sont réparties sur TOUT le cercle unité : par exemple "), latex("-1"), texte(" est racine 2e (et 4e, 6e...) de l'unité, de partie réelle négative.")],
    },
    {
      enonce: [texte("Si "), latex("z_0"), texte(" est une racine n-ième de "), latex("w"), texte(", les autres s'obtiennent en faisant tourner "), latex("z_0"), texte(" autour de l'origine, d'un angle "), latex("2\\pi/n"), texte(" à chaque fois.")],
      reponse: true,
      justification: [texte("Multiplier par "), latex("e^{2i\\pi/n}"), texte(" (module "), latex("1"), texte(") est exactement une rotation de centre "), latex("O"), texte(" et d'angle "), latex("2\\pi/n"), texte(", et conserve donc la propriété d'être racine n-ième de "), latex("w"), texte(".")],
    },
    {
      enonce: [texte("Le module commun des racines n-ièmes de "), latex("w"), texte(" vaut "), latex("|w|/n"), texte(".")],
      reponse: false,
      justification: [texte("C'est "), latex("|w|^{1/n}"), texte(" (la racine n-ième du module), pas le module DIVISÉ par "), latex("n"), texte(" — confondre les deux est l'erreur classique.")],
    },
    {
      enonce: [texte("Pour "), latex("w"), texte(" de module "), latex("16"), texte(" et "), latex("n=4"), texte(", toutes les racines quatrièmes de "), latex("w"), texte(" ont pour module "), latex("2"), texte(".")],
      reponse: true,
      justification: [latex("16^{1/4}=2"), texte(" (car "), latex("2^4=16"), texte(") — et ce module est le même pour les 4 racines.")],
    },
    {
      enonce: [texte("Pour "), latex("w"), texte(" de module "), latex("16"), texte(" et "), latex("n=4"), texte(", les racines quatrièmes de "), latex("w"), texte(" ont pour module "), latex("4"), texte(".")],
      reponse: false,
      justification: [latex("4=\\sqrt{16}"), texte(" est la racine CARRÉE, pas la racine QUATRIÈME : "), latex("16^{1/4}=2"), texte(" (on vérifie "), latex("4^4=256\\neq16"), texte(").")],
    },
    {
      enonce: [texte("La somme des "), latex("n"), texte(" racines n-ièmes d'un complexe "), latex("w"), texte(" quelconque ("), latex("n\\geq2"), texte(") vaut "), latex("w"), texte(".")],
      reponse: false,
      justification: [texte("Cette somme vaut "), latex("0"), texte(", jamais "), latex("w"), texte(" : les racines s'écrivent "), latex("z_0\\zeta_k"), texte(", donc leur somme est "), latex("z_0"), texte(" fois la somme des racines de l'unité, qui est nulle.")],
    },
    {
      enonce: [texte("Le produit des "), latex("n"), texte(" racines n-ièmes de l'unité vaut toujours "), latex("1"), texte(".")],
      reponse: false,
      justification: [texte("Il vaut "), latex("(-1)^{n+1}"), texte(" : pour "), latex("n=2"), texte(", "), latex("1\\times(-1)=-1"), texte(", pas "), latex("1"), texte(" (c'est la SOMME, elle, qui est toujours nulle pour "), latex("n\\geq2"), texte(").")],
    },
    {
      enonce: [texte("Pour trouver les racines n-ièmes, il suffit de diviser l'argument par "), latex("n"), texte(" : les "), latex("n"), texte(" racines ne diffèrent alors que par leur module.")],
      reponse: false,
      justification: [texte("C'est exactement l'inverse : toutes les racines ont le MÊME module "), latex("r^{1/n}"), texte(", et c'est leur ARGUMENT qui diffère, de "), latex("2k\\pi/n"), texte(" — diviser l'argument par "), latex("n"), texte(" ne donne d'ailleurs qu'une seule racine (celle de "), latex("k=0"), texte(").")],
    },
  ],

  // ==========================================================================
  // Thème 7 — Transformations du plan via les nombres complexes, ref 6gen40
  // ==========================================================================
  transformationsPlan: [
    {
      enonce: [texte("La translation de vecteur d'affixe "), latex("b"), texte(" transforme "), latex("z"), texte(" en "), latex("z'=z+b"), texte(".")],
      reponse: true,
      justification: [texte("C'est la définition d'une translation via les affixes.")],
    },
    {
      enonce: [texte("La translation de vecteur d'affixe "), latex("b"), texte(" transforme "), latex("z"), texte(" en "), latex("z'=z-b"), texte(".")],
      reponse: false,
      justification: [texte("Erreur de signe : la bonne formule est "), latex("z'=z+b"), texte(", pas "), latex("z-b"), texte(".")],
    },
    {
      enonce: [texte("La rotation de centre "), latex("\\Omega"), texte(" (affixe "), latex("z_0"), texte(") et d'angle "), latex("\\theta"), texte(" transforme "), latex("z"), texte(" en "), latex("z'=e^{i\\theta}(z-z_0)+z_0"), texte(".")],
      reponse: true,
      justification: [texte("C'est la formule standard : on ramène le centre à l'origine ("), latex("z-z_0"), texte("), on applique la rotation ("), latex("e^{i\\theta}\\cdot"), texte("), puis on translate de retour ("), latex("+z_0"), texte(").")],
    },
    {
      enonce: [texte("La rotation de centre "), latex("\\Omega"), texte(" (affixe "), latex("z_0"), texte(") et d'angle "), latex("\\theta"), texte(" transforme "), latex("z"), texte(" en "), latex("z'=e^{i\\theta}(z_0-z)+z_0"), texte(".")],
      reponse: false,
      justification: [texte("Piège classique d'ordre : c'est "), latex("(z-z_0)"), texte(" qu'il faut utiliser, pas "), latex("(z_0-z)"), texte(" — inverser l'ordre revient à ajouter "), latex("\\pi"), texte(" à l'angle de rotation appliqué.")],
    },
    {
      enonce: [texte("Dans la formule d'une rotation "), latex("z'=e^{i\\theta}(z-z_0)+z_0"), texte(", le multiplicateur "), latex("e^{i\\theta}"), texte(" a un module toujours égal à "), latex("1"), texte(".")],
      reponse: true,
      justification: [texte("Une rotation conserve les distances : son multiplicateur est toujours de module "), latex("1"), texte(", jamais d'agrandissement ni de réduction.")],
    },
    {
      enonce: [texte("Une rotation peut être représentée par un multiplicateur "), latex("a"), texte(" quelconque, pourvu que "), latex("\\arg(a)"), texte(" soit l'angle voulu, même si "), latex("|a|\\neq1"), texte(".")],
      reponse: false,
      justification: [texte("Si "), latex("|a|\\neq1"), texte(", la transformation combine rotation ET homothétie (c'est une similitude), ce n'est plus une rotation pure.")],
    },
    {
      enonce: [texte("L'homothétie de centre "), latex("\\Omega"), texte(" (affixe "), latex("z_0"), texte(") et de rapport "), latex("k"), texte(" (réel) transforme "), latex("z"), texte(" en "), latex("z'=k(z-z_0)+z_0"), texte(".")],
      reponse: true,
      justification: [texte("Même principe que la rotation : ramener le centre à l'origine, appliquer le rapport, translater de retour.")],
    },
    {
      enonce: [texte("L'homothétie de centre "), latex("\\Omega"), texte(" et de rapport "), latex("k"), texte(" transforme "), latex("z"), texte(" en "), latex("z'=k\\cdot z+z_0"), texte(" (sans soustraire "), latex("z_0"), texte(" avant de multiplier).")],
      reponse: false,
      justification: [texte("Il faut soustraire le centre AVANT de multiplier par "), latex("k"), texte(" : la bonne formule est "), latex("k(z-z_0)+z_0"), texte(", pas "), latex("kz+z_0"), texte(".")],
    },
    {
      enonce: [texte("Le rapport "), latex("k"), texte(" d'une homothétie est un nombre RÉEL, contrairement au multiplicateur d'une rotation ou d'une similitude qui est en général complexe.")],
      reponse: true,
      justification: [texte("C'est une différence structurelle entre les 3 transformations : "), latex("k"), texte(" réel pour l'homothétie, complexe pour la rotation ("), latex("|e^{i\\theta}|=1"), texte(") et la similitude.")],
    },
    {
      enonce: [texte("Une similitude directe s'écrit "), latex("z'=az+b"), texte(", avec "), latex("a"), texte(" un complexe NON NUL.")],
      reponse: true,
      justification: [texte("C'est la forme générale d'une similitude directe.")],
    },
    {
      enonce: [texte("Une similitude directe de multiplicateur "), latex("a=|a|e^{i\\theta}"), texte(" combine une rotation d'angle "), latex("\\theta"), texte(" et une homothétie de rapport "), latex("|a|"), texte(", de même centre.")],
      reponse: true,
      justification: [texte("C'est la décomposition standard d'une similitude directe.")],
    },
    {
      enonce: [texte("Dans une similitude "), latex("z'=az+b"), texte(", le module "), latex("|a|"), texte(" correspond à l'angle de rotation, et l'argument de "), latex("a"), texte(" correspond au rapport d'agrandissement.")],
      reponse: false,
      justification: [texte("Les rôles sont INVERSÉS dans cette affirmation : "), latex("|a|"), texte(" est le rapport d'agrandissement, "), latex("\\arg(a)"), texte(" est l'angle de rotation.")],
    },
    {
      enonce: [texte("Une rotation est un cas particulier de similitude directe, où "), latex("|a|=1"), texte(".")],
      reponse: true,
      justification: [texte("Quand "), latex("|a|=1"), texte(", il n'y a plus d'agrandissement/réduction : seule la rotation subsiste.")],
    },
    {
      enonce: [texte("Une homothétie est un cas particulier de similitude directe, où "), latex("a"), texte(" est un réel ("), latex("\\arg(a)=0"), texte(" ou "), latex("\\pi"), texte(").")],
      reponse: true,
      justification: [texte("Quand "), latex("a"), texte(" est réel, il n'y a plus de rotation d'angle non trivial : seule l'homothétie subsiste.")],
    },
    {
      enonce: [texte("Une translation est un cas particulier de similitude directe de la forme "), latex("z'=az+b"), texte(" avec "), latex("a\\neq1"), texte(".")],
      reponse: false,
      justification: [texte("C'est exactement l'inverse : une translation correspond à "), latex("a=1"), texte(" (aucun agrandissement, aucune rotation), pas à "), latex("a\\neq1"), texte(".")],
    },
    {
      enonce: [texte("Une translation correspond au cas "), latex("a=1"), texte(" dans l'écriture générale "), latex("z'=az+b"), texte(".")],
      reponse: true,
      justification: [texte("Avec "), latex("a=1"), texte(", "), latex("z'=z+b"), texte(", exactement la formule d'une translation de vecteur d'affixe "), latex("b"), texte(".")],
    },
    {
      enonce: [texte("Pour retrouver le centre "), latex("\\Omega"), texte(" d'une rotation ou d'une homothétie à partir de "), latex("z'=az+b"), texte(" ("), latex("a\\neq1"), texte("), on résout "), latex("z_0=az_0+b"), texte(", c'est-à-dire le point fixe de la transformation.")],
      reponse: true,
      justification: [texte("Le centre d'une rotation/homothétie/similitude (hors translation) est précisément son unique point fixe.")],
    },
    {
      enonce: [texte("Une similitude directe ("), latex("a\\neq0"), texte(", "), latex("a\\neq1"), texte(") ne possède jamais de point fixe.")],
      reponse: false,
      justification: [texte("Elle possède toujours exactement UN point fixe, "), latex("z_0=\\dfrac{b}{1-a}"), texte(" (bien défini puisque "), latex("a\\neq1"), texte(") — c'est son centre.")],
    },
    {
      enonce: [texte("Composer une rotation puis une translation (dans cet ordre) ne donne, en général, pas le même résultat que composer la translation puis la rotation (l'ordre compte).")],
      reponse: true,
      justification: [texte("Rotation et translation ne commutent pas en général — c'est le piège central des transformations composées de ce chapitre.")],
    },
    {
      enonce: [texte("Une similitude et une homothétie de MÊME centre "), latex("\\Omega"), texte(", mais de multiplicateurs "), latex("a"), texte(" et "), latex("k"), texte(" différents, ne commutent JAMAIS (l'ordre de composition change toujours le résultat).")],
      reponse: false,
      justification: [texte("Au contraire, 2 transformations de MÊME centre commutent toujours : en notant "), latex("f(z)=\\Omega+a(z-\\Omega)"), texte(" et "), latex("g(z)=\\Omega+k(z-\\Omega)"), texte(", on a "), latex("f\\circ g(z)=\\Omega+ak(z-\\Omega)=g\\circ f(z)"), texte(" car la multiplication complexe est commutative ("), latex("ak=ka"), texte(").")],
    },

    // --- Enrichissement (15 affirmations supplémentaires, nuances non couvertes ci-dessus) ---
    {
      enonce: [texte("La multiplication par "), latex("i"), texte(" est la rotation de centre "), latex("O"), texte(" et d'angle "), latex("\\pi/2"), texte(".")],
      reponse: true,
      justification: [latex("i=e^{i\\pi/2}"), texte(" : de module "), latex("1"), texte(" (aucune homothétie) et d'argument "), latex("\\pi/2"), texte(" — multiplier par "), latex("i"), texte(" ajoute donc "), latex("\\pi/2"), texte(" à l'argument sans toucher au module.")],
    },
    {
      enonce: [texte("La multiplication par "), latex("i"), texte(" est la symétrie par rapport à l'axe des réels.")],
      reponse: false,
      justification: [texte("La symétrie par rapport à l'axe des réels est "), latex("z\\mapsto\\bar z"), texte(" ; la multiplication par "), latex("i"), texte(" est une rotation d'angle "), latex("\\pi/2"), texte(".")],
    },
    {
      enonce: [texte("La transformation "), latex("z\\mapsto\\bar z"), texte(" est la symétrie orthogonale par rapport à l'axe des réels — ce n'est PAS une similitude directe (elle ne s'écrit jamais "), latex("z'=az+b"), texte(").")],
      reponse: true,
      justification: [texte("Conjuguer change le signe de l'ordonnée en gardant l'abscisse (symétrie d'axe horizontal) ; cette transformation INVERSE le sens des angles, ce qu'aucune similitude directe "), latex("z'=az+b"), texte(" ne fait.")],
    },
    {
      enonce: [texte("La transformation "), latex("z\\mapsto-z"), texte(" est une translation.")],
      reponse: false,
      justification: [texte("C'est le cas "), latex("a=-1"), texte(", "), latex("b=0"), texte(" : une translation exigerait "), latex("a=1"), texte(". Il s'agit de l'homothétie de centre "), latex("O"), texte(" et de rapport "), latex("-1"), texte(" (le point "), latex("O"), texte(" est fixe, ce qu'aucune translation non nulle ne permet).")],
    },
    {
      enonce: [texte("La transformation "), latex("z\\mapsto-z"), texte(" est à la fois l'homothétie de centre "), latex("O"), texte(" et de rapport "), latex("-1"), texte(", et la rotation de centre "), latex("O"), texte(" et d'angle "), latex("\\pi"), texte(".")],
      reponse: true,
      justification: [latex("-1=e^{i\\pi}"), texte(" : c'est bien un réel (donc une homothétie de rapport "), latex("-1"), texte(") ET un complexe de module "), latex("1"), texte(" d'argument "), latex("\\pi"), texte(" (donc une rotation d'angle "), latex("\\pi"), texte(") — les deux lectures coïncident dans ce seul cas.")],
    },
    {
      enonce: [texte("Une similitude directe de rapport "), latex("|a|=3"), texte(" multiplie les AIRES par "), latex("3"), texte(".")],
      reponse: false,
      justification: [texte("Les longueurs sont multipliées par "), latex("3"), texte(", donc les aires par "), latex("3^2=9"), texte(" — une aire est un produit de deux longueurs.")],
    },
    {
      enonce: [texte("Une similitude directe "), latex("z'=az+b"), texte(" multiplie toutes les longueurs par "), latex("|a|"), texte(" et toutes les aires par "), latex("|a|^2"), texte(".")],
      reponse: true,
      justification: [latex("|z'_2-z'_1|=|a|\\cdot|z_2-z_1|"), texte(" pour toute paire de points : les longueurs sont donc multipliées par "), latex("|a|"), texte(", et les aires (produits de 2 longueurs) par "), latex("|a|^2"), texte(".")],
    },
    {
      enonce: [texte("La composée de 2 rotations de MÊME centre, d'angles "), latex("\\theta_1"), texte(" et "), latex("\\theta_2"), texte(", est la rotation de même centre et d'angle "), latex("\\theta_1\\theta_2"), texte(".")],
      reponse: false,
      justification: [texte("Les multiplicateurs se MULTIPLIENT ("), latex("e^{i\\theta_1}e^{i\\theta_2}=e^{i(\\theta_1+\\theta_2)}"), texte("), donc les angles s'ADDITIONNENT : l'angle résultant est "), latex("\\theta_1+\\theta_2"), texte(", jamais leur produit.")],
    },
    {
      enonce: [texte("La composée de 2 translations, de vecteurs d'affixes "), latex("b_1"), texte(" et "), latex("b_2"), texte(", est la translation de vecteur d'affixe "), latex("b_1b_2"), texte(".")],
      reponse: false,
      justification: [texte("En composant "), latex("z\\mapsto z+b_1"), texte(" puis "), latex("z\\mapsto z+b_2"), texte(", on obtient "), latex("z+b_1+b_2"), texte(" : les affixes s'ADDITIONNENT.")],
    },
    {
      enonce: [texte("Toute similitude directe "), latex("z'=az+b"), texte(" avec "), latex("a\\neq1"), texte(" possède une infinité de points fixes.")],
      reponse: false,
      justification: [latex("z=az+b"), texte(" s'écrit "), latex("(1-a)z=b"), texte(" : comme "), latex("a\\neq1"), texte(", cette équation a une solution UNIQUE "), latex("z_0=b/(1-a)"), texte(" — exactement un point fixe, jamais une infinité.")],
    },
    {
      enonce: [texte("Une translation de vecteur NON NUL ("), latex("a=1"), texte(", "), latex("b\\neq0"), texte(") ne possède AUCUN point fixe — c'est le seul cas de similitude directe sans point fixe.")],
      reponse: true,
      justification: [latex("z=z+b"), texte(" imposerait "), latex("b=0"), texte(" : aucune solution si "), latex("b\\neq0"), texte(". Dès que "), latex("a\\neq1"), texte(", au contraire, le point fixe "), latex("b/(1-a)"), texte(" existe toujours.")],
    },
    {
      enonce: [texte("La rotation de centre "), latex("\\Omega"), texte(" et d'angle "), latex("\\theta"), texte(" transforme "), latex("[AB]"), texte(" en un segment de longueur différente de "), latex("AB"), texte(" dès que "), latex("\\theta\\neq0"), texte(".")],
      reponse: false,
      justification: [texte("Le multiplicateur "), latex("e^{i\\theta}"), texte(" a TOUJOURS pour module "), latex("1"), texte(", quel que soit "), latex("\\theta"), texte(" : une rotation conserve exactement les longueurs.")],
    },
    {
      enonce: [texte("L'image du point d'affixe "), latex("3+2i"), texte(" par la rotation de centre "), latex("O"), texte(" et d'angle "), latex("\\pi/2"), texte(" est le point d'affixe "), latex("2+3i"), texte(".")],
      reponse: false,
      justification: [texte("Il faut multiplier par "), latex("i"), texte(" : "), latex("i(3+2i)=3i+2i^2=-2+3i"), texte(" — permuter simplement les coordonnées ne donne pas une rotation.")],
    },
    {
      enonce: [texte("L'image du point d'affixe "), latex("3+2i"), texte(" par la rotation de centre "), latex("O"), texte(" et d'angle "), latex("\\pi/2"), texte(" est le point d'affixe "), latex("-2+3i"), texte(".")],
      reponse: true,
      justification: [latex("z'=e^{i\\pi/2}z=i(3+2i)=3i-2=-2+3i"), texte(".")],
    },
    {
      enonce: [texte("L'image du point d'affixe "), latex("1+i"), texte(" par l'homothétie de centre "), latex("\\Omega"), texte(" d'affixe "), latex("2"), texte(" et de rapport "), latex("3"), texte(" est le point d'affixe "), latex("3+3i"), texte(".")],
      reponse: false,
      justification: [texte("Il faut soustraire le centre AVANT de multiplier : "), latex("3(1+i-2)+2=3(-1+i)+2=-1+3i"), texte(" — "), latex("3+3i"), texte(" correspondrait à une homothétie de centre "), latex("O"), texte(".")],
    },
  ],

  // ==========================================================================
  // Thème 8 — Propriétés géométriques de triangles via les nombres complexes, ref 6gen41
  // ==========================================================================
  trianglesComplexes: [
    {
      enonce: [texte("Trois points "), latex("A,B,C"), texte(" distincts (affixes "), latex("z_A,z_B,z_C"), texte(") sont alignés si, et seulement si, le rapport "), latex("\\dfrac{z_C-z_A}{z_B-z_A}"), texte(" est un nombre RÉEL.")],
      reponse: true,
      justification: [texte("C'est le critère standard d'alignement par les affixes.")],
    },
    {
      enonce: [texte("Trois points "), latex("A,B,C"), texte(" distincts sont alignés si, et seulement si, le rapport "), latex("\\dfrac{z_C-z_A}{z_B-z_A}"), texte(" est un nombre IMAGINAIRE PUR.")],
      reponse: false,
      justification: [texte("C'est le critère d'ORTHOGONALITÉ (angle droit en "), latex("A"), texte(") qui est confondu ici avec celui d'alignement — un rapport réel signale l'alignement, un rapport imaginaire pur signale la perpendicularité.")],
    },
    {
      enonce: [texte("Deux vecteurs d'affixes "), latex("z_U"), texte(" et "), latex("z_V"), texte(" (non nuls) sont orthogonaux si, et seulement si, le rapport "), latex("z_V/z_U"), texte(" est un nombre imaginaire PUR (partie réelle nulle).")],
      reponse: true,
      justification: [texte("C'est le critère standard d'orthogonalité par les affixes.")],
    },
    {
      enonce: [texte("Deux vecteurs d'affixes "), latex("z_U"), texte(" et "), latex("z_V"), texte(" sont orthogonaux si, et seulement si, le rapport "), latex("z_V/z_U"), texte(" est un nombre RÉEL.")],
      reponse: false,
      justification: [texte("Un rapport réel signale que les vecteurs sont COLINÉAIRES (parallèles), pas orthogonaux — les deux critères sont ici inversés.")],
    },
    {
      enonce: [texte("Deux vecteurs non nuls d'affixes "), latex("z_U"), texte(" et "), latex("z_V"), texte(" sont colinéaires (parallèles) si, et seulement si, le rapport "), latex("z_V/z_U"), texte(" est un nombre réel.")],
      reponse: true,
      justification: [texte("C'est le critère standard de colinéarité par les affixes.")],
    },
    {
      enonce: [texte("Un triangle "), latex("ABC"), texte(" est isocèle en "), latex("A"), texte(" si, et seulement si, "), latex("|z_B-z_A| = |z_C-z_A|"), texte(".")],
      reponse: true,
      justification: [texte("C'est la traduction directe de « "), latex("A"), texte(" équidistant de "), latex("B"), texte(" et "), latex("C"), texte(" » via les modules.")],
    },
    {
      enonce: [texte("Un triangle "), latex("ABC"), texte(" est isocèle en "), latex("A"), texte(" si, et seulement si, "), latex("z_B-z_A = z_C-z_A"), texte(".")],
      reponse: false,
      justification: [texte("Cette égalité forcerait "), latex("B=C"), texte(" (triangle dégénéré) : la condition d'isocèle porte sur l'ÉGALITÉ DES MODULES ("), latex("|z_B-z_A|=|z_C-z_A|"), texte("), jamais sur l'égalité des nombres complexes eux-mêmes.")],
    },
    {
      enonce: [texte("Un triangle "), latex("ABC"), texte(" est rectangle en "), latex("A"), texte(" si, et seulement si, le rapport "), latex("\\dfrac{z_B-z_A}{z_C-z_A}"), texte(" est un imaginaire pur.")],
      reponse: true,
      justification: [texte("C'est le critère d'orthogonalité appliqué aux vecteurs "), latex("\\vec{AB}"), texte(" et "), latex("\\vec{AC}"), texte(".")],
    },
    {
      enonce: [texte("Un triangle "), latex("ABC"), texte(" est rectangle en "), latex("A"), texte(" si, et seulement si, le rapport "), latex("\\dfrac{z_B-z_A}{z_C-z_A}"), texte(" est un réel.")],
      reponse: false,
      justification: [texte("Un rapport réel signalerait que "), latex("\\vec{AB}"), texte(" et "), latex("\\vec{AC}"), texte(" sont colinéaires (triangle dégénéré, aplati), pas qu'ils sont perpendiculaires.")],
    },
    {
      enonce: [texte("Un triangle "), latex("OBF"), texte(" ("), latex("O"), texte(" origine, "), latex("F=B\\cdot e^{i\\pi/3}"), texte(") est équilatéral, quel que soit le point "), latex("B\\neq O"), texte(" choisi.")],
      reponse: true,
      justification: [texte("C'est une propriété générale, indépendante du choix de "), latex("B"), texte(" — voir la preuve ci-dessous.")],
    },
    {
      enonce: [texte("Pour prouver qu'un triangle "), latex("OBF"), texte(" ("), latex("F=B\\cdot e^{i\\pi/3}"), texte(") est équilatéral, on peut montrer que "), latex("|OF|=|OB|"), texte(" (une rotation conserve le module) et que "), latex("|BF|=|OB|"), texte(" (grâce à l'identité "), latex("|e^{i\\theta}-1|=2\\sin(\\theta/2)"), texte(").")],
      reponse: true,
      justification: [texte("C'est exactement la démonstration standard : "), latex("|OF|=|B|\\cdot|e^{i\\pi/3}|=|B|"), texte(", et "), latex("|BF|=|B|\\cdot|e^{i\\pi/3}-1|=|B|\\cdot2\\sin(\\pi/6)=|B|"), texte(".")],
    },
    {
      enonce: [texte("Un triangle équilatéral de côté entier a nécessairement un rayon du cercle circonscrit qui est aussi un nombre entier.")],
      reponse: false,
      justification: [texte("Le rayon du cercle circonscrit d'un triangle équilatéral de côté "), latex("c"), texte(" vaut "), latex("c/\\sqrt{3}"), texte(", un nombre IRRATIONNEL dès que "), latex("c"), texte(" est un entier non nul — aucune construction entière ne peut l'éviter.")],
    },
    {
      enonce: [texte("Pour un triangle équilatéral de côté "), latex("c"), texte(", le rayon du cercle circonscrit vaut "), latex("c/\\sqrt3"), texte(", un nombre en général irrationnel même si "), latex("c"), texte(" est entier.")],
      reponse: true,
      justification: [texte("C'est une propriété géométrique incontournable du triangle équilatéral, pas un choix de conception du générateur.")],
    },
    {
      enonce: [texte("La loi des cosinus permet de calculer un angle d'un triangle à partir des longueurs de ses 3 côtés, ces longueurs étant elles-mêmes obtenues comme modules de différences d'affixes.")],
      reponse: true,
      justification: [texte("C'est la méthode utilisée pour retrouver un angle à partir de 3 longueurs connues via les affixes.")],
    },
    {
      enonce: [texte("L'angle obtenu par la loi des cosinus, à partir de 3 côtés entiers quelconques, est toujours un angle remarquable (multiple de "), latex("30°"), texte(" ou "), latex("45°"), texte(").")],
      reponse: false,
      justification: [texte("En général, cet angle n'est PAS un angle remarquable — c'est la seule étape de ce chapitre vérifiée par tolérance décimale plutôt que par égalité exacte, précisément pour cette raison.")],
    },
    {
      enonce: [texte("Un triplet pythagoricien "), latex("(a,b,c)"), texte(" avec "), latex("a^2+b^2=c^2"), texte(" permet de construire un triangle rectangle dont les 3 côtés sont des entiers.")],
      reponse: true,
      justification: [texte("C'est la définition même d'un triplet pythagoricien, utilisé pour garantir un triangle rectangle à côtés entiers.")],
    },
    {
      enonce: [texte("Un triangle isocèle à 3 côtés entiers (2 côtés égaux, base différente) ne peut jamais être aussi rectangle, car cela imposerait "), latex("\\text{base}=\\text{côté}\\cdot\\sqrt2"), texte(", un nombre irrationnel.")],
      reponse: true,
      justification: [texte("Si le triangle était aussi rectangle en l'apex, le théorème de Pythagore donnerait "), latex("\\text{côté}^2+\\text{côté}^2=\\text{base}^2"), texte(", soit "), latex("\\text{base}=\\text{côté}\\sqrt2"), texte(" — impossible pour des entiers.")],
    },
    {
      enonce: [texte("Un triangle isocèle à 3 côtés entiers peut parfois être aussi rectangle, si les côtés sont bien choisis.")],
      reponse: false,
      justification: [texte("C'est impossible par construction (voir la preuve algébrique ci-dessus) : jamais, pour aucun choix d'entiers, un tel triangle n'est rectangle.")],
    },
    {
      enonce: [texte("La rotation utilisée pour bâtir un triangle équilatéral à partir d'un point "), latex("B"), texte(" ("), latex("F=B\\cdot e^{i\\pi/3}"), texte(") est un cas particulier de similitude directe de module "), latex("1"), texte(".")],
      reponse: true,
      justification: [texte("Le multiplicateur "), latex("e^{i\\pi/3}"), texte(" a bien pour module "), latex("1"), texte(" : c'est une rotation pure, cas particulier de similitude.")],
    },
    {
      enonce: [texte("Le rapport "), latex("\\dfrac{z_C-z_A}{z_B-z_A}"), texte(" réel et STRICTEMENT NÉGATIF signale que "), latex("B"), texte(" est situé ENTRE "), latex("A"), texte(" et "), latex("C"), texte(".")],
      reponse: false,
      justification: [texte("Un rapport négatif signale en réalité que "), latex("A"), texte(" (pas "), latex("B"), texte(") est situé entre "), latex("B"), texte(" et "), latex("C"), texte(" — exemple : "), latex("A=0,\\ B=1,\\ C=-2"), texte(" donne un rapport "), latex("-2"), texte(", et c'est bien "), latex("A"), texte(" qui est entre "), latex("C"), texte(" et "), latex("B"), texte(" sur la droite.")],
    },

    // --- Enrichissement (15 affirmations supplémentaires, nuances non couvertes ci-dessus) ---
    {
      enonce: [texte("Le triangle d'affixes "), latex("z_A=0"), texte(", "), latex("z_B=2"), texte(", "), latex("z_C=2+2i"), texte(" est rectangle ET isocèle en "), latex("B"), texte(".")],
      reponse: true,
      justification: [latex("\\vec{BA}"), texte(" a pour affixe "), latex("-2"), texte(" et "), latex("\\vec{BC}"), texte(" pour affixe "), latex("2i"), texte(" : leur rapport "), latex("2i/(-2)=-i"), texte(" est imaginaire pur (angle droit en "), latex("B"), texte("), et les 2 modules valent "), latex("2"), texte(".")],
    },
    {
      enonce: [texte("Ce même triangle d'affixes "), latex("0"), texte(", "), latex("2"), texte(", "), latex("2+2i"), texte(" est équilatéral.")],
      reponse: false,
      justification: [texte("Deux côtés valent "), latex("2"), texte(", mais le troisième vaut "), latex("|2+2i|=2\\sqrt2"), texte(" : un triangle rectangle n'est jamais équilatéral (son hypoténuse est toujours strictement plus longue).")],
    },
    {
      enonce: [texte("Les triangles "), latex("ABC"), texte(" et "), latex("A'B'C'"), texte(" sont DIRECTEMENT semblables si, et seulement si, "), latex("\\dfrac{z_{B'}-z_{A'}}{z_{C'}-z_{A'}} = \\dfrac{z_B-z_A}{z_C-z_A}"), texte(".")],
      reponse: true,
      justification: [texte("Ce rapport code à la fois le rapport des longueurs (son module) et l'angle en "), latex("A"), texte(" avec son sens (son argument) : son égalité caractérise exactement la similitude directe.")],
    },
    {
      enonce: [texte("Deux triangles sont directement semblables dès que leurs 3 côtés sont proportionnels 2 à 2, quel que soit l'ordre dans lequel on apparie les sommets.")],
      reponse: false,
      justification: [texte("Des côtés proportionnels donnent des triangles SEMBLABLES, mais l'appariement des sommets et le SENS de parcours comptent : un triangle et son image par une symétrie ont des côtés proportionnels sans être DIRECTEMENT semblables.")],
    },
    {
      enonce: [texte("Une similitude directe transforme tout triangle en un triangle qui lui est directement semblable : mêmes angles, longueurs toutes multipliées par "), latex("|a|"), texte(".")],
      reponse: true,
      justification: [latex("z'=az+b"), texte(" donne "), latex("z'_2-z'_1=a(z_2-z_1)"), texte(" : chaque côté est multiplié par le même facteur "), latex("|a|"), texte(" et tourné du même angle "), latex("\\arg(a)"), texte(", ce qui préserve les angles du triangle.")],
    },
    {
      enonce: [texte("Le triangle "), latex("ABC"), texte(" est équilatéral si, et seulement si, "), latex("|z_B-z_A| = |z_C-z_B|"), texte(".")],
      reponse: false,
      justification: [texte("Cette seule égalité rend le triangle ISOCÈLE en "), latex("B"), texte(" : il faut en plus "), latex("|z_A-z_C|"), texte(" égal aux deux autres pour conclure à l'équilatéral.")],
    },
    {
      enonce: [texte("Le triangle "), latex("ABC"), texte(" est équilatéral si, et seulement si, "), latex("|z_B-z_A| = |z_C-z_B| = |z_A-z_C|"), texte(".")],
      reponse: true,
      justification: [texte("C'est la traduction exacte, par les modules, de « les 3 côtés ont la même longueur ».")],
    },
    {
      enonce: [texte("Le centre de gravité du triangle "), latex("ABC"), texte(" a pour affixe "), latex("\\dfrac{z_A+z_B+z_C}{2}"), texte(".")],
      reponse: false,
      justification: [texte("Un isobarycentre de 3 points se divise par "), latex("3"), texte(", pas par "), latex("2"), texte(" : l'affixe correcte est "), latex("\\dfrac{z_A+z_B+z_C}{3}"), texte(".")],
    },
    {
      enonce: [texte("Le centre de gravité du triangle "), latex("ABC"), texte(" a pour affixe "), latex("\\dfrac{z_A+z_B+z_C}{3}"), texte(".")],
      reponse: true,
      justification: [texte("C'est la moyenne des 3 affixes, transposition directe de la formule de l'isobarycentre de 3 points.")],
    },
    {
      enonce: [texte("Si le rapport "), latex("\\dfrac{z_C-z_A}{z_B-z_A}"), texte(" vaut exactement "), latex("2i"), texte(", le triangle "), latex("ABC"), texte(" est rectangle ET isocèle en "), latex("A"), texte(".")],
      reponse: false,
      justification: [latex("2i"), texte(" est bien imaginaire pur (donc angle droit en "), latex("A"), texte("), mais son MODULE vaut "), latex("2"), texte(" : "), latex("AC=2\\,AB"), texte(", le triangle n'est donc pas isocèle. Il faudrait un rapport de module "), latex("1"), texte(", c'est-à-dire "), latex("\\pm i"), texte(".")],
    },
    {
      enonce: [texte("Un triangle dont les 3 sommets ont des affixes de MÊME MODULE est nécessairement équilatéral.")],
      reponse: false,
      justification: [texte("Ces 3 points sont seulement sur un même cercle de centre "), latex("O"), texte(" : contre-exemple "), latex("1"), texte(", "), latex("i"), texte(", "), latex("-1"), texte(" (tous de module "), latex("1"), texte("), dont les côtés valent "), latex("\\sqrt2"), texte(", "), latex("\\sqrt2"), texte(" et "), latex("2"), texte(".")],
    },
    {
      enonce: [texte("Le triangle d'affixes "), latex("0"), texte(", "), latex("4"), texte(" et "), latex("2+2i"), texte(" est équilatéral.")],
      reponse: false,
      justification: [texte("Le premier côté vaut "), latex("4"), texte(", mais "), latex("|2+2i|=2\\sqrt2\\approx2{,}83"), texte(" : pour un équilatéral de côté "), latex("4"), texte(", le 3e sommet serait "), latex("2+2i\\sqrt3"), texte(".")],
    },
    {
      enonce: [texte("Dans un triangle rectangle en "), latex("A"), texte(", le milieu de l'hypoténuse "), latex("[BC]"), texte(" n'est équidistant des 3 sommets que si le triangle est de plus isocèle.")],
      reponse: false,
      justification: [texte("C'est vrai pour TOUT triangle rectangle (cercle de Thalès) : le milieu de l'hypoténuse est le centre du cercle circonscrit, sans aucune condition supplémentaire.")],
    },
    {
      enonce: [texte("Dans un triangle rectangle en "), latex("A"), texte(", le milieu "), latex("M"), texte(" de "), latex("[BC]"), texte(" vérifie "), latex("|z_A-z_M|=|z_B-z_M|=|z_C-z_M|"), texte(" : c'est le centre du cercle circonscrit.")],
      reponse: true,
      justification: [texte("C'est la propriété du cercle de Thalès : "), latex("A"), texte(" vu sous un angle droit depuis "), latex("[BC]"), texte(" appartient au cercle de diamètre "), latex("[BC]"), texte(", dont le centre est le milieu de "), latex("[BC]"), texte(".")],
    },
    {
      enonce: [texte("Si "), latex("\\dfrac{z_C-z_A}{z_B-z_A}"), texte(" est un réel, alors "), latex("A"), texte(", "), latex("B"), texte(", "), latex("C"), texte(" forment toujours un vrai triangle (non aplati).")],
      reponse: false,
      justification: [texte("Un rapport réel signale au contraire que les 3 points sont ALIGNÉS : le « triangle » est alors dégénéré (aire nulle), jamais un vrai triangle.")],
    },
  ],

  // ==========================================================================
  // Thème 9 — Nombres complexes : problèmes avancés, ref 6gen42
  // ==========================================================================
  complexesAvances: [
    {
      enonce: [texte("Si "), latex("z"), texte(" est un complexe non nul, alors "), latex("z^n"), texte(" est réel si, et seulement si, "), latex("n\\cdot\\arg(z) \\equiv 0 \\pmod{\\pi}"), texte(".")],
      reponse: true,
      justification: [texte("On a "), latex("z^n=r^ne^{in\\theta}"), texte(", réel "), latex("\\Leftrightarrow \\sin(n\\theta)=0 \\Leftrightarrow n\\theta\\equiv0\\pmod\\pi"), texte(".")],
    },
    {
      enonce: [texte("Pour "), latex("z"), texte(" non nul, "), latex("z^n"), texte(" est réel si, et seulement si, "), latex("n\\cdot\\arg(z) \\equiv 0 \\pmod{2\\pi}"), texte(".")],
      reponse: false,
      justification: [texte("Cette condition (modulo "), latex("2\\pi"), texte(") est celle de « réel POSITIF », deux fois plus restrictive que « réel » simplement (modulo "), latex("\\pi"), texte(") — piège central de ce générateur.")],
    },
    {
      enonce: [texte("Pour "), latex("z"), texte(" non nul, "), latex("z^n"), texte(" est réel POSITIF si, et seulement si, "), latex("n\\cdot\\arg(z) \\equiv 0 \\pmod{2\\pi}"), texte(" — une condition deux fois plus restrictive que « "), latex("z^n"), texte(" réel ».")],
      reponse: true,
      justification: [texte("Réel positif "), latex("\\Leftrightarrow e^{in\\theta}=1 \\Leftrightarrow n\\theta\\equiv0\\pmod{2\\pi}"), texte(", condition deux fois plus stricte que "), latex("\\pmod\\pi"), texte(".")],
    },
    {
      enonce: [texte("Un nombre complexe non réel, élevé à une puissance PAIRE, peut redonner un résultat réel POSITIF, même si son argument n'est pas nul.")],
      reponse: true,
      justification: [texte("Exemple : pour "), latex("n=4"), texte(", un "), latex("z"), texte(" d'argument "), latex("\\pi/2"), texte(" (sur l'axe imaginaire, pas réel) donne "), latex("4\\theta=2\\pi\\equiv0\\pmod{2\\pi}"), texte(", donc "), latex("z^4"), texte(" réel positif.")],
    },
    {
      enonce: [texte("Un nombre complexe élevé à une puissance IMPAIRE donne toujours un résultat réel POSITIF si son argument est un multiple de "), latex("\\pi/3"), texte(".")],
      reponse: false,
      justification: [texte("Contre-exemple : pour "), latex("n=3"), texte(" et "), latex("\\theta=\\pi/3"), texte(", on a "), latex("3\\theta=\\pi\\equiv\\pi\\pmod{2\\pi}"), texte(" (jamais "), latex("\\equiv0"), texte("), donc "), latex("z^3"), texte(" est réel NÉGATIF, pas positif.")],
    },
    {
      enonce: [texte("La transformation de Blaschke "), latex("z'=\\dfrac{z-p}{1-\\bar p z}"), texte(" (avec "), latex("p"), texte(" complexe, "), latex("|p|<1"), texte(") transforme tout point du cercle unité ("), latex("|z|=1"), texte(") en un autre point du cercle unité ("), latex("|z'|=1"), texte(").")],
      reponse: true,
      justification: [texte("Preuve directe : "), latex("|z-p|^2=1-\\bar pz-p\\bar z+|p|^2=|1-\\bar pz|^2"), texte(" (en utilisant "), latex("z\\bar z=1"), texte("), donc "), latex("|z'|=1"), texte(".")],
    },
    {
      enonce: [texte("La transformation "), latex("z'=\\dfrac{z+a}{1+aiz}"), texte(" (avec un simple paramètre réel "), latex("a"), texte(" aux deux emplacements) transforme aussi tout point du cercle unité en un point du cercle unité.")],
      reponse: false,
      justification: [texte("Cette forme candidate a été écartée : "), latex("|z+a|^2"), texte(" et "), latex("|1+aiz|^2"), texte(" développés ne coïncident QUE si "), latex("\\text{Re}(z)=-\\text{Im}(z)"), texte(", pas en général.")],
    },
    {
      enonce: [texte("La transformation de Blaschke "), latex("z'=\\dfrac{z-p}{1-\\bar pz}"), texte(" est involutive au sens où appliquer la MÊME transformation avec "), latex("-p"), texte(" à "), latex("z'"), texte(" redonne "), latex("z"), texte(".")],
      reponse: true,
      justification: [texte("C'est la réciproque de la transformation, de même forme avec "), latex("-p"), texte(" à la place de "), latex("p"), texte(".")],
    },
    {
      enonce: [texte("Les "), latex("n"), texte(" racines n-ièmes de l'unité, reliées entre elles dans l'ordre de leurs arguments croissants, forment les sommets d'un polygone régulier à "), latex("n"), texte(" côtés inscrit dans le cercle unité.")],
      reponse: true,
      justification: [texte("Puisqu'elles sont régulièrement réparties (angles espacés de "), latex("2\\pi/n"), texte(") sur le cercle unité, les relier donne un polygone régulier.")],
    },
    {
      enonce: [texte("Les "), latex("n"), texte(" racines n-ièmes de l'unité forment un polygone régulier uniquement lorsque "), latex("n"), texte(" est un nombre pair.")],
      reponse: false,
      justification: [texte("Cela fonctionne pour n'importe quel "), latex("n\\geq3"), texte(", pair ou impair (par exemple un triangle équilatéral pour "), latex("n=3"), texte(", un pentagone pour "), latex("n=5"), texte(").")],
    },
    {
      enonce: [texte("Le centre de gravité (isobarycentre) des "), latex("n"), texte(" racines n-ièmes de l'unité ("), latex("n\\geq2"), texte(") est le point "), latex("O"), texte(", l'origine.")],
      reponse: true,
      justification: [texte("Puisque la somme des "), latex("n"), texte(" racines n-ièmes de l'unité vaut "), latex("0"), texte(", leur moyenne (l'isobarycentre) vaut aussi "), latex("0"), texte(", donc "), latex("O"), texte(".")],
    },
    {
      enonce: [texte("Le rapport "), latex("\\dfrac{z_D-z_C}{z_B-z_A}"), texte(" réel signale que les droites "), latex("(AB)"), texte(" et "), latex("(CD)"), texte(" sont PARALLÈLES (ou confondues).")],
      reponse: true,
      justification: [texte("Un rapport réel signale que les vecteurs "), latex("\\vec{AB}"), texte(" et "), latex("\\vec{CD}"), texte(" sont colinéaires, donc que les droites sont parallèles.")],
    },
    {
      enonce: [texte("Le rapport "), latex("\\dfrac{z_D-z_C}{z_B-z_A}"), texte(" réel signale que les droites "), latex("(AB)"), texte(" et "), latex("(CD)"), texte(" sont PERPENDICULAIRES.")],
      reponse: false,
      justification: [texte("C'est le critère de PARALLÉLISME, pas de perpendicularité — la perpendicularité correspond à un rapport IMAGINAIRE PUR.")],
    },
    {
      enonce: [texte("Le rapport "), latex("\\dfrac{z_D-z_C}{z_B-z_A}"), texte(" imaginaire pur signale que les droites "), latex("(AB)"), texte(" et "), latex("(CD)"), texte(" sont PERPENDICULAIRES.")],
      reponse: true,
      justification: [texte("Un rapport imaginaire pur signale que "), latex("\\vec{AB}"), texte(" et "), latex("\\vec{CD}"), texte(" sont orthogonaux, donc que les droites sont perpendiculaires.")],
    },
    {
      enonce: [texte("L'ensemble des points "), latex("M"), texte(" d'affixe "), latex("z"), texte(" tels que "), latex("|z-a|=k"), texte(" ("), latex("k>0"), texte(", "), latex("a"), texte(" fixé) est un cercle de centre "), latex("A"), texte(" (affixe "), latex("a"), texte(") et de rayon "), latex("k"), texte(".")],
      reponse: true,
      justification: [texte("C'est la définition même d'un cercle : l'ensemble des points à distance "), latex("k"), texte(" fixée d'un centre "), latex("A"), texte(".")],
    },
    {
      enonce: [texte("L'ensemble des points "), latex("M"), texte(" d'affixe "), latex("z"), texte(" tels que "), latex("|z-a|=k"), texte(" est une droite passant par "), latex("A"), texte(".")],
      reponse: false,
      justification: [texte("Cette condition (module constant) décrit un CERCLE, jamais une droite.")],
    },
    {
      enonce: [texte("L'ensemble des points "), latex("M"), texte(" d'affixe "), latex("z"), texte(" tels que "), latex("\\arg(z-a)\\equiv\\theta_0\\pmod{2\\pi}"), texte(" ("), latex("a"), texte(" et "), latex("\\theta_0"), texte(" fixés) est une DEMI-DROITE issue de "), latex("A"), texte(" (le point "), latex("A"), texte(" lui-même exclu).")],
      reponse: true,
      justification: [texte("Fixer l'argument modulo "), latex("2\\pi"), texte(" ne retient qu'UNE seule direction (pas son opposée, d'argument "), latex("\\theta_0+\\pi"), texte("), d'où une demi-droite plutôt qu'une droite entière.")],
    },
    {
      enonce: [texte("L'ensemble des points "), latex("M"), texte(" d'affixe "), latex("z"), texte(" tels que "), latex("\\arg(z-a)\\equiv\\theta_0\\pmod{2\\pi}"), texte(" est une droite ENTIÈRE passant par "), latex("A"), texte(".")],
      reponse: false,
      justification: [texte("Modulo "), latex("2\\pi"), texte(", seule UNE des deux demi-droites opposées est retenue — c'est modulo "), latex("\\pi"), texte(" seulement que les deux directions "), latex("\\theta_0"), texte(" et "), latex("\\theta_0+\\pi"), texte(" seraient confondues, donnant la droite entière.")],
    },
    {
      enonce: [texte("Si le lieu géométrique est défini par une équation portant sur "), latex("\\arg(z-a)"), texte(" MODULO "), latex("\\pi"), texte(" (et non modulo "), latex("2\\pi"), texte("), on obtient alors la droite ENTIÈRE passant par "), latex("A"), texte(" (les deux demi-droites opposées réunies).")],
      reponse: true,
      justification: [texte("Modulo "), latex("\\pi"), texte(", les angles "), latex("\\theta_0"), texte(" et "), latex("\\theta_0+\\pi"), texte(" sont confondus, réunissant les deux demi-droites en une droite complète.")],
    },
    {
      enonce: [texte("Pour "), latex("n=4"), texte(", un complexe "), latex("z"), texte(" d'argument "), latex("\\pi/4"), texte(" (une diagonale) donne "), latex("z^4"), texte(" réel POSITIF.")],
      reponse: false,
      justification: [texte("On a "), latex("4\\times\\pi/4=\\pi\\equiv\\pi\\pmod{2\\pi}"), texte(" (jamais "), latex("\\equiv0"), texte("), donc "), latex("z^4"), texte(" est réel NÉGATIF — piège central : "), latex("4\\theta\\equiv0\\pmod\\pi"), texte(" est bien vrai (donc "), latex("z^4"), texte(" est réel), mais pas modulo "), latex("2\\pi"), texte(" (donc jamais positif).")],
    },

    // --- Enrichissement (15 affirmations supplémentaires, nuances non couvertes ci-dessus) ---
    {
      enonce: [texte("L'ensemble des points "), latex("M"), texte(" d'affixe "), latex("z"), texte(" tels que "), latex("|z-a|=|z-b|"), texte(" ("), latex("a\\neq b"), texte(") est la MÉDIATRICE du segment "), latex("[AB]"), texte(".")],
      reponse: true,
      justification: [texte("La condition dit exactement que "), latex("M"), texte(" est équidistant de "), latex("A"), texte(" et "), latex("B"), texte(" — c'est la définition de la médiatrice de "), latex("[AB]"), texte(".")],
    },
    {
      enonce: [texte("L'ensemble des points "), latex("M"), texte(" tels que "), latex("|z-a|=|z-b|"), texte(" est le cercle de diamètre "), latex("[AB]"), texte(".")],
      reponse: false,
      justification: [texte("Équidistance de 2 points fixes = médiatrice (une DROITE), jamais un cercle : le cercle de diamètre "), latex("[AB]"), texte(" correspond, lui, à un angle droit en "), latex("M"), texte(".")],
    },
    {
      enonce: [texte("L'ensemble des points "), latex("M"), texte(" tels que "), latex("\\dfrac{|z-a|}{|z-b|}=k"), texte(" avec "), latex("k>0"), texte(" et "), latex("k\\neq1"), texte(" est un CERCLE (dit cercle d'Apollonius), jamais une droite.")],
      reponse: true,
      justification: [texte("En posant "), latex("z=x+iy"), texte(", "), latex("|z-a|^2=k^2|z-b|^2"), texte(" donne une équation en "), latex("x^2+y^2"), texte(" dont le coefficient "), latex("1-k^2"), texte(" est non nul (car "), latex("k\\neq1"), texte(") : les termes de degré 2 subsistent, d'où un cercle.")],
    },
    {
      enonce: [texte("L'ensemble des points "), latex("M"), texte(" tels que "), latex("\\dfrac{|z-a|}{|z-b|}=k"), texte(" est un cercle pour TOUTE valeur "), latex("k>0"), texte(", y compris "), latex("k=1"), texte(".")],
      reponse: false,
      justification: [texte("Le cas "), latex("k=1"), texte(" est précisément l'exception : les termes en "), latex("x^2+y^2"), texte(" se simplifient (coefficient "), latex("1-k^2=0"), texte(") et le lieu dégénère en la MÉDIATRICE de "), latex("[AB]"), texte(", une droite.")],
    },
    {
      enonce: [texte("L'ensemble des points "), latex("M"), texte(" tels que le rapport "), latex("\\dfrac{z-a}{z-b}"), texte(" soit un IMAGINAIRE PUR est le cercle de diamètre "), latex("[AB]"), texte(", privé du point "), latex("B"), texte(".")],
      reponse: true,
      justification: [texte("Un rapport imaginaire pur signifie "), latex("\\vec{MA}\\perp\\vec{MB}"), texte(" : "), latex("M"), texte(" voit "), latex("[AB]"), texte(" sous un angle droit, c'est le cercle de Thalès. "), latex("B"), texte(" est exclu car il annule le dénominateur.")],
    },
    {
      enonce: [texte("Pour un lieu défini par un quotient "), latex("\\dfrac{z-a}{z-b}"), texte(", le point "), latex("B"), texte(" (qui annule le dénominateur) fait toujours partie du lieu.")],
      reponse: false,
      justification: [texte("Ce pôle est TOUJOURS exclu : le quotient n'y est pas défini. C'est la condition d'existence à ne jamais oublier lorsqu'on conclut sur la nature du lieu.")],
    },
    {
      enonce: [texte("L'ensemble des points "), latex("M"), texte(" tels que "), latex("\\dfrac{z-a}{z-b}"), texte(" soit RÉEL est la droite "), latex("(AB)"), texte(", privée du point "), latex("B"), texte(".")],
      reponse: true,
      justification: [texte("Un rapport réel signale que "), latex("\\vec{MA}"), texte(" et "), latex("\\vec{MB}"), texte(" sont colinéaires, donc que "), latex("M"), texte(", "), latex("A"), texte(" et "), latex("B"), texte(" sont alignés ; "), latex("B"), texte(" reste exclu (dénominateur nul).")],
    },
    {
      enonce: [texte("L'équation "), latex("z+\\bar z=c|z|"), texte(" décrit un cercle centré en "), latex("O"), texte(".")],
      reponse: false,
      justification: [texte("En posant "), latex("z=x+iy"), texte(", elle s'écrit "), latex("2x=c\\sqrt{x^2+y^2}"), texte(", soit "), latex("\\cos\\theta=c/2"), texte(" : l'ANGLE est fixé et le module libre — ce sont une ou deux DEMI-DROITES issues de "), latex("O"), texte(", jamais un cercle.")],
    },
    {
      enonce: [texte("L'équation "), latex("z+\\bar z=c|z|"), texte(" (avec "), latex("|c|\\leq2"), texte(") se ramène à "), latex("\\cos\\theta=c/2"), texte(" et décrit DEUX demi-droites issues de "), latex("O"), texte(" en général ("), latex("\\pm\\theta_0"), texte("), mais UNE SEULE quand "), latex("\\theta_0=0"), texte(" ou "), latex("\\theta_0=\\pi"), texte(".")],
      reponse: true,
      justification: [latex("\\cos"), texte(" étant PAIRE, "), latex("+\\theta_0"), texte(" et "), latex("-\\theta_0"), texte(" conviennent tous deux ; ils ne coïncident que lorsque "), latex("\\sin\\theta_0=0"), texte(", c'est-à-dire "), latex("c=\\pm2"), texte(" ("), latex("\\theta_0=0"), texte(" ou "), latex("\\pi"), texte(").")],
    },
    {
      enonce: [texte("Pour trouver l'INTERSECTION de 2 lieux (par exemple une droite et un cercle centré en "), latex("O"), texte("), il suffit de résoudre l'une des 2 conditions : l'autre est alors automatiquement vérifiée.")],
      reponse: false,
      justification: [texte("Une intersection exige que les DEUX conditions soient vérifiées SIMULTANÉMENT : on résout le système formé par les 2 équations, jamais une seule d'entre elles.")],
    },
    {
      enonce: [texte("Si "), latex("z^n"), texte(" est un imaginaire pur ("), latex("z"), texte(" non nul), alors "), latex("n\\cdot\\arg(z)\\equiv0\\pmod{\\pi/2}"), texte(".")],
      reponse: false,
      justification: [texte("La bonne condition est "), latex("n\\cdot\\arg(z)\\equiv\\pi/2\\pmod\\pi"), texte(". La congruence proposée ici inclurait aussi les cas "), latex("\\equiv0\\pmod\\pi"), texte(", qui donnent un RÉEL, pas un imaginaire pur.")],
    },
    {
      enonce: [latex("z^n"), texte(" (pour "), latex("z"), texte(" non nul) est un IMAGINAIRE PUR si, et seulement si, "), latex("n\\cdot\\arg(z)\\equiv\\dfrac{\\pi}{2}\\pmod\\pi"), texte(".")],
      reponse: true,
      justification: [latex("z^n=r^ne^{in\\theta}"), texte(" est imaginaire pur "), latex("\\Leftrightarrow \\cos(n\\theta)=0 \\Leftrightarrow n\\theta\\equiv\\pi/2\\pmod\\pi"), texte(" (les deux directions "), latex("\\pi/2"), texte(" et "), latex("-\\pi/2"), texte(" étant réunies modulo "), latex("\\pi"), texte(").")],
    },
    {
      enonce: [texte("Pour "), latex("z"), texte(" d'argument "), latex("\\pi/6"), texte(" et "), latex("n=3"), texte(", "), latex("z^3"), texte(" est un réel positif.")],
      reponse: false,
      justification: [latex("3\\times\\pi/6=\\pi/2"), texte(" : "), latex("z^3"), texte(" est un IMAGINAIRE PUR, pas un réel — il faudrait "), latex("n\\theta\\equiv0\\pmod{2\\pi}"), texte(" pour un réel positif.")],
    },
    {
      enonce: [texte("Pour "), latex("z"), texte(" d'argument "), latex("\\pi/6"), texte(", le plus petit entier "), latex("n\\geq1"), texte(" tel que "), latex("z^n"), texte(" soit RÉEL est "), latex("n=12"), texte(".")],
      reponse: false,
      justification: [texte("« Réel » demande "), latex("n\\pi/6\\equiv0\\pmod\\pi"), texte(", soit "), latex("n"), texte(" multiple de "), latex("6"), texte(" : le plus petit est "), latex("n=6"), texte(". C'est « réel POSITIF » qui donne "), latex("n=12"), texte(" (condition modulo "), latex("2\\pi"), texte(", deux fois plus stricte).")],
    },
    {
      enonce: [texte("Deux droites "), latex("(AB)"), texte(" et "), latex("(CD)"), texte(" sont CONFONDUES dès que le rapport "), latex("\\dfrac{z_D-z_C}{z_B-z_A}"), texte(" est réel.")],
      reponse: false,
      justification: [texte("Un rapport réel ne dit que le PARALLÉLISME des directions : pour conclure qu'elles sont confondues, il faut en plus un point commun (par exemple vérifier que "), latex("\\dfrac{z_C-z_A}{z_B-z_A}"), texte(" est lui aussi réel).")],
    },
  ],
};
