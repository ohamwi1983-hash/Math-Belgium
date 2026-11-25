import type { EquationTable, ExerciceLoiNormaleA, ExerciceLoiNormaleB, FormeInverse, FormePhi } from "../../core6e/loiNormale.types";
import { lectureInverseTable, phiExacte, phiInverse, valeurTablePhi } from "../../../../lib/tablePhi";

/**
 * Calculs de `6gen51` (audit, G13) : la RÉFÉRENCE suit la méthode du cours — z au centième, Φ lue dans
 * la table (4 décimales, `lib/tablePhi.ts`) — et la valeur exacte (calculatrice) est acceptée aussi.
 * Avant : référence Φ(z exact) à 5·10⁻⁵ près, qui refusait la bonne lecture de table dans 51 % des B.
 */

export function arrondir(x: number, d: number): number {
  const f = 10 ** d;
  return Math.round(x * f + (x >= 0 ? 1e-9 : -1e-9)) / f;
}

/** Φ(z) lue dans la table (z quelconque au centième : symétrie pour z < 0). */
export function phiTable(z: number): number {
  const v = valeurTablePhi(Math.abs(z));
  return z >= 0 ? v : arrondir(1 - v, 4);
}

export type SousTypeDirect = "inferieur" | "superieur" | "intervalle";

/** Forme de l'écriture avec Φ (entrées positives). */
export function formeAttendue(sousType: SousTypeDirect, z1: number, z2: number | null): FormePhi {
  if (sousType === "inferieur") return z1 >= 0 ? "phi" : "unMoinsPhi";
  if (sousType === "superieur") return z1 >= 0 ? "unMoinsPhi" : "phi";
  if (z1 >= 0) return "diff";
  return (z2 as number) <= 0 ? "diffInverse" : "sommeMoinsUn";
}

/** Probabilités acceptées (table, puis calculatrice). */
export function probabilitesDirectes(sousType: SousTypeDirect, z1: number, z2: number | null, zExact1 = z1, zExact2 = z2): number[] {
  const table = sousType === "inferieur" ? phiTable(z1) : sousType === "superieur" ? arrondir(1 - phiTable(z1), 4) : arrondir(phiTable(z2 as number) - phiTable(z1), 4);
  const exacte = sousType === "inferieur" ? phiExacte(zExact1) : sousType === "superieur" ? 1 - phiExacte(zExact1) : phiExacte(zExact2 as number) - phiExacte(zExact1);
  return [table, exacte];
}

export function bornesZ(e: ExerciceLoiNormaleA | ExerciceLoiNormaleB): { z1: number; z2: number | null } {
  if (e.famille === "A") return { z1: e.z1, z2: e.z2 };
  return { z1: arrondir((e.x1 - e.mu) / e.sigma, 2), z2: e.x2 === null ? null : arrondir((e.x2 - e.mu) / e.sigma, 2) };
}

export function optionsFormes(sousType: SousTypeDirect): FormePhi[] {
  const base: FormePhi[] = sousType === "intervalle" ? ["diff", "sommeMoinsUn", "diffInverse"] : ["phi", "unMoinsPhi", "phiMoinsDemi"];
  for (let i = base.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [base[i], base[j]] = [base[j], base[i]];
  }
  return base;
}

/** Valeur numérique (table) d'une forme, pour un message ciblé. */
export function valeurForme(forme: FormePhi, z1: number, z2: number | null): number {
  const t1 = valeurTablePhi(Math.abs(z1));
  const t2 = z2 === null ? 0 : valeurTablePhi(Math.abs(z2));
  switch (forme) {
    case "phi":
      return t1;
    case "unMoinsPhi":
      return arrondir(1 - t1, 4);
    case "phiMoinsDemi":
      return arrondir(t1 - 0.5, 4);
    case "diff":
      return arrondir(t2 - t1, 4);
    case "sommeMoinsUn":
      return arrondir(t2 + t1 - 1, 4);
    case "diffInverse":
      return arrondir(t1 - t2, 4);
  }
}

