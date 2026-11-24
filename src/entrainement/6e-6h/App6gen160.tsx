import { AppEcransTrigo } from "../5e-4h/components5e/AppEcransTrigo";
import type { ConfigAppEcrans } from "../5e-4h/components5e/AppEcransTrigo";
import type { Exercice160 } from "./core6e/independantsIncompatibles";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExercice160 } from "./generateurs6e/independantsIncompatibles";
import { DEFINITION_160 } from "./ui6e/definition160";
import type { Phase160 } from "./ui6e/format160";

/**
 * `6gen160` — « Indépendants ou incompatibles ? » (6e ch. 6, § 3, processus 2 APPLIQUER). Écrans :
 * P(A) et P(B), P(A ∩ B), P(A) × P(B) (champs, trois tentatives), puis le verdict à trois issues
 * (choix fermé, une tentative). Socle d'écrans partagé (`AppEcransTrigo`, `?code=` = mêmes fonctions
 * que l'adaptateur papier).
 */
const CONFIG: ConfigAppEcrans<Exercice160, Phase160> = {
  id: "6gen160",
  titre: "Indépendants ou incompatibles ?",
  eyebrow: "6e — Entraînement",
  sousTitre: "Chapitre 6 — Les probabilités",
  definition: DEFINITION_160,
  catalogue: CATALOGUE_VARIANTES,
  genererLibre: genererExercice160,
  genererVariante: (id) => construireAvecVariante(id),
  largeurFigure: 330,
};

export function App6gen160() {
  return <AppEcransTrigo config={CONFIG} />;
}
