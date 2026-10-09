import type { DonneesTriangleInscrit, ExerciceCercles, ExerciceCerclesA, ExerciceCerclesB, ExerciceCerclesC, ExerciceCerclesD, ExerciceCerclesE, ExerciceCerclesF, ExerciceCerclesG, Point } from "../core6e/cercles.types";
import { diagnostiquerEnsembleDeuxPoints, diagnostiquerEquation, diagnostiquerLiteral, diagnostiquerValeurLibre } from "./expressionCercles";
import type { Variables } from "./expressionCercles";
import type { StatutVerification } from "../moteur/statutVerification";
import type { PhaseCercles } from "./typesCercles";

/**
 * Couche B (6e) — vérification propre à `6gen55` (dispatch par famille/écran). N'importe JAMAIS
 * rien de `src/generateurs6e/` (règle non négociable, CLAUDE.md) — tous les types utilisés ici
 * (`Point`/`DroiteAffine`/`DonneesTriangleInscrit`/`ExerciceCerclesX`) viennent de `core6e/
 * cercles.types.ts`, seule source de vérité pour ces contrats (`generateurs6e/cercles/geometrie.ts`
 * les réimporte pour ses propres besoins de Couche A, jamais l'inverse) — voir
 * `generateurs6e/cercles/session.integration.test.ts` pour le seul fichier autorisé à réunir
 * Couche A et Couche B.
 *
 * Toutes les valeurs/paramètres nécessaires sont déjà dans l'exercice (Couche A) — ce fichier
 * calcule la fonction cible "membre gauche − membre droit" de chaque équation ATTENDUE directement
 * depuis ces paramètres (de la simple arithmétique sur les champs du contrat, jamais un appel à une
 * fonction de `generateurs6e/`) et la compare à la saisie élève via `diagnostiquerEquation`
 * (`expressionCercles.ts`, échantillonnage de ratio).
 *
 * Tolérance numérique unique `TOLERANCE_NUM=0.01` pour tout champ purement numérique (coordonnées,
 * longueurs, rayons — annoncée dans les consignes correspondantes, `ui6e/formatCercles.ts`).
 *
 * **Famille G — RÉUTILISE la famille E** : `gEcran2`/`gEcran3`/`gEcran4` appellent EXACTEMENT les
 * mêmes fonctions de diagnostic (`diagnostiquerCotesTriangle`/`diagnostiquerIncentreTriangle`/
 * `diagnostiquerRayonTriangle`, ci-dessous) que `eEcran1`/`eEcran2`/`eEcran3`, appliquées à
 * `exercice.triangle` plutôt qu'à l'exercice E lui-même — jamais un second jeu de fonctions.
 */

const TOLERANCE_NUM = 0.01;

function combinerStatuts(...statuts: StatutVerification[]): StatutVerification {
  if (statuts.some((s) => s === "parse_error")) return "parse_error";
  if (statuts.some((s) => s === "not_equivalent")) return "not_equivalent";
  return "correct";
}

function diagnostiquerValeurs(valeurs: string[], attendues: number[]): StatutVerification {
  return combinerStatuts(...attendues.map((v, i) => diagnostiquerValeurLibre(valeurs[i] ?? "", v, TOLERANCE_NUM)));
}

// ============================================================================
// Points d'échantillonnage fixes pour l'équivalence d'équation (voir `expressionCercles.ts`).
// ============================================================================

const POINTS_XY: Variables[] = [
  { x: 0, y: 0 },
  { x: 1, y: 0 },
  { x: 0, y: 1 },
  { x: 2, y: 3 },
  { x: -1, y: 2 },
  { x: 3, y: -2 },
];

const POINTS_X: Variables[] = [{ x: 0 }, { x: 1 }, { x: 2 }, { x: -1 }, { x: 3 }, { x: -2 }];

const POINTS_R: Variables[] = [{ r: 0 }, { r: 1 }, { r: 2 }, { r: -1 }, { r: 3 }, { r: -2 }];

const POINTS_DEF: Variables[] = [
  { D: 1, E: 0, F: 0 },
  { D: 0, E: 1, F: 0 },
  { D: 0, E: 0, F: 1 },
  { D: 1, E: 1, F: 1 },
  { D: 2, E: -1, F: 3 },
  { D: -1, E: 2, F: -2 },
];

// ============================================================================
// Famille A — Cercle par 3 points.
// ============================================================================

function cibleEquationPoint(P: Point): (v: Variables) => number {
  return (v) => P.x * v.D + P.y * v.E + v.F + (P.x * P.x + P.y * P.y);
}

