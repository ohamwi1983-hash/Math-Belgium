import { AppEcransTrigo } from "../5e-4h/components5e/AppEcransTrigo";
import type { ConfigAppEcrans } from "../5e-4h/components5e/AppEcransTrigo";
import type { Exercice127, Phase127 } from "./core6e/natureLieu";
import { CATALOGUE_127, construireAvecVariante127, genererExercice127 } from "./generateurs6e/natureLieu";
import { DEFINITION_127 } from "./ui6e/definitionNatureLieu";

/**
 * `6gen127` — « Quelle est la nature du lieu ? » (6e ch. 9, § 4, processus 1 CONNAÎTRE) : nature du
 * lieu (verdict équilibré parmi onze, une tentative), puis ses éléments caractéristiques ; deux puces
 * fixes. Socle d'écrans partagé (`AppEcransTrigo`) ; `?code=` : mêmes fonctions que l'adaptateur.
 */
const CONFIG: ConfigAppEcrans<Exercice127, Phase127> = {
  id: "6gen127",
  titre: "Quelle est la nature du lieu ?",
  eyebrow: "6e — Entraînement",
  sousTitre: "Chapitre 9 — Lieux géométriques",
  definition: DEFINITION_127,
  catalogue: CATALOGUE_127,
  genererLibre: genererExercice127,
  genererVariante: construireAvecVariante127,
  largeurFigure: 320,
  figureToujoursVisible: true,
  nombrePuces: 2,
};

export function App6gen127() {
  return <AppEcransTrigo config={CONFIG} />;
}
