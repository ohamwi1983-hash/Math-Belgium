import type { ExerciceTrianglesZigzag } from "../../core5e/suitesClassiques.types";
import { sommeInfinie, termeGeometrique } from "../suitesGeometriques/parametres";
import { choisirParmi } from "./aleatoire";

export const COTES_ZIGZAG = [4, 6, 8, 10, 12] as const;

/** Scénario 6 — zigzag dans un triangle équilatéral ABC de côté c (modèle complet dans
 * `core5e/suitesClassiques.types.ts`). Dans le triangle rectangle Tₖ = C Hₖ₋₁ Hₖ (angle 60° en C),
 * ℓₖ = CHₖ₋₁·sin 60° et CHₖ = CHₖ₋₁·cos 60° = CHₖ₋₁/2 : les longueurs forment une suite
 * géométrique de premier terme c√3/2 et de raison 1/2, les aires des triangles emboîtés Tₖ
 * (½·CHₖ·ℓₖ) une suite de premier terme c²√3/8 et de raison 1/4. */
export function construireTrianglesZigzag(cote: number = choisirParmi(COTES_ZIGZAG)): ExerciceTrianglesZigzag {
  const cosC = 1 / 2; // cos 60°
  const sinC = Math.sqrt(3) / 2; // sin 60°
  // Construction pas à pas (indépendante des formules fermées ci-dessous, recoupée en test).
  let hypotenuse = cote; // CH₀ = CB
  const longueursPas: number[] = [];
  const airesPas: number[] = [];
  for (let k = 1; k <= 4; k++) {
    const l = hypotenuse * sinC;
    const base = hypotenuse * cosC; // CHₖ
    longueursPas.push(l);
    airesPas.push((base * l) / 2);
    hypotenuse = base;
  }
  const l1 = longueursPas[0];
  const raisonLongueurs = cosC;
  const longueurs: [number, number, number, number] = [1, 2, 3, 4].map((k) => termeGeometrique(l1, raisonLongueurs, k)) as [number, number, number, number];
  const longueurLimite = sommeInfinie(l1, raisonLongueurs) ?? 0;
  const a1 = airesPas[0];
  const airesT: [number, number, number] = [1, 2, 3].map((k) => termeGeometrique(a1, raisonLongueurs ** 2, k)) as [number, number, number];
  const aireU1 = a1 - airesT[1];
  const sommeAiresU = sommeInfinie(aireU1, raisonLongueurs ** 2) ?? 0;
  return { scenario: "trianglesZigzag", cote, longueurs, longueurLimite, airesT, aireU1, sommeAiresU };
}
