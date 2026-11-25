import type { ExerciceLieuxGeometriquesParametres, PhaseLieuxGeometriquesParametres } from "./core6e/lieuxGeometriquesParametres.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceLieuxGeometriquesParametres } from "./generateurs6e/lieuxGeometriquesParametres";
import { DEFINITION_6GEN56, attentesLieuxGeometriquesParametres } from "./moteur6e/verificationLieuxGeometriquesParametres";
import { FORMAT_6GEN56, figure6gen56 } from "./ui6e/formatLieuxGeometriquesParametres";
import { AppCombinatoire } from "./components6e/AppCombinatoire";
import type { ConfigAppCombinatoire } from "./components6e/AppCombinatoire";
import { FigureLieux } from "./components6e/FigureLieux";

/**
 * `6gen56` — Lieux géométriques et élimination de paramètre (6e ch. 9, § 4 et § 6, processus 2
 * APPLIQUER ; audit du chapitre, lots B et C). Socle commun du 6e ch. 7 (`AppCombinatoire`). E
 * « parallèles » et « carré » : la nature est le premier écran, et le nombre d'écrans suivants (zéro
 * pour le vide) la trahirait — deux puces tant qu'elle n'est pas jugée. Figure : la configuration,
 * puis le lieu (cercle, point, droites, bande, polygone, demi-parabole…) APRÈS la dernière réponse.
 */
const CONFIG: ConfigAppCombinatoire<ExerciceLieuxGeometriquesParametres, PhaseLieuxGeometriquesParametres> = {
  id: "6gen56",
  titre: "Lieux géométriques et élimination de paramètre",
  sousTitre: "Chapitre 9 — Lieux géométriques",
  catalogue: CATALOGUE_VARIANTES,
  genererLibre: genererExerciceLieuxGeometriquesParametres,
  genererVariante: construireAvecVarianteId,
  definition: DEFINITION_6GEN56,
  attentes: attentesLieuxGeometriquesParametres,
  recapSepare: true,
  format: FORMAT_6GEN56,
  complement: (e, _p, closes) => <FigureLieux svg={figure6gen56(e, closes)} />,
  pucesAvantPremierEcran: (e) => (e.sousType === "E_paralleles" || e.sousType === "E_carre" ? 2 : null),
};

export function App6gen56() {
  return <AppCombinatoire config={CONFIG} />;
}
