/**
 * Couche B — vérification propre à "Distance point-droite et droite-droite (méthode de synthèse,
 * sans formule)". ⚠️ Réutilise directement les primitives déjà partagées par le groupe "droites" —
 * `pointAppartientImplicite`/`diagnostiquerEquationDroiteLibre`/`combinerStatuts`
 * (`verificationDroite.ts`) — jamais une seconde logique de comparaison réécrite. `diagnostiquerIntersection`/
 * `verifierIntersection`/`ReponseIntersection` (écran "Coordonnées de Q") sont déjà exportées telles
 * quelles par `verificationDroite.ts` (ajoutées lors de la Task 15, anticipant précisément cet
 * écran) — réexportées ici uniquement pour que ce module reste le point d'entrée unique de la
 * Couche B propre à ce générateur, jamais une seconde implémentation.
 */
import type { ExerciceDistanceDroite, ExerciceDistanceParalleles } from "../core/distanceDroite.types";
import type { DroiteImplicite } from "../core/droite.types";
import type { Point } from "../core/vecteur.types";
import { evaluerExpressionGenerale } from "./expressionGenerale";
import type { StatutVerification } from "./statutVerification";
import {
  combinerStatuts,
  diagnostiquerEquationDroiteLibre,
  diagnostiquerIntersection,
  pointAppartientImplicite,
  verifierIntersection,
} from "./verificationDroite";

export type { ReponseIntersection } from "./verificationDroite";
export { diagnostiquerIntersection, verifierIntersection };

// ============================================================================
// Écran 0 (variante "paralleles" uniquement) — choisir un point ENTIER sur la droite DÉSIGNÉE
// (`exercice.droiteSource`), vérifié par APPARTENANCE — n'importe quel point entier valide est
// accepté, jamais une valeur fixe attendue (même principe que "Construction graphique — tracer une
// droite depuis son équation", `verificationConstructionDroite.ts::statutPointConstruction`).
// ============================================================================

export function droiteSourceDeExercice(exercice: ExerciceDistanceParalleles): DroiteImplicite {
  return exercice.droiteSource === "d1" ? exercice.d1 : exercice.d2;
}

export function droiteCibleDeExercice(exercice: ExerciceDistanceParalleles): DroiteImplicite {
  return exercice.droiteSource === "d1" ? exercice.d2 : exercice.d1;
}

export function diagnostiquerChoixPoint(exercice: ExerciceDistanceParalleles, point: Point): StatutVerification {
  if (!Number.isFinite(point.x) || !Number.isFinite(point.y)) return "parse_error";
  if (!Number.isInteger(point.x) || !Number.isInteger(point.y)) return "not_equivalent";
  return pointAppartientImplicite(point, droiteSourceDeExercice(exercice)) ? "correct" : "not_equivalent";
}

export function verifierChoixPoint(exercice: ExerciceDistanceParalleles, point: Point): boolean {
  return diagnostiquerChoixPoint(exercice, point) === "correct";
}

// ============================================================================
// Écran 1 — équation cartésienne (texte libre) de `b`, perpendiculaire à la droite cible passant par
// le point donné (variante "point") ou choisi (variante "paralleles"). Délègue entièrement à
// `diagnostiquerEquationDroiteLibre` (n'importe quelle formulation algébriquement équivalente
// acceptée, mise à l'échelle comprise) — la cible réelle (`bAttendue`) est fournie par la Couche B,
// jamais recalculée ici.
// ============================================================================

export function diagnostiquerEquationB(texte: string, bAttendue: DroiteImplicite): StatutVerification {
  return diagnostiquerEquationDroiteLibre(texte, bAttendue);
}

export function verifierEquationB(texte: string, bAttendue: DroiteImplicite): boolean {
  return diagnostiquerEquationB(texte, bAttendue) === "correct";
}

// ============================================================================
// Écran 3 — distance PQ, un seul champ TEXTE LIBRE : entier, fraction irréductible ou valeur
// irrationnelle sous forme `sqrt(...)`/`√...` — valeur exacte seulement depuis l'audit du
// chapitre 7 (point 33), une décimale approchée est refusée (`promptgen47modifications.md`, point
// 15) — jamais restreint aux seuls chiffres/`-`/`.`/`,`. Parsé symboliquement via
// `evaluerExpressionGenerale` (module frère, déjà réutilisé ailleurs sur le chapitre 6 pour ce
// même besoin, ex. `verificationEquationCercleDeveloppee.ts::diagnostiquerRayon`) — jamais un
// second évaluateur dédié. `√` (caractère unicode que l'évaluateur ne tokenise pas nativement,
// seul `sqrt(...)` l'est) est translittéré en `sqrt(...)` avant évaluation, seule adaptation
// nécessaire ici. Tolérance propre (`TOLERANCE_DISTANCE_EXACTE`), jamais `statutNumerique` (0,01, qui
// accepterait une approximation) ni `diagnostiquerCalculDistance` (`verificationNormeDistance.ts`,
// trop couplée au contrat `ExerciceDistance` de "Norme d'un vecteur et distance entre 2 points").
// ============================================================================

/** `√(...)` ou `√369` (sans parenthèses) → `sqrt(...)`/`sqrt(369)` — seule adaptation nécessaire
 * avant `evaluerExpressionGenerale`, qui ne tokenise que la forme fonction `sqrt(...)`. Les signes
 * moins typographiques (« − », « – », « — ») sont convertis au passage (audit chapitre 7, point 4 :
 * « −10 » était jugé illisible au lieu d'être simplement faux). */
function remplacerRacineUnicode(texte: string): string {
  return texte
    .replace(/[−–—]/g, "-")
    .replace(/√\(/g, "sqrt(")
    .replace(/√\s*(\d+(?:[.,]\d+)?)/g, "sqrt($1)");
}

/** Quasi nulle — valeur EXACTE exigée (audit chapitre 7, point 33, même règle que gen26 « Norme
 * d'un vecteur et distance entre 2 points ») : `2√5` ou `sqrt(20)` tombent à moins de 1e-6 de la
 * distance réelle, une approximation décimale `4,47` jamais. */
const TOLERANCE_DISTANCE_EXACTE = 1e-6;

export function diagnostiquerDistance(exercice: ExerciceDistanceDroite, texte: string): StatutVerification {
  let valeur: number;
  try {
    valeur = evaluerExpressionGenerale(remplacerRacineUnicode(texte), 0);
  } catch {
    return "parse_error";
  }
  if (!Number.isFinite(valeur)) return "parse_error";
  return Math.abs(valeur - exercice.distance) <= TOLERANCE_DISTANCE_EXACTE ? "correct" : "not_equivalent";
}

export function verifierDistance(exercice: ExerciceDistanceDroite, texte: string): boolean {
  return diagnostiquerDistance(exercice, texte) === "correct";
}

export { combinerStatuts };
