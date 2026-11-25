import type { ExerciceLoiPoisson } from "../../core6e/loiPoisson.types";
import { FORMAT_6GEN53 } from "../../ui6e/formatLoiPoisson";
import { phasesPourExercice } from "../../moteur6e/typesLoiPoisson";
import type { PhaseLoiPoisson } from "../../moteur6e/typesLoiPoisson";
import { construireAdaptateurProvisoire } from "../adaptateurVariablesAleatoires";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceLoiPoisson } from "./index";

/**
 * Adaptateur papier de `6gen53` — PROVISOIRE (lots B et C ; lot E à venir). Profil : pas de `calcul`
 * (λ à ajuster, conditions à juger : la démarche est évaluée, décision du 24/11) ; B exige e^(−λ) →
 * `calculatriceIndispensable` sur ses variantes (A non : un verdict « non » se décide sans calcul).
 */
export const adaptateurEvaluationLoiPoisson = construireAdaptateurProvisoire<ExerciceLoiPoisson, PhaseLoiPoisson>({
  titreDocument: "Loi de Poisson — Évaluation",
  nomFichierBase: "loi-poisson",
  genererInstance: genererExerciceLoiPoisson,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: construireAvecVarianteId,
  format: FORMAT_6GEN53,
  phases: phasesPourExercice,
  profilInstance: () => ({ casParticulier: null }),
  calculatriceIndispensable: ["B_exactement", "B_entreAetB", "B_auPlus", "B_auMoins"],
});
