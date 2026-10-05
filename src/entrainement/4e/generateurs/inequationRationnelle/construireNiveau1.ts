import type { Symbole } from "../../core/inequation.types";
import type { ExerciceInequationRationnelleNiveau1 } from "../../core/inequationRationnelle.types";
import { randomInt } from "../secondDegre/aleatoire";
import { construireFacteurLineaire } from "../signesProduit/construireFacteurLineaire";
import { classifierSolutionQuotient, construireGrilleQuotient, extraireSignesZonesQuotient } from "./grilleQuotient";

const SYMBOLES: Symbole[] = ["<", ">", "≤", "≥"];

/**
 * Construit un exercice de niveau 1 (section 1 de la spec) : P1_1/P1_2 ◇ 0, racines toujours
 * distinctes — réutilise construireFacteurLineaire (générateur "tableau de signes à plusieurs
 * facteurs") pour chacun des deux polynômes, le second excluant activement la racine déjà tirée
 * par le premier (même principe de construction que le reste du projet, jamais tirage-puis-rejet).
 */
export function construireNiveau1(): ExerciceInequationRationnelleNiveau1 {
  const { facteur: facteurNumerateur, racine: racineNumerateur } = construireFacteurLineaire([]);
  const { facteur: facteurDenominateur } = construireFacteurLineaire([racineNumerateur]);
  const numerateur = facteurNumerateur.polynome;
  const denominateur = facteurDenominateur.polynome;

  const symbole = SYMBOLES[randomInt(0, SYMBOLES.length - 1)];
  const { racines, ce, grille } = construireGrilleQuotient(numerateur, denominateur);
  const zones = extraireSignesZonesQuotient(grille.ligneQuotient);
  const solution = classifierSolutionQuotient(racines, ce, zones, symbole);

  return { niveau: "niveau1", numerateur, denominateur, symbole, ce, racines, grille, solution };
}
