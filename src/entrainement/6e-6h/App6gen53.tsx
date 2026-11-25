import type { ExerciceLoiPoisson } from "./core6e/loiPoisson.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceLoiPoisson } from "./generateurs6e/loiPoisson";
import type { PhaseLoiPoisson } from "./moteur6e/typesLoiPoisson";
import { DEFINITION_6GEN53, attentesLoiPoisson } from "./moteur6e/verificationLoiPoisson";
import { FORMAT_6GEN53 } from "./ui6e/formatLoiPoisson";
import { AppCombinatoire } from "./components6e/AppCombinatoire";
import type { ConfigAppCombinatoire } from "./components6e/AppCombinatoire";

/**
 * `6gen53` — Loi de Poisson (6e ch. 8, § 8, processus 2 APPLIQUER). Socle commun du ch. 7
 * (`AppCombinatoire`, audit du ch. 8, lot B). Famille A : 3 puces tant que le verdict n'est pas jugé
 * (oui : 3 écrans, non : 2 — le nombre réel trahirait le verdict).
 */
const CONFIG: ConfigAppCombinatoire<ExerciceLoiPoisson, PhaseLoiPoisson> = {
  id: "6gen53",
  titre: "Loi de Poisson",
  sousTitre: "Chapitre 8 — Variables aléatoires",
  catalogue: CATALOGUE_VARIANTES,
  genererLibre: genererExerciceLoiPoisson,
  genererVariante: construireAvecVarianteId,
  definition: DEFINITION_6GEN53,
  attentes: attentesLoiPoisson,
  format: FORMAT_6GEN53,
  pucesAvantPremierEcran: (e) => (e.famille === "A" ? 3 : null),
};

export function App6gen53() {
  return <AppCombinatoire config={CONFIG} />;
}
