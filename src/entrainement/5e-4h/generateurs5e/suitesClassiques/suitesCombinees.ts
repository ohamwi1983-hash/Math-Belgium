import type { ExerciceSuitesCombinees } from "../../core5e/suitesClassiques.types";

/** Scénario 3 — suite arithmétique et géométrique combinées.
 *
 * y,x,z avec x moyenne géométrique de y et z (x²=yz), et 6,y,z suite arithmétique (y=6+r,z=6+2r).
 * ⚠️ Voir la correction documentée dans `core5e/suitesClassiques.types.ts` : la donnée retenue est
 * le produit des TROIS nombres x·y·z=216 (pas seulement y·z), qui se résout élégamment :
 *   x·y·z=216, x²=yz ⟹ x·x²=216 ⟹ x³=216 ⟹ x=6 (racine cubique réelle unique)
 * Puis (6+r)(6+2r)=x²=36 ⟺ 2r²+18r=0 ⟺ 2r(r+9)=0 ⟺ r=0 (dégénéré, rejeté) ou r=-9 (retenu).
 */
export function construireSuitesCombinees(): ExerciceSuitesCombinees {
  const produitXYZ = 216;
  const x = Math.cbrt(produitXYZ);
  // (6+r)(6+2r)=x² ⟺ 2r²+18r+(36-x²)=0 — coefficients dérivés du développement, résolus par la
  // formule quadratique générale (jamais un "-9" recopié) ; 2 racines, on retient la NON NULLE
  // (r=0 dégénère la suite arithmétique en 6,6,6, rejeté).
  const A = 2;
  const B = 18;
  const C = 36 - x * x;
  const discriminant = B * B - 4 * A * C;
  const r1 = (-B + Math.sqrt(discriminant)) / (2 * A);
  const r2 = (-B - Math.sqrt(discriminant)) / (2 * A);
  const r = Math.abs(r1) > 1e-9 ? r1 : r2;
  const y = 6 + r;
  const z = 6 + 2 * r;
  return {
    scenario: "suitesCombinees",
    produitXYZ,
    x,
    r,
    arithmetique: [6, y, z],
    geometrique: [y, x, z],
  };
}
