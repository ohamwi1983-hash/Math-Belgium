/**
 * Couche B (5e) — vérification pour 5gen12 ("Problèmes de géométrie du cercle"). N'importe jamais
 * rien de `src/generateurs5e/`.
 *
 * Deux tolérances, appliquées UNIFORMÉMENT sur les 3 scénarios survivants selon la convention
 * d'arrondi demandée à l'écran (la tolérance "serrée" ±0,01 héritée de 5gen6, utilisée par les
 * scénarios A2/A4 supprimés, n'a plus de consommateur sur ce générateur — voir
 * historique-5e-trigonometrie.md) :
 * - **"1re décimale"** (±0,05, absolue) — tout angle θ EN RADIANS ciblé/vérifié directement à
 *   l'écran (`conversionRad` de `secteurBalaye`, `angleTheta` de `segmentCirculaire`, `angle1`/
 *   `angle2` de `lentille`) : consigne "arrondis au dixième de radian près" (C.2/C.3/C.4,
 *   `ui5e/formatGeometrieCercle.ts`) → tolérance = l'écart maximal introduit par cet arrondi
 *   (±0,05), même principe que "convention arrondie" ci-dessous mais pour un pas d'arrondi de 0,1
 *   plutôt que 1.
 * - **"convention arrondie"** (±0,5, absolue) — toute AIRE (secteur/triangle/segment/lentille/aire
 *   balayée) : consigne "arrondis à l'unité près" (`ui5e/formatGeometrieCercle.ts`) → ces valeurs
 *   compounent l'imprécision de calculs intermédiaires, jamais un résultat "propre" — RÉPLIQUÉE
 *   localement (jamais importée depuis
 *   `moteur/verificationApplicationPhysique.ts`/`moteur5e/verificationProblemesContexte.ts`), même
 *   principe déjà établi sur la plateforme ("répliquer ce patron... plutôt que d'inventer une
 *   troisième convention", voir CLAUDE.md section gen29).
 */
import type { ExerciceGeometrieCercle } from "../core5e/geometrieCercle.types";
import { evaluerExpressionGenerale } from "../moteur/expressionGenerale";
import type { StatutVerification } from "../moteur/statutVerification";
import type { PhaseGeometrieCercle } from "./typesGeometrieCercle";

export const TOLERANCE_ARRONDIE = 0.5;
export const TOLERANCE_DIXIEME = 0.05;


function diagnostiquerAvecTolerance(texte: string, cible: number, tolerance: number): StatutVerification {
  try {
    const valeur = evaluerExpressionGenerale(texte, 0);
    if (!Number.isFinite(valeur)) return "parse_error";
    return Math.abs(valeur - cible) <= tolerance ? "correct" : "not_equivalent";
  } catch {
    return "parse_error";
  }
}

export function diagnostiquerCalculArrondi(texte: string, cible: number): StatutVerification {
  return diagnostiquerAvecTolerance(texte, cible, TOLERANCE_ARRONDIE);
}

/** "1re décimale" — voir la table de tolérances en tête de fichier. Consommée par les 3 écrans
 * d'angle θ EN RADIANS (`conversionRad`/`angleTheta`/`angle1`/`angle2`). */
export function diagnostiquerCalculDixieme(texte: string, cible: number): StatutVerification {
  return diagnostiquerAvecTolerance(texte, cible, TOLERANCE_DIXIEME);
}

// ============================================================================
// Cibles RECALCULÉES depuis les valeurs de θ que l'élève peut réellement utiliser (audit 5e ch. 2,
// point 42). La consigne fait arrondir θ au dixième de radian puis chaque aire à l'unité : un élève
// qui réutilise SON θ arrondi et SES aires arrondies était refusé dans 61 à 85 % des cas avec la
// seule cible exacte ±0,5. On accepte donc toute réponse à ±0,5 (arrondi à l'unité) de l'aire
// calculée avec θ exact, θ au dixième (demandé), au centième ou à 4 décimales (affiché dans « Ce
// qu'on sait déjà ») ; pour une différence (segment, aire balayée) ou la lentille, on accepte aussi
// EXACTEMENT la combinaison des aires déjà arrondies à l'unité. Une bande de tolérance continue acceptait au contraire des
// erreurs de méthode (triangle = r·c/2 dans 26 % des tirages) — vérifié par simulation.
// ============================================================================

const MARGE = 1e-6;

function candidatsTheta(theta: number): number[] {
  return [theta, ...[1, 2, 4].map((d) => Math.round(theta * 10 ** d) / 10 ** d)];
}

function valeurSaisie(texte: string): number | "parse_error" {
  try {
    const v = evaluerExpressionGenerale(texte, 0);
    return Number.isFinite(v) ? v : "parse_error";
  } catch {
    return "parse_error";
  }
}

/** Correct ssi la saisie est à `tolerance` d'au moins une cible candidate. */
function diagnostiquerCandidats(texte: string, cibles: number[], tolerance: number): StatutVerification {
  const v = valeurSaisie(texte);
  if (v === "parse_error") return v;
  return cibles.some((c) => Math.abs(v - c) <= tolerance + MARGE) ? "correct" : "not_equivalent";
}

/** Différence de deux aires (segment = secteur − triangle, aire balayée = A₁ − A₂) : soit la
 * différence calculée puis arrondie (±0,5), soit EXACTEMENT la différence des deux aires déjà
 * arrondies à l'unité. */
function ciblesDifference(thetas: number[], a: (t: number) => number, b: (t: number) => number): { arrondies: number[]; entieres: number[] } {
  return { arrondies: thetas.map((t) => a(t) - b(t)), entieres: thetas.map((t) => Math.round(a(t)) - Math.round(b(t))) };
}

