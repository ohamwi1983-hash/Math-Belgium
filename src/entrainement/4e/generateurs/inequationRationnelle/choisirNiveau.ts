import type { NiveauInequationRationnelle, ReglagesInequationRationnelle } from "../../core/inequationRationnelle.types";
import { randomInt } from "../secondDegre/aleatoire";

/**
 * Choisit le niveau du prochain exercice (section 4 de la spec) : "fixe" répète toujours le
 * premier niveau actif ; "equilibre" tire uniformément parmi tous les niveaux actifs (même
 * principe que le reste du projet — familles/catégories tirées uniformément, jamais un tirage
 * puis un rejet). Aucun effet observable tant que `niveauxActifs` ne contient que "niveau1", mais
 * déjà prêt pour des niveaux futurs (2 à 4) sans modification de cette fonction.
 */
export function choisirNiveau(reglages: ReglagesInequationRationnelle): NiveauInequationRationnelle {
  if (reglages.repartition === "fixe") return reglages.niveauxActifs[0];
  return reglages.niveauxActifs[randomInt(0, reglages.niveauxActifs.length - 1)];
}
