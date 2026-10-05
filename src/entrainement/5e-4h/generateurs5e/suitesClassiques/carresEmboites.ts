import type { ExerciceCarresEmboites } from "../../core5e/suitesClassiques.types";
import { sommeInfinie, termeGeometrique } from "../suitesGeometriques/parametres";

/** Scénario 7 — des carrés emboîtés (2 parties indépendantes).
 *
 * Partie a — fraction colorée = somme infinie 1/4+1/16+1/64+... (u1=1/4, q=1/4).
 * Partie b — aires de carrés emboîtés de côté a=4 (simplification assumée, voir le contrat core) :
 * a², a²/2, a²/4... (u1=a², q=1/2), somme infinie = 2a².
 */
export function construireCarresEmboites(): ExerciceCarresEmboites {
  const u1A = 1 / 4;
  const qA = 1 / 4;
  const sommeInfinieA = sommeInfinie(u1A, qA) ?? 0;

  const coteB = 4;
  const qB = 1 / 2;
  const u1B = coteB * coteB;
  const airesB: [number, number, number] = [termeGeometrique(u1B, qB, 1), termeGeometrique(u1B, qB, 2), termeGeometrique(u1B, qB, 3)];
  const sommeInfinieB = sommeInfinie(u1B, qB) ?? 0;

  return { scenario: "carresEmboites", u1A, qA, sommeInfinieA, qB, coteB, airesB, sommeInfinieB };
}
