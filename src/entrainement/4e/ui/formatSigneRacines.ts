import type { FragmentConsigne } from "../../export/genererFeuilleExercices";
import type { ExerciceSigneRacines, PhaseSigneRacines, VerdictSignes } from "../core/signeRacines.types";
import { autreRacine, delta, produit, racineEvidente, somme } from "../moteur/modeleSigneRacines";
import { polynome, q } from "./corrigeChapitre3";
import { souderPonctuation } from "./formatDetectiveVecteurs";

/**
 * Textes de gen114 « Signe des racines sans les calculer » (écran ET papier : une seule source).
 * Notation du cours (§ 1, « Relations de Viète » et « Le signe des racines, sans les calculer ») :
 * P = c/a, S = −b/a, Δ = b² − 4ac, x₁, x₂.
 */

type E = ExerciceSigneRacines;
const t = (valeur: string): FragmentConsigne => ({ type: "texte", valeur });
const l = (valeur: string): FragmentConsigne => ({ type: "latex", valeur });

export { souderPonctuation };

export const CONSIGNE_SIGNES = "Sans calculer les racines de cette équation, détermine leur signe.";
export const CONSIGNE_RACINE_EVIDENTE = "Trouve une racine évidente de cette équation, puis l'autre racine grâce au produit des racines ; donne enfin le signe des deux racines.";

export function consigneGenerale(e: E): string {
  return e.variante === "signes" ? CONSIGNE_SIGNES : CONSIGNE_RACINE_EVIDENTE;
}

export function equationLatex(e: E): string {
  return `${polynome([e.a, e.b, e.c])}=0`;
}

export const TITRES_PHASES: Record<PhaseSigneRacines, string> = {
  P: "Le produit P",
  delta: "Le discriminant",
  S: "La somme S",
  x1: "La racine évidente",
  x2: "L'autre racine",
  verdict: "Le signe des racines",
};

export const LIBELLES_VERDICTS: Record<VerdictSignes, string> = {
  opposes: "Deux racines de signes opposés",
  positives: "Deux racines positives",
  negatives: "Deux racines négatives",
  aucune: "Aucune racine",
};

export function consignePhase(e: E, phase: PhaseSigneRacines): FragmentConsigne[] {
  switch (phase) {
    case "P":
      return e.variante === "signes" ? [t("Calcule le produit des racines "), l("P=\\dfrac{c}{a}"), t(".")] : [t("Calcule le produit des racines "), l("P=\\dfrac{c}{a}"), t(".")];
    case "delta":
      return [l("P>0"), t(" : si elles existent, les racines ont le même signe. Calcule "), l("\\Delta"), t(" pour savoir si elles existent.")];
    case "S":
      return [l("\\Delta>0"), t(" et "), l("P>0"), t(" : deux racines de même signe. Calcule leur somme "), l("S=-\\dfrac{b}{a}"), t(".")];
    case "x1":
      return [t("Trouve une racine évidente "), l("x_1"), t(".")];
    case "x2":
      return [t("Déduis-en l'autre racine "), l("x_2"), t(".")];
    case "verdict":
      return [t("Quel est le signe des racines ?")];
  }
}

/** Préfixe LaTeX du champ. */
export function prefixePhase(phase: PhaseSigneRacines): string {
  switch (phase) {
    case "P":
      return "P=";
    case "delta":
      return "\\Delta=";
    case "S":
      return "S=";
    case "x1":
      return "x_1=";
    case "x2":
      return "x_2=";
    default:
      return "";
  }
}

/** Réponse attendue d'un écran (fragments). */
export function reponsePhase(e: E, phase: PhaseSigneRacines): FragmentConsigne[] {
  switch (phase) {
    case "P":
      return [l(`P=\\dfrac{${e.c}}{${e.a}}=${q(produit(e))}`)];
    case "delta":
      return [l(`\\Delta=${delta(e)}`)];
    case "S":
      return [l(`S=-\\dfrac{${e.b}}{${e.a}}=${q(somme(e))}`)];
    case "x1":
      return [l(`x_1=${racineEvidente(e)}`)];
    case "x2":
      return [l(`x_2=${q(autreRacine(e))}`)];
    case "verdict":
      return [t(`${LIBELLES_VERDICTS[e.verdict]}.`)];
  }
}

export function aidesPhase(e: E, phase: PhaseSigneRacines): FragmentConsigne[][] {
  const a: FragmentConsigne[][] = (() => {
    switch (phase) {
      case "P":
        return [[t("Repère "), l("a"), t(" et "), l("c"), t(" dans l'équation, puis divise :"), l("P=\\dfrac{c}{a}")], [t("Avec les coefficients de l'équation :"), l(`P=\\dfrac{${e.c}}{${e.a}}`)]];
      case "delta":
        return [[t("Discriminant :"), l("\\Delta=b^2-4ac")], [t("Remplace sans oublier les parenthèses autour des nombres négatifs :"), l(`\\Delta=${e.b < 0 ? `(${e.b})` : e.b}^2-4\\cdot ${e.a < 0 ? `(${e.a})` : e.a}\\cdot ${e.c < 0 ? `(${e.c})` : e.c}`)]];
      case "S":
        return [[t("Somme des racines (relations de Viète) :"), l("S=-\\dfrac{b}{a}")], [t("Avec les coefficients de l'équation :"), l(`S=-\\dfrac{${e.b}}{${e.a}}`)]];
      case "x1":
        return [[t("Teste "), l("a+b+c"), t(" et "), l("a-b+c"), t(" : si l'un vaut 0, "), l("1"), t(" ou "), l("-1"), t(" est racine.")], [t("Calcule :"), l(`a+b+c=${e.a}${e.b < 0 ? "" : "+"}${e.b}${e.c < 0 ? "" : "+"}${e.c}`)]];
      case "x2":
        return [[t("Le produit des racines vaut "), l("P"), t(" :"), l("x_1\\cdot x_2=P")], [t("Divise "), l("P"), t(" par la racine évidente :"), l(`x_2=\\dfrac{P}{${racineEvidente(e)}}`)]];
      case "verdict":
        return e.variante === "signes"
          ? [[t("Si "), l("P<0"), t(" : signes opposés. Si "), l("P>0"), t(" : même signe s'il y a des racines ("), l("\\Delta>0"), t("), celui de "), l("S"), t(".")], [t("Relis les signes trouvés aux écrans précédents.")]]
          : [[t("Tu connais les deux racines : regarde leurs signes.")], [t("Deux nombres de signes contraires ont un produit négatif.")]];
    }
  })();
  return a.map(souderPonctuation);
}

export const AIDE_SAISIE = "Écris un nombre (fraction acceptée, par exemple −7/2).";
