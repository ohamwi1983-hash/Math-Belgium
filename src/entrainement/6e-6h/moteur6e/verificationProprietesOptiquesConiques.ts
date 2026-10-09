import type { ExerciceProprietesOptiquesConiques } from "../core6e/proprietesOptiquesConiques.types";
import { evaluerValeurExponentielle } from "./expressionExponentielle";
import { diagnostiquerEquivalenceQuadratiqueXY } from "./expressionQuadratiqueXY";
import type { StatutVerification } from "../moteur/statutVerification";
import type { PhaseProprietesOptiquesConiques } from "./typesProprietesOptiquesConiques";

/**
 * Couche B (6e) — vérification propre à `6gen63` (dispatch par écran, une seule famille). N'importe
 * JAMAIS `src/generateurs6e/` (règle non négociable, CLAUDE.md) — voir `generateurs6e/
 * proprietesOptiquesConiques/session.integration.test.ts` pour le seul fichier autorisé Couche A +
 * Couche B ensemble.
 *
 * RÉUTILISE `expressionQuadratiqueXY.ts` (`diagnostiquerEquivalenceQuadratiqueXY`, conçu pour être
 * réutilisé TEL QUEL par `6gen59`-`6gen63`, voir son en-tête) pour toute équation de droite, et
 * `expressionExponentielle.ts` (`evaluerValeurExponentielle`, accepte nativement une fraction "a/b")
 * pour tout champ numérique/point libre — aucun nouvel évaluateur écrit ici.
 */

interface PointNombre {
  x: number;
  y: number;
}

function combinerStatuts(...statuts: StatutVerification[]): StatutVerification {
  if (statuts.some((s) => s === "parse_error")) return "parse_error";
  if (statuts.some((s) => s === "not_equivalent")) return "not_equivalent";
  return "correct";
}

const TOLERANCE_POINT = 0.01;

/** Parse un point libre au format "(x;y)", "(x,y)" ou "x;y" — mirroir `parserPointLibre`
 * (`verificationIntersectionsConiques.ts`, 6gen61), copie propre à ce générateur (CLAUDE.md, chaque
 * générateur garde ses propres fichiers). */
function parserPointLibre(texte: string): PointNombre | null {
  const nettoye = texte.trim().replace(/^\(/, "").replace(/\)$/, "");
  const parties = nettoye.split(";").length === 2 ? nettoye.split(";") : nettoye.split(",");
  if (parties.length !== 2) return null;
  const x = evaluerValeurExponentielle(parties[0] ?? "");
  const y = evaluerValeurExponentielle(parties[1] ?? "");
  if (x === null || y === null) return null;
  return { x, y };
}

function diagnostiquerPointOrdonne(texte: string, cible: PointNombre): StatutVerification {
  const p = parserPointLibre(texte);
  if (p === null) return "parse_error";
  return Math.abs(p.x - cible.x) <= TOLERANCE_POINT && Math.abs(p.y - cible.y) <= TOLERANCE_POINT ? "correct" : "not_equivalent";
}

/** Compare 2 points saisis (`textes`, ORDRE quelconque) aux 2 points `cibles` — les 2 appariements
 * possibles sont essayés (n=2, jamais besoin d'un algorithme de couplage général), mirroir
 * `diagnostiquerPaireNonOrdonnee` (`verificationTangentesConique.ts`, 6gen62) généralisé aux points. */
function diagnostiquerPaireDePointsNonOrdonnee(textes: [string, string], cibles: [PointNombre, PointNombre]): StatutVerification {
  const direct = combinerStatuts(diagnostiquerPointOrdonne(textes[0], cibles[0]), diagnostiquerPointOrdonne(textes[1], cibles[1]));
  if (direct === "correct") return "correct";
  const croise = combinerStatuts(diagnostiquerPointOrdonne(textes[0], cibles[1]), diagnostiquerPointOrdonne(textes[1], cibles[0]));
  if (croise === "correct") return "correct";
  if (direct === "parse_error" && croise === "parse_error") return "parse_error";
  return "not_equivalent";
}

