/**
 * Couche B (5e) — vérification pour 5gen19 ("Suite récurrente affine et régime permanent").
 * Réutilise `evaluerExpressionGenerale` (cross-chantier, déjà établi). `combinerStatuts`/
 * `statutNumerique` répliqués localement (même principe que 5gen17/5gen18).
 */
import type { ExerciceSuiteRecurrenteAffine } from "../core5e/suiteRecurrenteAffine.types";
import { evaluerExpressionGenerale } from "../moteur/expressionGenerale";
import { fractionQVersNombre } from "./fractionQ";
import type { StatutVerification } from "../moteur/statutVerification";

export const TOLERANCE_PRECISE = 0.01;

function statutNumerique(valeur: number, cible: number, tolerance: number): StatutVerification {
  if (!Number.isFinite(valeur)) return "parse_error";
  return Math.abs(valeur - cible) <= tolerance ? "correct" : "not_equivalent";
}

function combinerStatuts(...statuts: StatutVerification[]): StatutVerification {
  if (statuts.some((s) => s === "parse_error")) return "parse_error";
  return statuts.every((s) => s === "correct") ? "correct" : "not_equivalent";
}

function diagnostiquerNombreTexte(texte: string, cible: number, tolerance: number): StatutVerification {
  try {
    const valeur = evaluerExpressionGenerale(texte, 0);
    return statutNumerique(valeur, cible, tolerance);
  } catch {
    return "parse_error";
  }
}

const POINTS_ECHANTILLON = [0, 1, 5, 10, 20];

/** Écran "poserRecurrence" — l'élève écrit u_(n+1) en fonction de u_n, "x" représentant u_n (même
 * convention que le reste de la plateforme pour toute expression en une variable). Équivalence par
 * échantillonnage à plusieurs points, jamais une comparaison textuelle. */
export function diagnostiquerPoserRecurrence(texte: string, exercice: ExerciceSuiteRecurrenteAffine): StatutVerification {
  const a = fractionQVersNombre(exercice.a);
  const statuts: StatutVerification[] = [];
  for (const x of POINTS_ECHANTILLON) {
    try {
      const valeur = evaluerExpressionGenerale(texte, x);
      statuts.push(statutNumerique(valeur, a * x + exercice.b, TOLERANCE_PRECISE));
    } catch {
      statuts.push("parse_error");
    }
  }
  return combinerStatuts(...statuts);
}

export interface ReponseRegimePermanent {
  existe: boolean;
  L: string;
}

/** Écran "regimePermanent" — piège central de la spec : l'élève doit d'abord juger si un régime
 * permanent EXISTE (|a|<1) avant même de tenter de le calculer ; si `existe` est correctement
 * `false` (régime divergent), le champ `L` n'est jamais vérifié (aucun calcul attendu). */
export function diagnostiquerRegimePermanent(reponse: ReponseRegimePermanent, exercice: ExerciceSuiteRecurrenteAffine): StatutVerification {
  const bonneExistence = reponse.existe === (exercice.regime === "convergent");
  if (!bonneExistence) return "not_equivalent";
  if (!reponse.existe) return "correct";
  return diagnostiquerNombreTexte(reponse.L, fractionQVersNombre(exercice.L!), TOLERANCE_PRECISE);
}

/** Écran "termesSuccessifs" — u2/u3/u4, dans cet ordre. */
export function diagnostiquerTermesSuccessifs(textes: string[], exercice: ExerciceSuiteRecurrenteAffine): StatutVerification {
  if (textes.length !== 3) return "not_equivalent";
  const cibles = [exercice.u2, exercice.u3, exercice.u4].map(fractionQVersNombre);
  return combinerStatuts(...textes.map((t, i) => diagnostiquerNombreTexte(t, cibles[i], TOLERANCE_PRECISE)));
}
