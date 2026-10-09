import type { ExerciceConiqueA, ExerciceConiqueA1, ExerciceConiqueA2 } from "../../core6e/identificationConiques.types";
import { categorieProbable, classifierConiqueCentree, classifierUnSeulCarre, elementsConiqueCentree, elementsParabole, tirerTripletCanonique } from "./classification";
import type { CategorieConiqueCentree } from "./classification";
import { tirerEntier, tirerParmi } from "./aleatoire";

/**
 * Couche A (6e) — génération, famille A de `6gen58` : coniques CENTRÉES SANS terme linéaire croisé,
 * 2 sous-types équiprobables.
 *
 * - Sous-type 1 (`centree2Carres`, `Ax²+By²+C=0`) : 8 constructeurs DÉDIÉS, un par catégorie
 *   atteignable (`CATEGORIES_A1` ci-dessous), tirage équiprobable entre eux — mirroir du patron
 *   `CONSTRUCTEURS_A`/`ENSEMBLES_DERNIER_CHIFFRE` de `denombrementFondamental/familleA.ts` (6gen43) :
 *   un constructeur dédié par catégorie garantit la couverture exigée par la mission ("combinaisons
 *   de signes couvrant toutes les catégories possibles"), plutôt qu'un tirage de signes au hasard
 *   qui laisserait la couverture au hasard des essais.
 * - Sous-type 2 (`unCarreUnLineaire`, `Av²+Dv=0` dégénéré OU parabole) : 5 constructeurs dédiés
 *   (2 droites parallèles + les 4 orientations de parabole), même principe.
 */

const CATEGORIES_A1: CategorieConiqueCentree[] = ["ellipseHorizontal", "ellipseVertical", "cercle", "vide", "point", "hyperboleHorizontal", "hyperboleVertical", "droitesSecantes"];

export function construireA1(categorie: CategorieConiqueCentree = tirerParmi(CATEGORIES_A1)): ExerciceConiqueA1 {
  const { coeffX: A, coeffY: B, M } = tirerTripletCanonique(categorie);
  // `M===0 ? 0 : -M` plutôt que `-M` directement — évite un `-0` JavaScript (affichage "-0"
  // dans l'équation, piège de signe non simplifié déjà rencontré ailleurs sur la plateforme).
  const C = M === 0 ? 0 : -M;
  const nature = classifierConiqueCentree(A, B, M);
  const elements = nature.type === "cercle" || nature.type === "ellipse" || nature.type === "hyperbole" ? elementsConiqueCentree(A, B, M, nature) : {};
  return { famille: "A", sousType: "centree2Carres", A, B, C, categorieProbable: categorieProbable(A, B), nature, elements };
}

/** 2 droites parallèles : `Av²+Dv=0` (terme linéaire sur la MÊME variable que le carré) —
 * `k=-D/A≠0` (racine 2 systématiquement DISTINCTE de la racine 1=0, jamais une racine double). */
export function construireDroitesParalleles(): ExerciceConiqueA2 {
  const variableCarre = tirerParmi(["x", "y"] as const);
  const coeffCarre = tirerEntier(1, 4);
  const k = tirerParmi([-6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6] as const);
  const coeffLineaire = coeffCarre * k;
  const nature = classifierUnSeulCarre(coeffCarre, variableCarre, coeffLineaire, true);
  return { famille: "A", sousType: "unCarreUnLineaire", coeffCarre, variableCarre, coeffLineaire, memeVariable: true, autreRacine: -coeffLineaire / coeffCarre, nature };
}

/** Parabole `v²=4p·w` (terme linéaire sur l'AUTRE variable) — `orientation` fixe le signe de `p` ET
 * la variable au carré (haut/bas ⟹ carré en x ; droite/gauche ⟹ carré en y). */
export function construireParabole(orientation: "droite" | "gauche" | "haut" | "bas"): ExerciceConiqueA2 {
  const p = tirerEntier(1, 5);
  const coeffCarre = tirerEntier(1, 3);
  const variableCarre = orientation === "haut" || orientation === "bas" ? "x" : "y";
  const pSigne = orientation === "haut" || orientation === "droite" ? p : -p;
  const coeffLineaire = -4 * pSigne * coeffCarre;
  const nature = classifierUnSeulCarre(coeffCarre, variableCarre, coeffLineaire, false);
  const { foyer, directrice } = elementsParabole(orientation, p);
  return { famille: "A", sousType: "unCarreUnLineaire", coeffCarre, variableCarre, coeffLineaire, memeVariable: false, quatrePSigne: 4 * pSigne, p, foyer, directrice, nature };
}

const CONSTRUCTEURS_A2: (() => ExerciceConiqueA2)[] = [construireDroitesParalleles, () => construireParabole("droite"), () => construireParabole("gauche"), () => construireParabole("haut"), () => construireParabole("bas")];

export function construireA2(): ExerciceConiqueA2 {
  return tirerParmi(CONSTRUCTEURS_A2)();
}

export function construireFamilleA(): ExerciceConiqueA {
  return tirerParmi([construireA1, construireA2] as (() => ExerciceConiqueA)[])();
}
