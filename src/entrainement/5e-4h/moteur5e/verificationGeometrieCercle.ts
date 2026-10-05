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

/** Dispatch, par scénario PUIS par phase, sur la cible et la tolérance attendue — `exercice` est
 * TypeScript-narrowed à l'intérieur de chaque branche `switch(exercice.scenario)`, jamais un cast
 * manuel. Lève si `phase` n'appartient pas à la séquence du scénario donné (jamais atteint en
 * pratique, `phaseApres` ne produit jamais une phase hors séquence — garde défensive, même principe
 * que `commeDirecte`/`commeProduit` de 5gen10). */
export function diagnostiquerChamp(exercice: ExerciceGeometrieCercle, phase: PhaseGeometrieCercle, texte: string): StatutVerification {
  switch (exercice.scenario) {
    case "secteurBalaye":
      switch (phase) {
        case "conversionRad":
          return diagnostiquerCalculDixieme(texte, exercice.thetaRad);
        case "aireGrandSecteur":
          return diagnostiquerCalculArrondi(texte, exercice.aireGrandSecteur);
        case "airePetitSecteur":
          return diagnostiquerCalculArrondi(texte, exercice.airePetitSecteur);
        case "aireBalayee":
          return diagnostiquerCalculArrondi(texte, exercice.aireBalayee);
        default:
          throw new Error(`diagnostiquerChamp : phase '${phase}' hors séquence de 'secteurBalaye'`);
      }
    case "segmentCirculaire":
      switch (phase) {
        case "angleTheta":
          return diagnostiquerCalculDixieme(texte, exercice.thetaRad);
        case "aireSecteur":
          return diagnostiquerCalculArrondi(texte, exercice.aireSecteur);
        case "aireTriangle":
          return diagnostiquerCalculArrondi(texte, exercice.aireTriangle);
        case "aireSegment":
          return diagnostiquerCalculArrondi(texte, exercice.aireSegment);
        default:
          throw new Error(`diagnostiquerChamp : phase '${phase}' hors séquence de 'segmentCirculaire'`);
      }
    case "lentille":
      switch (phase) {
        case "angle1":
          return diagnostiquerCalculDixieme(texte, exercice.segment1.thetaRad);
        case "secteur1":
          return diagnostiquerCalculArrondi(texte, exercice.segment1.aireSecteur);
        case "triangle1":
          return diagnostiquerCalculArrondi(texte, exercice.segment1.aireTriangle);
        case "segmentAire1":
          return diagnostiquerCalculArrondi(texte, exercice.segment1.aireSegment);
        case "angle2":
          return diagnostiquerCalculDixieme(texte, exercice.segment2.thetaRad);
        case "secteur2":
          return diagnostiquerCalculArrondi(texte, exercice.segment2.aireSecteur);
        case "triangle2":
          return diagnostiquerCalculArrondi(texte, exercice.segment2.aireTriangle);
        case "segmentAire2":
          return diagnostiquerCalculArrondi(texte, exercice.segment2.aireSegment);
        case "aireLentille":
          return diagnostiquerCalculArrondi(texte, exercice.aireLentille);
        default:
          throw new Error(`diagnostiquerChamp : phase '${phase}' hors séquence de 'lentille'`);
      }
  }
}
