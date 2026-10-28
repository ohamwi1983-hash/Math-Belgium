import type { Exercice } from "../../core/generateur.types";

/**
 * Équation `Ax²+Bx+C=0` embarquée (`ExerciceNiveau2Quadratique.zeros`) quand `Δ=B²-4AC<0` — aucune
 * racine réelle, donc "aucun zéro" à l'écran final (niveau 2, `carre`/`inverse`). Catégorie
 * `irreductible` du contrat `Exercice` (déjà prévue pour ce cas, voir `core/generateur.types.ts`),
 * `racines` à `[NaN, NaN]` par convention de ce contrat — JAMAIS lues telles quelles : `zerosAttendus`
 * (`verificationCaracteristiquesAlgebriques.ts`) renvoie `[]` pour cette catégorie avant tout appel à
 * `racinesDistinctes` (qui renverrait sinon deux `NaN`). Seul `enonce` sert en aval (vérification des
 * étapes "isolement"/"regroupe", affichage de l'équation développée).
 */
export function construireEquationSansRacine(A: number, B: number, C: number): Exercice {
  return {
    categorie: "irreductible",
    enonce: { a: A, b: B, c: C },
    solution: { racines: [NaN, NaN], racinesExactes: true },
    formeAffichage: "canonique",
  };
}
