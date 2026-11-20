import { AppEcransTrigo } from "../5e-4h/components5e/AppEcransTrigo";
import type { ConfigAppEcrans } from "../5e-4h/components5e/AppEcransTrigo";
import type { ExerciceEtudeCyclo, VarianteEtudeCyclo } from "./core6e/etudeCyclometrique";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceEtudeCyclo } from "./generateurs6e/etudeCyclometrique";
import { DEFINITION_ETUDE_CYCLO } from "./ui6e/definitionEtudeCyclometrique";
import type { PhaseEtudeCyclo } from "./ui6e/formatEtudeCyclometrique";

/**
 * `6gen157` — « Étude d'une fonction cyclométrique » (6e ch. 1, § 4–5, processus 3 TRANSFÉRER, valeurs
 * exactes) : domaine, dérivée, zéros de f′, variations, valeurs du tableau. Socle d'écrans partagé
 * (`AppEcransTrigo`, `?code=` = mêmes fonctions que l'adaptateur papier).
 */
const CONFIG: ConfigAppEcrans<ExerciceEtudeCyclo, PhaseEtudeCyclo> = {
  id: "6gen157",
  titre: "Étude d'une fonction cyclométrique",
  eyebrow: "6e — Entraînement",
  sousTitre: "Chapitre 1 — Fonctions réciproques & cyclométriques",
  definition: DEFINITION_ETUDE_CYCLO,
  catalogue: CATALOGUE_VARIANTES,
  genererLibre: genererExerciceEtudeCyclo,
  genererVariante: (id) => construireAvecVarianteId(id as VarianteEtudeCyclo),
};

export function App6gen157() {
  return <AppEcransTrigo config={CONFIG} />;
}
