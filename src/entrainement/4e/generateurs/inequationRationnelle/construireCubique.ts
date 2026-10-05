import type { Symbole } from "../../core/inequation.types";
import type { Exercice } from "../../core/generateur.types";
import type { PolynomeLineaire } from "../../core/simplification.types";
import type { ExerciceInequationRationnelleCubique } from "../../core/inequationRationnelle.types";
import { randomInt, randomNonZeroInt } from "../secondDegre/aleatoire";
import { construireBinomeConjugue } from "../secondDegre/categories/binomeConjugue";
import { construireCasGeneral } from "../secondDegre/categories/casGeneral";
import { classifierSolutionQuotient, extraireSignesZonesQuotient } from "./grilleQuotient";
import { construireGrilleQuotientCubique } from "./construireGrilleQuotientCubique";

const SYMBOLES: Symbole[] = ["<", ">", "≤", "≥"];

/**
 * Seulement 2 des 4 techniques du 2nd degré conviennent pour le facteur quadratique restant :
 * mise_en_evidence est exclue car sa racine 0 est structurellement garantie (c=0 par construction,
 * voir secondDegre/categories/miseEnEvidence.ts), ce qui collisionnerait toujours avec le facteur x
 * déjà mis en évidence dans N(x) = x·(ax²+bx+c) ; produit_remarquable est exclue pour la même
 * raison que partout ailleurs dans le projet (racine double, casserait la contrainte "4 racines
 * distinctes"). binome_conjugue et cas_general garantissent déjà par défaut des racines non nulles
 * (voir leurs commentaires respectifs), donc aucune option supplémentaire n'est nécessaire ici.
 */
const constructeurs: Array<() => Omit<Exercice, "formeAffichage">> = [construireBinomeConjugue, construireCasGeneral];

/**
 * Construit un exercice "cubique" (item b) : N(x)/P1_D(x) ◇ 0, où N(x) = x·(ax²+bx+c) est un
 * polynôme du 3e degré sans terme constant, obtenu par mise en évidence de x. `numerateur` ne
 * porte que le facteur quadratique restant (racines q1, q2) — voir
 * core/inequationRationnelle.types.ts pour la justification de ce choix. P1_D (racine p) est
 * choisi distinct de {0, q1, q2}.
 */
export function construireCubique(): ExerciceInequationRationnelleCubique {
  const quadratique: Exercice = { ...constructeurs[randomInt(0, constructeurs.length - 1)](), formeAffichage: "canonique" };
  const [q1, q2] = quadratique.solution.racines;

  let p = randomInt(-6, 6);
  while (p === 0 || p === q1 || p === q2) p = randomInt(-6, 6);
  const denominateur: PolynomeLineaire = { k: randomNonZeroInt(-3, 3), p };

  const symbole = SYMBOLES[randomInt(0, SYMBOLES.length - 1)];
  const { racines, ce, grille } = construireGrilleQuotientCubique(quadratique, denominateur);
  const zones = extraireSignesZonesQuotient(grille.ligneQuotient);
  const solution = classifierSolutionQuotient(racines, ce, zones, symbole);

  return {
    niveau: "cubique",
    numerateur: quadratique,
    denominateur,
    grille,
    ce,
    symbole,
    racines,
    solution,
  };
}
