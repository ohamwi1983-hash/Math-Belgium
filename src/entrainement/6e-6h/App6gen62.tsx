import { correctionDetailleeTangentesConique } from "./generateurs6e/tangentesConique/corrigeDetaille";
import { phasesPourExercice as phasesCorrige62 } from "./moteur6e/typesTangentesConique";
import { corrigeDeLEcran } from "./ui6e/corrigeCombinatoire";
import { CorrigeDetailleEcran } from "../components/CorrigeDetailleEcran";
import type { ExerciceTangentesConique } from "./core6e/tangentesConique.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceTangentesConique } from "./generateurs6e/tangentesConique";
import type { PhaseTangentesConique } from "./moteur6e/typesTangentesConique";
import { pucesMasquees6gen62 } from "./moteur6e/typesTangentesConique";
import { DEFINITION_6GEN62, attentesTangentesConique } from "./moteur6e/verificationTangentesConique";
import { FORMAT_6GEN62, figure6gen62 } from "./ui6e/formatTangentesConique";
import { AppCombinatoire } from "./components6e/AppCombinatoire";
import type { ConfigAppCombinatoire } from "./components6e/AppCombinatoire";
import { FigureLieux } from "./components6e/FigureLieux";

/**
 * `6gen62` — Tangentes à une conique (6e ch. 10, § 5, processus 2 APPLIQUER ; audit, lots B et C). Socle
 * commun du 6e ch. 7 (`AppCombinatoire`). Verdicts (B : deux tangentes ou aucune ; C : point extérieur
 * ou intérieur) tirés à parts égales, choix fermés à une tentative, trois puces tant qu'ils ne sont pas
 * jugés. Figure : la conique et les données, les tangentes APRÈS la réponse.
 */
const CONFIG: ConfigAppCombinatoire<ExerciceTangentesConique, PhaseTangentesConique> = {
  id: "6gen62",
  titre: "Tangentes à une conique",
  sousTitre: "Chapitre 10 — Les coniques",
  catalogue: CATALOGUE_VARIANTES,
  genererLibre: genererExerciceTangentesConique,
  genererVariante: construireAvecVarianteId,
  definition: DEFINITION_6GEN62,
  attentes: attentesTangentesConique,
  recapSepare: true,
  format: FORMAT_6GEN62,
  complement: (e, _p, closes) => <FigureLieux svg={figure6gen62(e, closes)} />,
  pucesMasquees: pucesMasquees6gen62,
  // Corrigé « comme au tableau » de l'écran (lot E) : même source que le papier, une lettre par écran.
  corrigeDetaille: (e, p) => <CorrigeDetailleEcran etapes={corrigeDeLEcran(correctionDetailleeTangentesConique(e), phasesCorrige62(e), p)} />,
};

export function App6gen62() {
  return <AppCombinatoire config={CONFIG} />;
}