function diagnostiquerEquation(texte: string, cible: (x: number, y: number) => number): StatutVerification {
  return diagnostiquerEquivalenceQuadratiqueXY(texte, 0, 0, cible);
}

function diagnostiquerChoix(valeur: string | undefined, attendu: string): StatutVerification {
  return valeur === attendu ? "correct" : "not_equivalent";
}

// ============================================================================
// Écran 1 — les 2 foyers.
// ============================================================================

function diagnostiquerEcran1(e: ExerciceProprietesOptiquesConiques, valeurs: string[]): StatutVerification {
  // F et F' ont des rôles DISTINCTS et donnés (F = abscisse négative, par définition dans l'énoncé)
  // — ordre FIXE, jamais une comparaison non ordonnée (contrairement aux écrans 2/3 où les 2 racines
  // d'une résolution n'ont aucun ordre "objectif").
  return combinerStatuts(diagnostiquerPointOrdonne(valeurs[0] ?? "", e.foyerF), diagnostiquerPointOrdonne(valeurs[1] ?? "", e.foyerFPrime));
}

// ============================================================================
// Écran 2 — équation du rayon incident + les 2 points d'intersection (non ordonnés).
// ============================================================================

function cibleDroite(m: number, c: number): (x: number, y: number) => number {
  return (x, y) => y - (m * x + c);
}

function diagnostiquerEcran2(e: ExerciceProprietesOptiquesConiques, valeurs: string[]): StatutVerification {
  const m = e.droiteIncidente.m.n / e.droiteIncidente.m.d;
  const c = e.droiteIncidente.c.n / e.droiteIncidente.c.d;
  const statutDroite = diagnostiquerEquation(valeurs[0] ?? "", cibleDroite(m, c));
  const cibles: [PointNombre, PointNombre] = [
    { x: e.pointsIntersection[0].x.n / e.pointsIntersection[0].x.d, y: e.pointsIntersection[0].y.n / e.pointsIntersection[0].y.d },
    { x: e.pointsIntersection[1].x.n / e.pointsIntersection[1].x.d, y: e.pointsIntersection[1].y.n / e.pointsIntersection[1].y.d },
  ];
  const statutPoints = diagnostiquerPaireDePointsNonOrdonnee([valeurs[1] ?? "", valeurs[2] ?? ""], cibles);
  return combinerStatuts(statutDroite, statutPoints);
}

// ============================================================================
// Écran 3 — quel point d'intersection est le point de réflexion réel (choix).
// ============================================================================

function diagnostiquerEcran3(e: ExerciceProprietesOptiquesConiques, valeurs: string[]): StatutVerification {
  return diagnostiquerChoix(valeurs[0], `point${e.indexReflexion}`);
}

// ============================================================================
// Écran 4 — équation du rayon réfléchi (propriété focale).
// ============================================================================

function diagnostiquerEcran4(e: ExerciceProprietesOptiquesConiques, valeurs: string[]): StatutVerification {
  const m = e.droiteReflechie.m.n / e.droiteReflechie.m.d;
  const c = e.droiteReflechie.c.n / e.droiteReflechie.c.d;
  return diagnostiquerEquation(valeurs[0] ?? "", cibleDroite(m, c));
}

// ============================================================================
// Dispatcher générique.
// ============================================================================

export function diagnostiquerEcran(exercice: ExerciceProprietesOptiquesConiques, phase: PhaseProprietesOptiquesConiques, valeurs: string[]): StatutVerification {
  if (phase === "ecran1") return diagnostiquerEcran1(exercice, valeurs);
  if (phase === "ecran2") return diagnostiquerEcran2(exercice, valeurs);
  if (phase === "ecran3") return diagnostiquerEcran3(exercice, valeurs);
  return diagnostiquerEcran4(exercice, valeurs);
}

export function verifierEcran(exercice: ExerciceProprietesOptiquesConiques, phase: PhaseProprietesOptiquesConiques, valeurs: string[]): boolean {
  return diagnostiquerEcran(exercice, phase, valeurs) === "correct";
}
