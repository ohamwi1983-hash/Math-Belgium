import type { ExerciceTauxInstantane } from "../core5e/tauxInstantane";
import { tauxInstantane, tauxMoyen } from "../core5e/tauxInstantane";
import type { DefinitionEcrans } from "./ecransTrigo.types";
import type { PhaseTauxInstantane } from "./formatTauxInstantane";
import { aide1, aide2, champs, consigne, consigneGenerale, libelle, messageIllisible, optionsInterpretation, optionsUnite, PHASES, recap, reponse } from "./formatTauxInstantane";
import { diagnostiquer, piege } from "../moteur5e/verificationTauxInstantane";
import { egal, lireNombre } from "../moteur5e/lectureApplicationsDerivees";
import { correctionDetailleeTauxInstantane } from "../generateurs5e/tauxInstantane/corrigeDetaille";

const CHOIX: PhaseTauxInstantane[] = ["unite", "interpretation"];

/** Décimal plus court que la valeur exacte et égal à son arrondi (2,1 pour 2,125) : arrondi. */
function arrondi(brut: string, cible: number): boolean {
  const v = lireNombre(brut);
  if (v === null || egal(v, cible)) return false;
  const m = /^\s*[-−–—]?\d+[.,](\d+)\s*$/.exec(brut.replace(/^.*=/, "").replace(/\s*[^\d\s,.]+$/, ""));
  if (!m) return false;
  const d = m[1]!.length;
  const f = 10 ** d;
  return Math.abs(v - Math.round(cible * f) / f) < 1e-9;
}

/** `5gen70` : taux moyen, dérivée, taux instantané (champs), unité et interprétation (choix fermés
 * jugés ✗ / ✓). */
export const DEFINITION_TAUX_INSTANTANE: DefinitionEcrans<ExerciceTauxInstantane, PhaseTauxInstantane> = {
  phases: () => PHASES,
  estChoix: (_e, p) => CHOIX.includes(p),
  mode: (e, p) => {
    if (p === "unite") return { type: "choix", options: optionsUnite(e) };
    if (p === "interpretation") return { type: "choix", options: optionsInterpretation(e) };
    return { type: "champs", champs: champs(e, p) };
  },
  libelle,
  consigneGenerale,
  consigne,
  aide1,
  aide2,
  aidesChoixDeuxNiveaux: true,
  diagnostiquer,
  piege,
  piegeChoixRevele: true,
  bonneOption: (_e, p) => (p === "unite" ? "u0" : "i0"),
  approchee: (e, p, valeurs) => {
    const cible = p === "moyen" ? tauxMoyen(e) : p === "instantane" ? tauxInstantane(e) : null;
    if (cible === null || !arrondi(valeurs[0] ?? "", cible)) return null;
    return "Valeur arrondie : ce taux se calcule exactement (décimal ou fraction). Cette saisie ne compte pas comme une tentative.";
  },
  messageIllisible,
  reponseAttendue: reponse,
  recap,
  correction: correctionDetailleeTauxInstantane,
};
