/**
 * Profil d'instance de `6gen23` (« Calcul de primitives ») pour le TIRAGE ÉQUILIBRÉ des évaluations
 * (`AdaptateurFeuilleExercices.profilInstance`, `.claude/rules/feuilles-evaluations.md`).
 *
 * Cas particuliers retenus (ils RACCOURCISSENT la résolution ; mesures sur 5 000 tirages par
 * variante, voir le rapport de la refonte papier) :
 * - B : facteur d'ajustement λ = 1 (le coefficient affiché est déjà u′(x)) ;
 * - A_diviserFraction : dénominateur x (r = 1), division la plus simple ;
 * - C4 : coefficient ±1 devant eˣ ;
 * - G4 : h = 0, le dénominateur est déjà x² + m² (aucun carré à compléter).
 * Les autres variantes n'ont pas de raccourci : leur structure est fixée par la variante choisie
 * par le professeur.
 *
 * Calculatrice : sans objet (calcul littéral, aucune valeur numérique) — `calcul` absent.
 */
import type { ProfilInstance } from "../../../export/genererFeuilleExercices";
import type { ExerciceCalculPrimitives } from "../../core6e/calculPrimitives.types";

export const LIBELLE_CAS_CALCUL_PRIMITIVES =
  "Inclure un cas particulier (facteur d'ajustement égal à 1, division par x, coefficient ±1, aucun carré à compléter)";

/** Identifiant du cas particulier de l'instance, ou null (instance complète). */
export function casParticulierPrimitive(e: ExerciceCalculPrimitives): string | null {
  if (e.famille === "B") return e.facteurAjustement === 1 ? "facteur-1" : null;
  if (e.famille === "A" && e.sousType === "diviserFraction") return e.r === 1 ? "division-par-x" : null;
  if (e.famille === "C" && e.sousType === "4") return Math.abs(e.k) === 1 ? "coefficient-1" : null;
  if (e.famille === "G" && e.sousType === "4") return e.h === 0 ? "sans-carre-a-completer" : null;
  return null;
}

export function profilCalculPrimitives(e: ExerciceCalculPrimitives): ProfilInstance {
  return { casParticulier: casParticulierPrimitive(e) };
}
