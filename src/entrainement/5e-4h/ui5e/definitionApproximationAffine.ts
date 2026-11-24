import type { ExerciceApproximationAffine } from "../core5e/approximationAffine";
import { approximation, fa, fpa } from "../core5e/approximationAffine";
import type { DefinitionEcrans } from "./ecransTrigo.types";
import type { PhaseApproximationAffine } from "./formatApproximationAffine";
import { aide1, aide2, champs, consigne, consigneGenerale, libelle, messageIllisible, PHASES, recap, reponse } from "./formatApproximationAffine";
import { diagnostiquer, piege } from "../moteur5e/verificationApproximationAffine";
import { egal, lireNombre } from "../moteur5e/lectureApplicationsDerivees";
import { arrondiDecimales, nombreDecimales } from "./ecrituresApplicationsDerivees";
import { correctionDetailleeApproximationAffine } from "../generateurs5e/approximationAffine/corrigeDetaille";

/** Décimal écrit avec MOINS de décimales que la valeur exacte attendue et égal à son arrondi
 * (2,01 pour 2,005 ; 0,25 pour 0,249375) : arrondie, jamais une autre erreur. */
function arrondie(brut: string, cible: number): boolean {
  const v = lireNombre(brut);
  if (v === null || egal(v, cible)) return false;
  const m = /^\s*[-−–—]?\d+(?:[.,](\d+))?\s*$/.exec(brut.replace(/^.*[=≈]/, ""));
  if (!m) return false;
  const d = m[1]?.length ?? 0;
  if (d >= nombreDecimales(cible)) return false;
  return egal(v, arrondiDecimales(cible, d)) && d >= 1;
}

/** `5gen68` : a et h (deux nombres), f′(x) (expression), f(a) et f′(a), approximation, erreur. */
export const DEFINITION_APPROXIMATION_AFFINE: DefinitionEcrans<ExerciceApproximationAffine, PhaseApproximationAffine> = {
  phases: () => PHASES,
  estChoix: () => false,
  mode: (e, p) => ({ type: "champs", champs: champs(e, p) }),
  libelle,
  consigneGenerale,
  consigne,
  aide1,
  aide2,
  diagnostiquer,
  piege,
  approchee: (e, p, valeurs) => {
    if (p === "valeurs" && (arrondie(valeurs[0] ?? "", fa(e)) || arrondie(valeurs[1] ?? "", fpa(e))))
      return "Valeur arrondie : donne la valeur exacte (fraction ou décimal exact). Cette saisie ne compte pas comme une tentative.";
    if (p === "approx" && arrondie(valeurs[0] ?? "", approximation(e)))
      return "Valeur arrondie : l'approximation affine se calcule exactement, sans arrondir. Cette saisie ne compte pas comme une tentative.";
    return null;
  },
  messageIllisible,
  reponseAttendue: reponse,
  recap,
  correction: correctionDetailleeApproximationAffine,
};
