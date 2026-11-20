import { AppEcransTrigo } from "../5e-4h/components5e/AppEcransTrigo";
import type { ConfigAppEcrans } from "../5e-4h/components5e/AppEcransTrigo";
import type { ExerciceModeleSaturation, VarianteModeleSaturation } from "./core6e/modeleSaturation";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceModeleSaturation } from "./generateurs6e/modeleSaturation";
import { DEFINITION_MODELE_SATURATION } from "./ui6e/definitionModeleSaturation";
import type { PhaseModeleSaturation } from "./ui6e/formatModeleSaturation";

/**
 * `6gen150` — « Modèle L + C·qᵗ » (6e ch. 2, § 7, processus 3 TRANSFÉRER, calculatrice
 * indispensable) : trois mesures exactes, rapport des écarts, L et C, q, prévision, seuil. Socle
 * d'écrans partagé (`AppEcransTrigo`, `?code=` = mêmes fonctions que l'adaptateur papier).
 */
const CONFIG: ConfigAppEcrans<ExerciceModeleSaturation, PhaseModeleSaturation> = {
  id: "6gen150",
  titre: "Modèle L + C·qᵗ : se rapprocher d'une valeur limite",
  eyebrow: "6e — Entraînement",
  sousTitre: "Chapitre 2 — Fonctions exponentielles",
  definition: DEFINITION_MODELE_SATURATION,
  catalogue: CATALOGUE_VARIANTES,
  genererLibre: genererExerciceModeleSaturation,
  genererVariante: (id) => construireAvecVarianteId(id as VarianteModeleSaturation),
};

export function App6gen150() {
  return <AppEcransTrigo config={CONFIG} />;
}
