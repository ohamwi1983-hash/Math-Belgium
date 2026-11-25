import type { ExerciceLireNuage } from "../core5e/lireNuage";
import type { DefinitionEcrans } from "./ecransTrigo.types";
import type { PhaseLireNuage } from "./formatLireNuage";
import { aide1, aide2, bonneOption, consigne, consigneGenerale, explicationChoix, figureEnonce, figureNuageSeul, indiceNuage, libelle, options, phases, recap, reponse } from "./formatLireNuage";
import { diagnostiquer, piege } from "../moteur5e/verificationLireNuage";
import { correctionDetailleeLireNuage } from "../generateurs5e/lireNuage/corrigeDetaille";

/** `5gen76` : choix fermés seulement (une tentative, jugés ✗ / ✓, message ciblé avec la réponse). */
export const DEFINITION_LIRE_NUAGE: DefinitionEcrans<ExerciceLireNuage, PhaseLireNuage> = {
  phases,
  estChoix: () => true,
  mode: (e, p) => ({ type: "choix", options: options(e, p) }),
  libelle,
  consigneGenerale,
  figure: (e, p) => (e.variante === "associer" ? figureNuageSeul(e, indiceNuage(p)) : figureEnonce(e)),
  consigne,
  aide1,
  aide2,
  aidesChoixDeuxNiveaux: true,
  diagnostiquer,
  piege,
  piegeChoixRevele: true,
  bonneOption,
  explicationChoix,
  messageIllisible: () => "Choisis une proposition.",
  reponseAttendue: reponse,
  recap,
  correction: correctionDetailleeLireNuage,
};
