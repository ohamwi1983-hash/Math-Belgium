import { AppEcransTrigo } from "../5e-4h/components5e/AppEcransTrigo";
import type { ConfigAppEcrans } from "../5e-4h/components5e/AppEcransTrigo";
import type { Exercice125, Phase125 } from "./core6e/reconnaitreRemarquables";
import { CATALOGUE_125, construireAvecVariante125, genererExercice125 } from "./generateurs6e/reconnaitreRemarquables";
import { DEFINITION_125 } from "./ui6e/definitionReconnaitreRemarquables";

/**
 * `6gen125` — « Reconnaître droites, points et cercles remarquables » (6e ch. 9, § 1–§ 2, processus 1
 * CONNAÎTRE) : sur une figure codée, nommer la droite, le point ou le cercle (verdict équilibré), puis
 * sa propriété — deux choix fermés à une tentative. Socle d'écrans partagé (`AppEcransTrigo`) ;
 * `?code=` : mêmes fonctions que l'adaptateur.
 */
const CONFIG: ConfigAppEcrans<Exercice125, Phase125> = {
  id: "6gen125",
  titre: "Reconnaître droites, points et cercles remarquables",
  eyebrow: "6e — Entraînement",
  sousTitre: "Chapitre 9 — Lieux géométriques",
  definition: DEFINITION_125,
  catalogue: CATALOGUE_125,
  genererLibre: genererExercice125,
  genererVariante: construireAvecVariante125,
  largeurFigure: 340,
  figureToujoursVisible: true,
};

export function App6gen125() {
  return <AppEcransTrigo config={CONFIG} />;
}