export function diagnostiquerAEcran(e: ExerciceCerclesA, phase: PhaseCercles, valeurs: string[]): StatutVerification {
  if (phase === "aEcran1") {
    return combinerStatuts(
      diagnostiquerEquation(valeurs[0] ?? "", ["D", "E", "F"], cibleEquationPoint(e.A), POINTS_DEF),
      diagnostiquerEquation(valeurs[1] ?? "", ["D", "E", "F"], cibleEquationPoint(e.B), POINTS_DEF),
      diagnostiquerEquation(valeurs[2] ?? "", ["D", "E", "F"], cibleEquationPoint(e.C), POINTS_DEF),
    );
  }
  if (phase === "aEcran2") return diagnostiquerValeurs(valeurs, [e.D, e.E, e.F]);
  return diagnostiquerValeurs(valeurs, [e.centreX, e.centreY, e.rayon]);
}

// ============================================================================
// Familles B et C — médiatrice partagée (PAS le fichier de hints — voir `ui6e/formatCercles.ts`,
// piège transversal explicitement documenté par la mission : ne jamais faire référence à l'autre
// famille/méthode dans les aides).
// ============================================================================

function cibleMediatrice(A: Point, B: Point): (v: Variables) => number {
  // médiatrice : équidistance à A et B  ⇔  distance²(P,A) = distance²(P,B), forme qui ne dépend
  // JAMAIS d'une pente déjà calculée (contrairement à `m·x−y+p`) — vérifie directement la propriété
  // géométrique définissant la médiatrice, insensible à un plan de calcul différent du sien.
  return (v) => (v.x - A.x) ** 2 + (v.y - A.y) ** 2 - ((v.x - B.x) ** 2 + (v.y - B.y) ** 2);
}

function diagnostiquerMediatrice(A: Point, B: Point, texte: string): StatutVerification {
  return diagnostiquerEquation(texte, ["x", "y"], cibleMediatrice(A, B), POINTS_XY);
}

// ============================================================================
// Famille B — Cercle par 2 points, rayon donné.
// ============================================================================

/** Marqueur séparant, dans le tableau plat `valeurs: string[]`, la liste add-as-needed des centres
 * (famille B écran 3) du champ "rayon" qui la suit — mirroir `SEPARATEUR_LISTES_D`
 * (`verificationDenombrementCombinatoirePur.ts`, 6gen46), même convention de tableau plat imposée
 * par le moteur de session générique. */
export const SEPARATEUR_CENTRES_B = "\0CENTRES_B\0";

function cibleQuadratiqueCentreSurMediatrice(e: ExerciceCerclesB): (v: Variables) => number {
  const { m, p } = e.mediatrice;
  return (v) => (v.x - e.A.x) ** 2 + (m * v.x + p - e.A.y) ** 2 - e.r * e.r;
}

export function diagnostiquerBEcran(e: ExerciceCerclesB, phase: PhaseCercles, valeurs: string[]): StatutVerification {
  if (phase === "bEcran1") return diagnostiquerMediatrice(e.A, e.B, valeurs[0] ?? "");
  if (phase === "bEcran2") return diagnostiquerEquation(valeurs[0] ?? "", ["x"], cibleQuadratiqueCentreSurMediatrice(e), POINTS_X);
  // bEcran3
  const idx = valeurs.indexOf(SEPARATEUR_CENTRES_B);
  if (idx === -1) return "parse_error";
  const centresTextes = valeurs.slice(0, idx);
  const rayonTexte = valeurs[idx + 1] ?? "";
  const statutCentres = diagnostiquerEnsembleDeuxPoints(centresTextes, [e.centre1, e.centre2], TOLERANCE_NUM);
  const statutRayon = diagnostiquerValeurLibre(rayonTexte, e.r, TOLERANCE_NUM);
  return combinerStatuts(statutCentres, statutRayon);
}

// ============================================================================
// Famille C — Cercle par 2 points, centre sur une droite donnée.
// ============================================================================

export function diagnostiquerCEcran(e: ExerciceCerclesC, phase: PhaseCercles, valeurs: string[]): StatutVerification {
  if (phase === "cEcran1") return diagnostiquerMediatrice(e.A, e.B, valeurs[0] ?? "");
  if (phase === "cEcran2") return diagnostiquerValeurs(valeurs, [e.centre.x, e.centre.y]);
  return diagnostiquerValeurs(valeurs, [e.rayon]);
}

// ============================================================================
// Famille D — Cercle tangent à un axe en un point donné.
// ============================================================================

function cibleEquationEnR(e: ExerciceCerclesD): (v: Variables) => number {
  return (v) => (e.Bx - e.A.x) ** 2 + (v.r - e.A.y) ** 2 - v.r * v.r;
}

