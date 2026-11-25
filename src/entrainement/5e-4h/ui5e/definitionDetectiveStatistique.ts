import type { ExerciceDetectiveStat } from "../core5e/detectiveStatistique";
import type { DefinitionEcrans } from "./ecransTrigo.types";
import { tx } from "./ecransTrigo.types";
import type { PhaseDetectiveStat } from "./formatDetectiveStatistique";
import { aide1, aide2, champs, consigne, consigneGenerale, explicationChoix, libelle, messageIllisible, numeroLigneFausse, optionsCorrection, optionsErreur, optionsLigne, PHASES, recap, reponse } from "./formatDetectiveStatistique";
import { copie } from "../moteur5e/modeleDetectiveStatistique";
import { approchee, diagnostiquer, piege } from "../moteur5e/verificationDetectiveStatistique";
import { correctionDetailleeDetectiveStatistique } from "../generateurs5e/detectiveStatistique/corrigeDetaille";

/** `5gen81` : ligne fausse (choix), erreur (choix, 4 descriptions), correction (champ(s) ou choix). */
export const DEFINITION_DETECTIVE_STATISTIQUE: DefinitionEcrans<ExerciceDetectiveStat, PhaseDetectiveStat> = {
  phases: () => PHASES,
  estChoix: (e, p) => p !== "correction" || copie(e).valeur.genre === "choix",
  mode: (e, p) => {
    if (p === "ligne") return { type: "choix", options: optionsLigne(e) };
    if (p === "erreur") return { type: "choix", options: optionsErreur(e) };
    if (copie(e).valeur.genre === "choix") return { type: "choix", options: optionsCorrection(e) };
    return { type: "champs", champs: champs(e) };
  },
  libelle,
  consigneGenerale,
  tableau: (e) => copie(e).tableau,
  copie: (e, p) => ({ lignes: copie(e).lignes, signalee: p === "ligne" ? null : copie(e).ligneFausse }),
  consigne,
  aide1,
  aide2,
  aidesChoixDeuxNiveaux: true,
  approchee,
  diagnostiquer,
  piege,
  piegeChoixRevele: true,
  bonneOption: (e, p) => (p === "ligne" ? `L${numeroLigneFausse(e)}` : p === "erreur" ? e.variante : "C0"),
  messageIllisible,
  reponseAttendue: reponse,
  recap,
  explicationChoix,
  correction: correctionDetailleeDetectiveStatistique,
  apercuEnonce: (e) => [tx(`Copie d'élève de ${copie(e).lignes.length} lignes`)],
};
