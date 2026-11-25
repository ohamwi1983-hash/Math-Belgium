import type { ExercicePointsDroitesRemarquablesTriangle } from "./core6e/pointsDroitesRemarquablesTriangle.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExercicePointsDroitesRemarquablesTriangle } from "./generateurs6e/pointsDroitesRemarquablesTriangle";
import type { PhasePointsDroitesRemarquablesTriangle } from "./moteur6e/typesPointsDroitesRemarquablesTriangle";
import { DEFINITION_6GEN54, attentesPointsDroitesRemarquablesTriangle } from "./moteur6e/verificationPointsDroitesRemarquablesTriangle";
import { FORMAT_6GEN54, figure6gen54 } from "./ui6e/formatPointsDroitesRemarquablesTriangle";
import { AppCombinatoire } from "./components6e/AppCombinatoire";
import type { ConfigAppCombinatoire } from "./components6e/AppCombinatoire";
import { FigureLieux } from "./components6e/FigureLieux";
import { phasesPourExercice } from "./moteur6e/typesPointsDroitesRemarquablesTriangle";
import { correctionDetailleePointsDroites } from "./generateurs6e/pointsDroitesRemarquablesTriangle/corrigeDetaille";
import { corrigeDeLEcran } from "./ui6e/corrigeCombinatoire";
import { CorrigeDetailleEcran } from "../components/CorrigeDetailleEcran";

/**
 * `6gen54` — Constructions analytiques dans le triangle (6e ch. 9, § 1, processus 2 APPLIQUER ; audit
 * du chapitre, lots B et C ; décision 1 : renommé d'après ce qu'il fait — les points remarquables
 * vont au nouveau 6gen124). Socle commun du 6e ch. 7 (`AppCombinatoire`) : illisible sans tentative,
 * choix fermé à une tentative jugé ✗ / ✓, `?code=`, corrigé consultable après chaque réponse.
 * Figure : la configuration, puis chaque point cherché tracé APRÈS la réponse.
 */
const CONFIG: ConfigAppCombinatoire<ExercicePointsDroitesRemarquablesTriangle, PhasePointsDroitesRemarquablesTriangle> = {
  id: "6gen54",
  titre: "Constructions analytiques dans le triangle",
  sousTitre: "Chapitre 9 — Lieux géométriques",
  catalogue: CATALOGUE_VARIANTES,
  genererLibre: genererExercicePointsDroitesRemarquablesTriangle,
  genererVariante: construireAvecVarianteId,
  definition: DEFINITION_6GEN54,
  attentes: attentesPointsDroitesRemarquablesTriangle,
  recapSepare: true,
  format: FORMAT_6GEN54,
  complement: (e, _p, closes) => <FigureLieux svg={figure6gen54(e, closes)} />,
  pucesAvantPremierEcran: (e) => (e.famille === "E" ? 2 : null),
  // Corrigé « comme au tableau » de l'écran (lot E) : même source que le papier, une lettre par écran.
  corrigeDetaille: (e, p) => <CorrigeDetailleEcran etapes={corrigeDeLEcran(correctionDetailleePointsDroites(e), phasesPourExercice(e), p)} />,
};

export function App6gen54() {
  return <AppCombinatoire config={CONFIG} />;
}