// ============================================================================
// Sens inverse
// ============================================================================

function equation(id: string, oppose: boolean, valeur: number, calcul: string): EquationTable {
  return { id, oppose, valeur: arrondir(valeur, 4), calcul };
}

/** Équations candidates à partir de p (une est la bonne pour la forme donnée). */
export function equationsCandidates(p: number): EquationTable[] {
  return [
    equation("phiP", false, p, "p"),
    equation("phiUnMoinsP", false, 1 - p, "1-p"),
    equation("phiOpposeUnMoinsP", true, 1 - p, "1-p"),
    equation("phiOpposeP", true, p, "p"),
    equation("phiCentre", false, (1 + p) / 2, "\\dfrac{1+p}{2}"),
    equation("phiDemiPlusP", false, 0.5 + p, "0{,}5+p"),
  ];
}

export function equationJuste(forme: FormeInverse, p: number): string {
  switch (forme) {
    case "inferieur":
      return p >= 0.5 ? "phiP" : "phiOpposeUnMoinsP";
    case "superieur":
      return p <= 0.5 ? "phiUnMoinsP" : "phiOpposeP";
    case "centre":
      return "phiCentre";
    case "depuisZero":
      return "phiDemiPlusP";
  }
}

/** Quatre équations proposées (la bonne et trois autres, valeurs dans ]0 ; 1[ et distinctes). */
export function choisirEquations(forme: FormeInverse, p: number): { equations: EquationTable[]; bonne: string } {
  const bonne = equationJuste(forme, p);
  const toutes = equationsCandidates(p).filter((e) => e.valeur > 0 && e.valeur < 1);
  const juste = toutes.find((e) => e.id === bonne)!;
  const autres = toutes.filter((e) => e.id !== bonne && !(e.oppose === juste.oppose && Math.abs(e.valeur - juste.valeur) < 1e-9));
  for (let i = autres.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [autres[i], autres[j]] = [autres[j], autres[i]];
  }
  const liste = [juste, ...autres.slice(0, 3)];
  for (let i = liste.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [liste[i], liste[j]] = [liste[j], liste[i]];
  }
  return { equations: liste, bonne };
}

/** Valeurs de t (au centième) acceptées pour l'équation juste : lecture inverse de la table (deux
 * voisines si la valeur tombe entre deux cases), signe selon Φ(t) ou Φ(−t). */
export function tAcceptes(eq: EquationTable): { exactes: number[]; calculatrice: number } {
  const zs = lectureInverseTable(eq.valeur);
  const signe = eq.oppose ? -1 : 1;
  return { exactes: zs.map((z) => arrondir(signe * z, 2)), calculatrice: signe * phiInverse(eq.valeur) };
}

/** p construite à partir d'un t au centième (valeur de table exacte), selon la forme. */
export function pDepuisT(forme: FormeInverse, t: number): number {
  const T = valeurTablePhi(Math.abs(t));
  switch (forme) {
    case "inferieur":
      return t >= 0 ? T : arrondir(1 - T, 4);
    case "superieur":
      return t >= 0 ? arrondir(1 - T, 4) : T;
    case "centre":
      return arrondir(2 * T - 1, 4);
    case "depuisZero":
      return arrondir(T - 0.5, 4);
  }
}

// ============================================================================
// Règle empirique (cours : 68,3 % ; 95,4 % ; 99,7 %)
// ============================================================================

export const POURCENTAGE_REGLE: Record<1 | 2 | 3, number> = { 1: 0.683, 2: 0.954, 3: 0.997 };

export function proportionsRegle(k: 1 | 2 | 3, unCote: boolean): number[] {
  const regle = 1 - POURCENTAGE_REGLE[k];
  const exacte = 2 * (1 - phiExacte(k));
  return unCote ? [arrondir(regle / 2, 5), exacte / 2] : [arrondir(regle, 4), exacte];
}
