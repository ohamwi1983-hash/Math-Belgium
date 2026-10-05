import type { Symbole } from "../../core/inequation.types";
import type { ExerciceSimplification } from "../../core/simplification.types";
import type { ExerciceInequationRationnelleFacteurCommun } from "../../core/inequationRationnelle.types";
import { randomInt } from "../secondDegre/aleatoire";
import { tirerRacineCommune } from "../simplification/aleatoire";
import { construireP2Impose } from "../simplification/construireP2Impose";
import { secondeRacine, techniqueASecondeRacineFixe } from "../simplification";
import { classifierSolutionQuotient, extraireSignesZonesQuotient } from "./grilleQuotient";
import { construireGrilleFacteurCommun } from "./construireGrilleFacteurCommun";

const SYMBOLES: Symbole[] = ["<", ">", "≤", "≥"];

/**
 * Construit un exercice de la variante "facteur commun" : réutilise directement la construction
 * P2/P2 "racine commune" de l'exercice "Simplifier" (choisir p, construire D puis N — voir
 * generateurs/simplification/index.ts, dont la logique P2/P2 est reprise ici plutôt que dupliquée),
 * avec UNE différence : `produit_remarquable` est exclu pour N **en plus** de D (jamais seulement D
 * comme dans l'exercice "Simplifier" standalone). Raison propre à cette variante : une racine
 * double au numérateur (N=a(x-p)²) laisserait un facteur résiduel (x-p) dans le numérateur
 * simplifié après une seule simplification — la racine "restante" ne serait alors plus une valeur
 * indépendante q mais p lui-même, cassant l'hypothèse "3 racines distinctes p/q/s" sur laquelle
 * repose toute la construction de la grille (construireGrilleFacteurCommun.ts). Ce problème
 * n'existe pas pour l'exercice "Simplifier" lui-même (aucune notion de grille de signes là-bas), ce
 * qui explique pourquoi cette exclusion n'y est pas nécessaire.
 */
export function construireFacteurCommun(): ExerciceInequationRationnelleFacteurCommun {
  const p = tirerRacineCommune();
  const denominateur = construireP2Impose(p, { exclureProduitRemarquable: true });
  const numerateur = construireP2Impose(p, {
    exclureProduitRemarquable: true,
    exclureTechnique: techniqueASecondeRacineFixe(denominateur.categorie),
    racinesInterdites: [secondeRacine(denominateur, p)],
  });
  const fraction: ExerciceSimplification = { type: "P2/P2", racineCommune: p, denominateur, numerateur };
  const symbole = SYMBOLES[randomInt(0, SYMBOLES.length - 1)];

  const { racines, ce, numerateurSimplifie, denominateurSimplifie, grille } = construireGrilleFacteurCommun(fraction);
  const zones = extraireSignesZonesQuotient(grille.ligneQuotient);
  const solution = classifierSolutionQuotient(racines, ce, zones, symbole);

  return {
    niveau: "facteurCommun",
    fraction,
    numerateurSimplifie,
    denominateurSimplifie,
    symbole,
    ce,
    racines,
    grille,
    solution,
  };
}
