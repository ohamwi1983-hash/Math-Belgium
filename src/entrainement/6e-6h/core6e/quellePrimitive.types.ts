import type { ExerciceFamilleA, ExerciceFamilleB, ExerciceFamilleC, ExerciceFamilleG } from "./calculPrimitives.types";

/**
 * Couche core (6e) — contrat pour `6gen24` ("Quelle primitive ? (condition initiale)", chapitre 4
 * — "Intégrales et primitives", PROLONGE `6gen23`). Réutilise INTÉGRALEMENT la Couche A
 * (construction) et la Couche B (vérification) des familles A, B, C, G de `6gen23` — jamais D, E, F
 * (exclues par la spec, cf. `docs/historique-6e.md` section 6gen23 et en-tête de
 * `core6e/calculPrimitives.types.ts`) — puis ajoute UN SEUL écran nouveau : trouver la constante C
 * depuis une condition initiale F(a)=b, une fois la primitive générale F(x)+C calculée (écrans
 * empruntés tels quels à 6gen23, C restant symbolique jusqu'au bout comme là-bas).
 *
 * `exerciceBase` est directement un `ExerciceFamilleA|B|C|G` de 6gen23 (jamais une copie de sa
 * structure) — tous les champs `*Reference` de 6gen23 (notamment `primitiveReference`,
 * `integrandeReference`) restent utilisables tels quels ici, en particulier pour résoudre
 * `C = b - primitiveReference(a)` (voir `moteur6e/verificationQuellePrimitive.ts`) et pour choisir
 * un point `a` sûr dans le domaine de f (voir `generateurs6e/quellePrimitive/point.ts`).
 */
export type ExerciceBaseQuellePrimitive = ExerciceFamilleA | ExerciceFamilleB | ExerciceFamilleC | ExerciceFamilleG;

export interface ExerciceQuellePrimitive {
  exerciceBase: ExerciceBaseQuellePrimitive;
  /** Point x=a où la condition initiale est imposée, stocké en fraction EXACTE aNum/aDen (jamais un
   * simple décimal arrondi — convention CLAUDE.md) — choisi STRICTEMENT dans le domaine de f (voir
   * `generateurs6e/quellePrimitive/point.ts`, technique générique "candidats, premier fini retenu"). */
  aNum: number;
  aDen: number;
  /** a = aNum/aDen, EXACT — précalculé pour éviter de refaire la division à chaque évaluation
   * (même convention que `ExerciceFamilleB.facteurAjustement`). */
  a: number;
  /** Valeur imposée F(a)=b — tirée librement parmi de petits entiers (spec : "b tiré librement",
   * une constante C non entière/fractionnaire issue du calcul est acceptée sans difficulté, la
   * vérification restant symbolique — voir `moteur6e/verificationQuellePrimitive.ts`). */
  b: number;
}
