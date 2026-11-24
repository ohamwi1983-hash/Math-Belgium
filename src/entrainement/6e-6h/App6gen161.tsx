import { AppEcransTrigo } from "../5e-4h/components5e/AppEcransTrigo";
import type { ConfigAppEcrans } from "../5e-4h/components5e/AppEcransTrigo";
import type { Exercice161 } from "./core6e/quelJeuChoisir";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExercice161 } from "./generateurs6e/quelJeuChoisir";
import { DEFINITION_161 } from "./ui6e/definition161";
import type { Phase161 } from "./ui6e/format161";

/**
 * `6gen161` — « Quel jeu choisir ? » (6e ch. 6, § 4, processus 3 TRANSFÉRER). Écrans : probabilité
 * de gagner au jeu A, au jeu B (champs, trois tentatives), puis le choix A / B / autant de chances
 * (choix fermé, une tentative). Socle d'écrans partagé (`AppEcransTrigo`, `?code=` = mêmes fonctions
 * que l'adaptateur papier).
 */
const CONFIG: ConfigAppEcrans<Exercice161, Phase161> = {
  id: "6gen161",
  titre: "Quel jeu choisir ?",
  eyebrow: "6e — Entraînement",
  sousTitre: "Chapitre 6 — Les probabilités",
  definition: DEFINITION_161,
  catalogue: CATALOGUE_VARIANTES,
  genererLibre: genererExercice161,
  genererVariante: (id) => construireAvecVariante(id),
};

export function App6gen161() {
  return <AppEcransTrigo config={CONFIG} />;
}
