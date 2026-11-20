import { AppEcransTrigo } from "./components5e/AppEcransTrigo";
import type { ConfigAppEcrans } from "./components5e/AppEcransTrigo";
import type { ExerciceDomaineParImage } from "./core5e/domaineParImage";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceDomaineParImage } from "./generateurs5e/domaineParImage";
import type { IdVarianteDomaineParImage } from "./generateurs5e/domaineParImage";
import { DEFINITION_DOMAINE_PAR_IMAGE } from "./ui5e/definitionDomaineParImage";
import type { PhaseDomaineParImage } from "./ui5e/formatDomaineParImage";

/**
 * `5gen62` — « Domaine d'une composée par l'image » (5e ch. 1, § 3, processus 2 APPLIQUER). Im g,
 * dom f, Im g ∩ dom f, puis dom(f∘g) ; le domaine vide est un cas particulier (≈ 10 %). Socle
 * d'écrans du 5e ch. 2 (`AppEcransTrigo`, écran « intervalles » avec bouton ∅) ; `?code=` : mêmes
 * fonctions que l'adaptateur papier.
 */
const CONFIG: ConfigAppEcrans<ExerciceDomaineParImage, PhaseDomaineParImage> = {
  id: "5gen62",
  titre: "Domaine d'une composée par l'image",
  definition: DEFINITION_DOMAINE_PAR_IMAGE,
  catalogue: CATALOGUE_VARIANTES,
  genererLibre: genererExerciceDomaineParImage,
  genererVariante: (id) => construireAvecVarianteId(id as IdVarianteDomaineParImage),
  sousTitre: "Chapitre 1 — Fonctions : rappels et compléments",
};

export function App5gen62() {
  return <AppEcransTrigo config={CONFIG} />;
}
