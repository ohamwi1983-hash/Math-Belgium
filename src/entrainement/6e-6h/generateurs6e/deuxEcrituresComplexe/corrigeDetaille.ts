import { argumentBrut, argumentZ, cosZ, sinZ } from "../../core6e/deuxEcrituresComplexe";
import { lignesRamenerAngle } from "../../ui6e/corrigeComplexes";
import type { ExerciceDeuxEcritures, Facteur } from "../../core6e/deuxEcrituresComplexe";
import type { EtapeCorrection, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, lignesDepuisChaine, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import {
  calculAlgebriqueLatex,
  calculArgumentFacteurLatex,
  calculArgumentZLatex,
  calculIdentificationLatex,
  calculModuleFacteurLatex,
  calculModuleZLatex,
  douziemeLatex,
  facteurLatex,
  formeAlgebriqueLatex,
  formeTrigonometriqueLatex,
  reponseFragments,
  trigLatex,
} from "../../ui6e/formatDeuxEcritures";

/**
 * Corrigé détaillé « comme au tableau » de `6gen94` (valeurs exactes par deux écritures d'un même
 * complexe) — règle `.claude/rules/feuilles-evaluations.md` (« Corrigé détaillé — comme au
 * tableau »). Les chaînes de calcul sont celles de l'écran (`ui6e/formatDeuxEcritures.ts`), éclatées
 * en une transformation par ligne (`lignesDepuisChaine`) et justifiées. Étapes a–d = écrans.
 */

const COURS = "(cours, § 4)";

/** « cos θⱼ = …, sin θⱼ = … ⇒ θⱼ = … » de l'écran : deux chaînes (cos, sin) et l'angle. */
function lignesArgumentFacteur(f: Facteur, indice: string): { lignes: LigneCalcul[]; angle: string } {
  const brut = calculArgumentFacteurLatex(f, indice);
  const [cs, angle] = brut.split("\\ \\Rightarrow\\ ");
  const [c, s] = cs.split(",\\ ");
  return { lignes: [...lignesDepuisChaine(c, ["cos θ = a / r"]), ...lignesDepuisChaine(s, ["sin θ = b / r"])], angle };
}

export function correctionDetailleeDeuxEcritures(e: ExerciceDeuxEcritures): EtapeCorrection[] {
  const quotient = e.variante === "quotient";
  const th = argumentZ(e);
  const algebrique = calculAlgebriqueLatex(e);
  const lignesA = quotient
    ? lignesDepuisChaine(algebrique, ["on multiplie haut et bas par le conjugué du dénominateur", "on développe, i² = −1 ; (c + di)(c − di) = c² + d²", "on simplifie"])
    : lignesDepuisChaine(algebrique, ["", "on distribue", "car i² = −1, on regroupe"]);
  // Chaîne de l'écran jusqu'à l'angle brut θ₁ ± θ₂ ; la réduction dans ]−π ; π] est réécrite ligne
  // à ligne (l'écran enchaîne « brut = brut − 2π », qui n'est pas une égalité).
  const brut = argumentBrut(e);
  const reduit = lignesRamenerAngle(brut, 12);
  const membresArg = calculArgumentZLatex(e).split("=");
  const argZ = (reduit.length ? membresArg.slice(0, 5) : membresArg).join("=");
  const justifsArg = [quotient ? "arg(z₁/z₂) = arg z₁ − arg z₂" : "arg(z₁z₂) = arg z₁ + arg z₂", "arguments de l'étape 2", "même dénominateur"];
  const a1 = lignesArgumentFacteur(e.z1, "1");
  const a2 = lignesArgumentFacteur(e.z2, "2");
  const valeurs = [latex(`${trigLatex("cos", th)}=${douziemeLatex(cosZ(e))}`), texte(" et "), latex(`${trigLatex("sin", th)}=${douziemeLatex(sinZ(e))}`)];
  return [
    quotient
      ? utilise("a", [texte(`Pour diviser par un complexe, on multiplie le numérateur et le dénominateur par le conjugué du dénominateur, qui devient réel ${COURS.replace("4", "1")} : `), latex("(c+di)(c-di)=c^2+d^2"), texte(".")])
      : utilise("a", [texte("On développe le produit terme à terme et on remplace "), latex("i^2"), texte(" par "), latex("-1"), texte(` ${COURS.replace("4", "1")}.`)]),
    calcul("a", lignesA),
    resultat("a", [latex(`z=${formeAlgebriqueLatex(e)}`)]),
    ...(quotient ? [] : [piege("a", [latex("i^2"), texte(" vaut "), latex("-1"), texte(" : le produit des deux parties imaginaires change de signe.")])]),
    utilise("b", [texte("Module "), latex("r=\\sqrt{a^2+b^2}"), texte(", puis l'angle "), latex("\\theta"), texte(" tel que "), latex("\\cos\\theta=\\dfrac{a}{r}"), texte(" et "), latex("\\sin\\theta=\\dfrac{b}{r}"), texte(` (angle remarquable) ${COURS}.`)]),
    calcul("b", [...lignesDepuisChaine(calculModuleFacteurLatex(e.z1, "z_1"), ["|a + bi| = √(a² + b²)"]), ...a1.lignes], [latex(`z_1=${facteurLatex(e.z1)}`)], "z₁"),
    calcul("b", [...lignesDepuisChaine(calculModuleFacteurLatex(e.z2, "z_2"), ["|a + bi| = √(a² + b²)"]), ...a2.lignes], [latex(`z_2=${facteurLatex(e.z2)}`)], "z₂"),
    resultat("b", reponseFragments(e, "facteurs")),
    utilise(
      "c",
      quotient
        ? [texte("Un quotient divise les modules et soustrait les arguments : "), latex("\\left|\\dfrac{z_1}{z_2}\\right|=\\dfrac{|z_1|}{|z_2|}"), texte(" et "), latex("\\arg\\dfrac{z_1}{z_2}=\\arg z_1-\\arg z_2"), texte(".")]
        : [texte("Un produit multiplie les modules et additionne les arguments : "), latex("|z_1z_2|=|z_1|\\cdot|z_2|"), texte(" et "), latex("\\arg(z_1z_2)=\\arg z_1+\\arg z_2"), texte(".")],
    ),
    calcul("c", lignesDepuisChaine(calculModuleZLatex(e), [quotient ? "|z₁/z₂| = |z₁| / |z₂|" : "|z₁z₂| = |z₁| · |z₂|", "modules de l'étape 2", "on simplifie"]), [], "Module"),
    calcul("c", [...lignesDepuisChaine(argZ, justifsArg), ...reduit], [], "Argument"),
    resultat("c", [latex(`z=${formeTrigonometriqueLatex(e)}`)]),
    ...(quotient
      ? [piege("c", [texte("Additionner les arguments d'un quotient : "), latex("\\arg\\dfrac{z_1}{z_2}=\\arg z_1-\\arg z_2"), texte(", dans cet ordre ; une somme donnerait un autre angle, donc d'autres valeurs de "), latex(trigLatex("cos", th)), texte(" et "), latex(trigLatex("sin", th)), texte(".")])]
      : []),
    utilise("d", [texte("Les deux écritures désignent le même nombre : "), latex(`${formeTrigonometriqueLatex(e)}=${formeAlgebriqueLatex(e)}`), texte(". On identifie les parties réelles, puis les parties imaginaires : "), latex("r\\cos\\theta=\\mathrm{Re}(z)"), texte(" et "), latex("r\\sin\\theta=\\mathrm{Im}(z)"), texte(".")]),
    calcul("d", [
      ...lignesDepuisChaine(calculIdentificationLatex(e, "cos"), ["on divise par le module", "valeurs des étapes 1 et 3", "on multiplie haut et bas par √2"]),
      ...lignesDepuisChaine(calculIdentificationLatex(e, "sin"), ["on divise par le module", "valeurs des étapes 1 et 3", "on multiplie haut et bas par √2"]),
    ]),
    resultat("d", valeurs),
    verification("d", [texte("On doit avoir "), latex("\\cos^2\\theta+\\sin^2\\theta=1"), texte(" : avec les valeurs approchées, "), latex(`${calculIdentificationLatex(e, "cos").split("\\approx ")[1].replace(/^-(.*)$/, "($&)")}^2+${calculIdentificationLatex(e, "sin").split("\\approx ")[1].replace(/^-(.*)$/, "($&)")}^2\\approx 1`), texte(" ✓")]),
    ...(quotient ? [] : [piege("d", [texte("Oublier le module en identifiant : "), latex("r\\cos\\theta=\\mathrm{Re}(z)"), texte(", donc "), latex("\\cos\\theta=\\dfrac{\\mathrm{Re}(z)}{r}"), texte(" ; ici "), latex("r\\neq1"), texte(", recopier la partie réelle ne donne pas le cosinus.")])]),
  ];
}