function diagnostiquerDifference(texte: string, cibles: { arrondies: number[]; entieres: number[] }): StatutVerification {
  const statut = diagnostiquerCandidats(texte, cibles.arrondies, TOLERANCE_ARRONDIE);
  if (statut !== "not_equivalent") return statut;
  return diagnostiquerCandidats(texte, cibles.entieres, 0);
}

const secteur = (r: number, t: number) => 0.5 * r * r * t;
const triangle = (r: number, t: number) => 0.5 * r * r * Math.sin(t);
const segment = (r: number, t: number) => secteur(r, t) - triangle(r, t);

function diagnostiquerAngle(texte: string, cible: number): StatutVerification {
  return diagnostiquerCandidats(texte, [cible], TOLERANCE_DIXIEME);
}

/** Dispatch, par scénario PUIS par phase, sur les cibles candidates — `exercice` est
 * TypeScript-narrowed à l'intérieur de chaque branche `switch(exercice.scenario)`. Lève si `phase`
 * n'appartient pas à la séquence du scénario donné (garde défensive, jamais atteinte). */
export function diagnostiquerChamp(exercice: ExerciceGeometrieCercle, phase: PhaseGeometrieCercle, texte: string): StatutVerification {
  switch (exercice.scenario) {
    case "secteurBalaye": {
      const thetas = candidatsTheta(exercice.thetaRad);
      const { r1, r2 } = exercice;
      switch (phase) {
        case "conversionRad":
          return diagnostiquerAngle(texte, exercice.thetaRad);
        case "aireGrandSecteur":
          return diagnostiquerCandidats(texte, thetas.map((t) => secteur(r1, t)), TOLERANCE_ARRONDIE);
        case "airePetitSecteur":
          return diagnostiquerCandidats(texte, thetas.map((t) => secteur(r2, t)), TOLERANCE_ARRONDIE);
        case "aireBalayee":
          return diagnostiquerDifference(texte, ciblesDifference(thetas, (t) => secteur(r1, t), (t) => secteur(r2, t)));
        default:
          throw new Error(`diagnostiquerChamp : phase '${phase}' hors séquence de 'secteurBalaye'`);
      }
    }
    case "segmentCirculaire": {
      const { r } = exercice;
      const thetas = candidatsTheta(exercice.thetaRad);
      switch (phase) {
        case "angleTheta":
          return diagnostiquerAngle(texte, exercice.thetaRad);
        case "aireSecteur":
          return diagnostiquerCandidats(texte, thetas.map((t) => secteur(r, t)), TOLERANCE_ARRONDIE);
        case "aireTriangle":
          return diagnostiquerCandidats(texte, thetas.map((t) => triangle(r, t)), TOLERANCE_ARRONDIE);
        case "aireSegment":
          return diagnostiquerDifference(texte, ciblesDifference(thetas, (t) => secteur(r, t), (t) => triangle(r, t)));
        default:
          throw new Error(`diagnostiquerChamp : phase '${phase}' hors séquence de 'segmentCirculaire'`);
      }
    }
    case "lentille": {
      const s1 = exercice.segment1;
      const s2 = exercice.segment2;
      const t1 = candidatsTheta(s1.thetaRad);
      const t2 = candidatsTheta(s2.thetaRad);
      switch (phase) {
        case "angle1":
          return diagnostiquerAngle(texte, s1.thetaRad);
        case "secteur1":
          return diagnostiquerCandidats(texte, t1.map((t) => secteur(s1.r, t)), TOLERANCE_ARRONDIE);
        case "triangle1":
          return diagnostiquerCandidats(texte, t1.map((t) => triangle(s1.r, t)), TOLERANCE_ARRONDIE);
        case "segmentAire1":
          return diagnostiquerDifference(texte, ciblesDifference(t1, (t) => secteur(s1.r, t), (t) => triangle(s1.r, t)));
        case "angle2":
          return diagnostiquerAngle(texte, s2.thetaRad);
        case "secteur2":
          return diagnostiquerCandidats(texte, t2.map((t) => secteur(s2.r, t)), TOLERANCE_ARRONDIE);
        case "triangle2":
          return diagnostiquerCandidats(texte, t2.map((t) => triangle(s2.r, t)), TOLERANCE_ARRONDIE);
        case "segmentAire2":
          return diagnostiquerDifference(texte, ciblesDifference(t2, (t) => secteur(s2.r, t), (t) => triangle(s2.r, t)));
        case "aireLentille":
        {
          // Somme de deux segments : chacun calculé puis arrondi, ou différence de deux aires
          // arrondies (entier exact) — toutes les combinaisons des deux cercles.
          const seg1 = ciblesDifference(t1, (t) => secteur(s1.r, t), (t) => triangle(s1.r, t));
          const seg2 = ciblesDifference(t2, (t) => secteur(s2.r, t), (t) => triangle(s2.r, t));
          const v1 = [...seg1.arrondies.map(Math.round), ...seg1.entieres];
          const v2 = [...seg2.arrondies.map(Math.round), ...seg2.entieres];
          const statut = diagnostiquerCandidats(texte, t1.flatMap((a) => t2.map((b) => segment(s1.r, a) + segment(s2.r, b))), TOLERANCE_ARRONDIE);
          if (statut !== "not_equivalent") return statut;
          return diagnostiquerCandidats(texte, v1.flatMap((a) => v2.map((b) => a + b)), 0);
        }
        default:
          throw new Error(`diagnostiquerChamp : phase '${phase}' hors séquence de 'lentille'`);
      }
    }
  }
}
