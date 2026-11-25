import { AppEcransTrigo } from "../5e-4h/components5e/AppEcransTrigo";
import type { ConfigAppEcrans } from "../5e-4h/components5e/AppEcransTrigo";
import type { Exercice111, Phase111 } from "./core6e/transformationAffineVA";
import { CATALOGUE_111, construireAvecVariante111, genererExercice111 } from "./generateurs6e/transformationAffineVA";
import { DEFINITION_111 } from "./ui6e/definitionTransformationAffineVA";

/**
 * `6gen111` — « Y = aX + b » (6e ch. 8, § 1, processus 2 APPLIQUER) : traduire la situation, puis
 * E(Y), V(Y) et σ(Y) sans reconstruire la loi. Socle d'écrans partagé (`AppEcransTrigo`) ; `?code=` :
 * mêmes fonctions que l'adaptateur.
 */
const CONFIG: ConfigAppEcrans<Exercice111, Phase111> = {
  id: "6gen111",
  titre: "Transformation affine Y = aX + b",
  eyebrow: "6e — Entraînement",
  sousTitre: "Chapitre 8 — Variables aléatoires",
  definition: DEFINITION_111,
  catalogue: CATALOGUE_111,
  genererLibre: genererExercice111,
  genererVariante: construireAvecVariante111,
};

export function App6gen111() {
  return <AppEcransTrigo config={CONFIG} />;
}
