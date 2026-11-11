/**
 * Profil d'instance de `6gen24` (« Trouver la primitive vérifiant une condition initiale ») pour le
 * TIRAGE ÉQUILIBRÉ des évaluations (`.claude/rules/feuilles-evaluations.md`).
 *
 * - Cas particulier : F(a) = 0 (la primitive de référence s'annule au point de la condition), donc
 *   C = b se lit sans calcul. Les raccourcis propres au calcul de la primitive (6gen23) ne sont pas
 *   repris : l'enjeu de ce générateur est la condition initiale.
 * - Calculatrice : `calcul: 'exacte'` quand C est rationnel (C = b − F(a) sans ln, π ni racine) ;
 *   `'calculatrice'` sinon (C s'écrit exactement, 2 − ln 3 par exemple, mais sa valeur décimale
 *   demande la calculatrice). Mesures sur 5 000 tirages par variante : voir le rapport de la refonte.
 */
import type { ProfilInstance } from "../../../export/genererFeuilleExercices";
import type { ExerciceQuellePrimitive } from "../../core6e/quellePrimitive.types";

export const LIBELLE_CAS_QUELLE_PRIMITIVE = "Inclure un cas particulier (la primitive s'annule au point de la condition : C = b)";

export function estRationnel(v: number): boolean {
  if (!Number.isFinite(v)) return false;
  for (let d = 1; d <= 720; d++) {
    const n = Math.round(v * d);
    if (Math.abs(v - n / d) < 1e-9 * Math.max(1, Math.abs(v))) return true;
  }
  return false;
}

export function profilQuellePrimitive(e: ExerciceQuellePrimitive): ProfilInstance {
  const fa = e.exerciceBase.primitiveReference(e.a);
  const c = e.b - fa;
  const base = e.exerciceBase;
  const structurel = base.famille === "C" && base.sousType === "2";
  return { casParticulier: Math.abs(fa) < 1e-12 && !structurel ? "C-egal-b" : null, calcul: estRationnel(c) ? "exacte" : "calculatrice" };
}
