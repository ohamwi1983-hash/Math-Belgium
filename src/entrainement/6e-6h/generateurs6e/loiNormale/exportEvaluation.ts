import type { ExerciceLoiNormale } from "../../core6e/loiNormale.types";
import type { ProfilInstance } from "../../../export/genererFeuilleExercices";
import { FORMAT_6GEN51 } from "../../ui6e/formatLoiNormale";
import { phasesPourExercice } from "../../moteur6e/typesLoiNormale";
import type { PhaseLoiNormale } from "../../moteur6e/typesLoiNormale";
import { construireAdaptateurProvisoire } from "../adaptateurVariablesAleatoires";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceLoiNormale } from "./index";

/**
 * Adaptateur papier de `6gen51` — PROVISOIRE (lot C ; la table de Φ en annexe et le corrigé « comme au
 * tableau » sont le lot E).
 * Profil (règle validée le 24/11/2026, Casio Graph Math+ : `NormCD`, `InvNormCD` avec queue gauche,
 * droite ou centrale) : `calcul: 'exacte'` quand la calculatrice donne directement la réponse — A et B
 * (probabilité), C et D « ≤ », « ≥ » et « centrée ». C et D « depuis 0 » (P(0 ≤ Z ≤ t) : la
 * transformation reste à faire) et E (règle empirique) : pas de `calcul`.
 */
export function profilLoiNormale(e: ExerciceLoiNormale): ProfilInstance {
  if (e.famille === "A" || e.famille === "B") return { casParticulier: null, calcul: "exacte" };
  if ((e.famille === "C" || e.famille === "D") && e.sousType !== "depuisZero") return { casParticulier: null, calcul: "exacte" };
  return { casParticulier: null };
}

export const adaptateurEvaluationLoiNormale = construireAdaptateurProvisoire<ExerciceLoiNormale, PhaseLoiNormale>({
  titreDocument: "Loi normale — Évaluation",
  nomFichierBase: "loi-normale",
  genererInstance: genererExerciceLoiNormale,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: construireAvecVarianteId,
  format: FORMAT_6GEN51,
  phases: phasesPourExercice,
  profilInstance: profilLoiNormale,
});
