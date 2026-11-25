import type { ExerciceCercles } from "./core6e/cercles.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceCercles } from "./generateurs6e/cercles";
import type { PhaseCercles } from "./moteur6e/typesCercles";
import { DEFINITION_6GEN55, attentesCercles } from "./moteur6e/verificationCercles";
import { FORMAT_6GEN55, figure6gen55 } from "./ui6e/formatCercles";
import { AppCombinatoire } from "./components6e/AppCombinatoire";
import type { ConfigAppCombinatoire } from "./components6e/AppCombinatoire";
import { FigureLieux } from "./components6e/FigureLieux";

/**
 * `6gen55` — Cercles (6e ch. 9, § 2, processus 2 APPLIQUER ; audit du chapitre, lots B et C). Socle
 * commun du 6e ch. 7 (`AppCombinatoire`). Famille B : le nombre de cercles (0, 1, 2) est un choix
 * fermé tiré à parts égales ; trois puces montrées tant qu'il n'est pas jugé (le nombre d'écrans
 * trahirait « aucun »). Figure : les points, droites et médiatrices, puis le cercle APRÈS la réponse.
 */
const CONFIG: ConfigAppCombinatoire<ExerciceCercles, PhaseCercles> = {
  id: "6gen55",
  titre: "Cercles",
  sousTitre: "Chapitre 9 — Lieux géométriques",
  catalogue: CATALOGUE_VARIANTES,
  genererLibre: genererExerciceCercles,
  genererVariante: construireAvecVarianteId,
  definition: DEFINITION_6GEN55,
  attentes: attentesCercles,
  recapSepare: true,
  format: FORMAT_6GEN55,
  complement: (e, _p, closes) => <FigureLieux svg={figure6gen55(e, closes)} />,
  pucesAvantPremierEcran: (e) => (e.famille === "B" ? 3 : null),
};

export function App6gen55() {
  return <AppCombinatoire config={CONFIG} />;
}