export function diagnostiquerDEcran(e: ExerciceCerclesD, phase: PhaseCercles, valeurs: string[]): StatutVerification {
  if (phase === "dEcran1") {
    return combinerStatuts(diagnostiquerValeurLibre(valeurs[0] ?? "", e.Bx, TOLERANCE_NUM), diagnostiquerLiteral(valeurs[1] ?? "", "r"));
  }
  if (phase === "dEcran2") return diagnostiquerEquation(valeurs[0] ?? "", ["r"], cibleEquationEnR(e), POINTS_R);
  // dEcran3 : r, centreX(=Bx), centreY(=r), équation du cercle (x-Bx)²+(y-r)²=r²
  const cibleEquationCercle: (v: Variables) => number = (v) => (v.x - e.Bx) ** 2 + (v.y - e.r) ** 2 - e.r * e.r;
  return combinerStatuts(diagnostiquerValeurs(valeurs.slice(0, 3), [e.r, e.Bx, e.r]), diagnostiquerEquation(valeurs[3] ?? "", ["x", "y"], cibleEquationCercle, POINTS_XY));
}

// ============================================================================
// Famille E — Cercle inscrit à un triangle. Fonctions RÉUTILISÉES telles quelles par la famille G.
// ============================================================================

export function diagnostiquerCotesTriangle(t: DonneesTriangleInscrit, valeurs: string[]): StatutVerification {
  return diagnostiquerValeurs(valeurs, [t.a, t.b, t.c]);
}
export function diagnostiquerIncentreTriangle(t: DonneesTriangleInscrit, valeurs: string[]): StatutVerification {
  return diagnostiquerValeurs(valeurs, [t.incentreX, t.incentreY]);
}
export function diagnostiquerRayonTriangle(t: DonneesTriangleInscrit, valeurs: string[]): StatutVerification {
  return diagnostiquerValeurs(valeurs, [t.rayon]);
}

export function diagnostiquerEEcran(e: ExerciceCerclesE, phase: PhaseCercles, valeurs: string[]): StatutVerification {
  if (phase === "eEcran1") return diagnostiquerCotesTriangle(e, valeurs);
  if (phase === "eEcran2") return diagnostiquerIncentreTriangle(e, valeurs);
  return diagnostiquerRayonTriangle(e, valeurs);
}

// ============================================================================
// Famille F — Cercle avec corde de longueur donnée.
// ============================================================================

export function diagnostiquerFEcran(e: ExerciceCerclesF, phase: PhaseCercles, valeurs: string[]): StatutVerification {
  if (phase === "fEcran1") return diagnostiquerValeurs(valeurs, [e.distanceCentreDroite]);
  if (phase === "fEcran2") return diagnostiquerValeurs(valeurs, [e.rCarre, e.rayon]);
  const cibleEquationCercle: (v: Variables) => number = (v) => (v.x - e.centre.x) ** 2 + (v.y - e.centre.y) ** 2 - e.rCarre;
  return combinerStatuts(diagnostiquerValeurs([valeurs[0] ?? ""], [e.rayon]), diagnostiquerEquation(valeurs[1] ?? "", ["x", "y"], cibleEquationCercle, POINTS_XY));
}

// ============================================================================
// Famille G — Cercles tangents à 3 droites. RÉUTILISE les diagnostics de la famille E (écrans 2-4)
// sur `exercice.triangle`, jamais un second calcul.
// ============================================================================

export function diagnostiquerGEcran(e: ExerciceCerclesG, phase: PhaseCercles, valeurs: string[]): StatutVerification {
  if (phase === "gEcran1") {
    return diagnostiquerValeurs(valeurs, [e.sommet12.x, e.sommet12.y, e.sommet23.x, e.sommet23.y, e.sommet31.x, e.sommet31.y]);
  }
  if (phase === "gEcran2") return diagnostiquerCotesTriangle(e.triangle, valeurs);
  if (phase === "gEcran3") return diagnostiquerIncentreTriangle(e.triangle, valeurs);
  return diagnostiquerRayonTriangle(e.triangle, valeurs);
}

// ============================================================================
// Dispatcher générique.
// ============================================================================

export function diagnostiquerEcran(exercice: ExerciceCercles, phase: PhaseCercles, valeurs: string[]): StatutVerification {
  switch (exercice.famille) {
    case "A":
      return diagnostiquerAEcran(exercice, phase, valeurs);
    case "B":
      return diagnostiquerBEcran(exercice, phase, valeurs);
    case "C":
      return diagnostiquerCEcran(exercice, phase, valeurs);
    case "D":
      return diagnostiquerDEcran(exercice, phase, valeurs);
    case "E":
      return diagnostiquerEEcran(exercice, phase, valeurs);
    case "F":
      return diagnostiquerFEcran(exercice, phase, valeurs);
    case "G":
      return diagnostiquerGEcran(exercice, phase, valeurs);
  }
}

export function verifierEcran(exercice: ExerciceCercles, phase: PhaseCercles, valeurs: string[]): boolean {
  return diagnostiquerEcran(exercice, phase, valeurs) === "correct";
}
