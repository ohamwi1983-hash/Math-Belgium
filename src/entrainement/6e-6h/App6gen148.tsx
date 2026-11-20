import { AppEcransTrigo } from "../5e-4h/components5e/AppEcransTrigo";
import type { ConfigAppEcrans } from "../5e-4h/components5e/AppEcransTrigo";
import type { ExerciceLireCourbeExpo, VarianteLireCourbeExpo } from "./core6e/lireCourbeExponentielle";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceLireCourbeExpo } from "./generateurs6e/lireCourbeExponentielle";
import { DEFINITION_LIRE_COURBE_EXPO } from "./ui6e/definitionLireCourbeExponentielle";
import type { PhaseLireCourbeExpo } from "./ui6e/formatLireCourbeExponentielle";

/**
 * `6gen148` — « Lire une courbe exponentielle y = k·aˣ + c » (6e ch. 2, § 1 et § 6, processus 2
 * APPLIQUER). Asymptote, k par f(0), a par le rapport des écarts à l'asymptote, expression. Socle
 * d'écrans partagé avec 5gen54–57 (`AppEcransTrigo` : `?code=` avec les mêmes fonctions que
 * l'adaptateur papier, `SelecteurVarianteDev`, illisible sans tentative, aides à deux niveaux).
 */
const CONFIG: ConfigAppEcrans<ExerciceLireCourbeExpo, PhaseLireCourbeExpo> = {
  id: "6gen148",
  titre: "Lire une courbe exponentielle",
  eyebrow: "6e — Entraînement",
  sousTitre: "Chapitre 2 — Fonctions exponentielles",
  definition: DEFINITION_LIRE_COURBE_EXPO,
  catalogue: CATALOGUE_VARIANTES,
  genererLibre: genererExerciceLireCourbeExpo,
  genererVariante: (id) => construireAvecVarianteId(id as VarianteLireCourbeExpo),
  largeurFigure: 420,
};

export function App6gen148() {
  return <AppEcransTrigo config={CONFIG} />;
}
