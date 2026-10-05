/**
 * Couche B (5e) — vérification pour 5gen6 ("Arcs et secteurs"). Une SEULE technique pour tous les
 * écrans (les 3 quantités manquantes du mode "deuxVersTrois" ET l'unique écran du mode
 * "conversion") : évalue directement via `evaluerExpressionGenerale` (cross-chantier, déjà
 * établi — reconnaît nativement "pi", y compris collé à un coefficient comme "3pi/2", depuis
 * l'audit promptauditparsingpisqrt.md), compare à la cible avec une tolérance unique ±0.01 —
 * suffisamment fine pour rejeter une vraie erreur, suffisamment large pour accepter
 * indifféremment une réponse exacte (ex. "5*pi/6", qui évalue quasi parfaitement) ou arrondie au
 * centième (spec : "Tolérance ±0,01 pour toute valeur décimale") — voir CLAUDE.md, section 5gen6,
 * pour la justification complète de cette unification.
 */
import { evaluerExpressionGenerale } from "../moteur/expressionGenerale";
import type { StatutVerification } from "../moteur/statutVerification";

export const TOLERANCE_ARC_SECTEUR = 0.01;

export function diagnostiquerValeurArcSecteur(texte: string, cible: number): StatutVerification {
  try {
    const valeur = evaluerExpressionGenerale(texte, 0);
    if (!Number.isFinite(valeur)) return "parse_error";
    return Math.abs(valeur - cible) <= TOLERANCE_ARC_SECTEUR ? "correct" : "not_equivalent";
  } catch {
    return "parse_error";
  }
}

export function verifierValeurArcSecteur(texte: string, cible: number): boolean {
  return diagnostiquerValeurArcSecteur(texte, cible) === "correct";
}
