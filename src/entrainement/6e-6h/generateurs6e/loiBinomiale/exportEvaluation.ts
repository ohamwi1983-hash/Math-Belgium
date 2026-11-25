import type { ExerciceLoiBinomiale } from "../../core6e/loiBinomiale.types";
import type { ProfilInstance } from "../../../export/genererFeuilleExercices";
import { FORMAT_6GEN50 } from "../../ui6e/formatLoiBinomiale";
import { phasesPourExercice } from "../../moteur6e/typesLoiBinomiale";
import type { PhaseLoiBinomiale } from "../../moteur6e/typesLoiBinomiale";
import { construireAdaptateurProvisoire } from "../adaptateurVariablesAleatoires";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceLoiBinomiale } from "./index";

/**
 * Adaptateur papier de `6gen50` — PROVISOIRE (lots B et C ; lot E à venir). L'écran « diagramme »
 * (trois diagrammes à comparer, propres à l'appli) n'est pas imprimé. Profil (règle du 24/11) :
 * A et B sans `calcul` (décider, construire la loi puis E, V, σ : la démarche est évaluée) ; C exige
 * le logarithme → `calculatriceIndispensable`.
 */
export function profilLoiBinomiale(_e: ExerciceLoiBinomiale): ProfilInstance {
  return { casParticulier: null };
}

export const adaptateurEvaluationLoiBinomiale = construireAdaptateurProvisoire<ExerciceLoiBinomiale, PhaseLoiBinomiale>({
  titreDocument: "Loi binomiale — Évaluation",
  nomFichierBase: "loi-binomiale",
  genererInstance: genererExerciceLoiBinomiale,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: construireAvecVarianteId,
  format: FORMAT_6GEN50,
  phases: phasesPourExercice,
  phasesPapier: (e) => phasesPourExercice(e).filter((p) => p !== "bDiagramme"),
  profilInstance: profilLoiBinomiale,
  calculatriceIndispensable: ["C_trouverN"],
});
