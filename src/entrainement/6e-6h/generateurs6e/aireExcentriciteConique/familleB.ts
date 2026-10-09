import type { ExerciceFamilleB, SousTypeFamilleB } from "../../core6e/aireExcentriciteConique.types";
import { tirerEntier, tirerParmi } from "./aleatoire";

/** Bornes du tirage de `k` (sous-type `distanceDirectrices`) — `k=4`/`k=9` sont des carrés parfaits
 * (e propre, `1/2`/`1/3`), les autres valeurs de l'intervalle donnent un `e` irrationnel. */
const K_MIN = 2;
const K_MAX = 9;

/**
 * Couche A (6e) — famille B de `6gen60` ("Excentricité depuis une condition géométrique"). 3
 * sous-types équiprobables, chacun traduit une condition géométrique en une équation reliant
 * a,b,c (ou directement e), résolue pour `e` (voir dérivations complètes dans l'en-tête de
 * `core6e/aireExcentriciteConique.types.ts`).
 *
 * - `abscisseFoyerParallele`/`angleDroitSommetSecondaire` : condition PUREMENT structurelle
 *   (aucun paramètre numérique tiré), toujours résolue en `e=√2/2` — attendu, ce sont 2
 *   formulations classiques équivalentes du même fait ; le but pédagogique est la DÉRIVATION, pas
 *   la diversité numérique du résultat.
 * - `distanceDirectrices` : `k` tiré entier ≥2 (garantit `e=1/√k<1`, condition ellipse) — `e` est
 *   une fraction propre exacte quand `k` est un carré parfait (ex. `k=4→e=1/2`), irrationnelle
 *   sinon.
 */

interface OverridesFamilleB {
  sousType?: SousTypeFamilleB;
  k?: number;
}

export function construireFamilleB(overrides: OverridesFamilleB = {}): ExerciceFamilleB {
  const sousType = overrides.sousType ?? tirerParmi(["abscisseFoyerParallele", "angleDroitSommetSecondaire", "distanceDirectrices"] as const);

  if (sousType === "distanceDirectrices") {
    const k = overrides.k ?? tirerEntier(K_MIN, K_MAX);
    return { famille: "B", sousType, k, excentricite: 1 / Math.sqrt(k) };
  }

  return { famille: "B", sousType, excentricite: Math.SQRT1_2 };
}
