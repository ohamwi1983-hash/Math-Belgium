import { phiExact, phiTable } from "./tablePhi";

/**
 * Couche core — `6gen116` « Lire la table de Φ » (6e ch. 8, § 6, processus 1 CONNAÎTRE). La vraie
 * table est consultable à l'écran (`BoutonTablePhi`). Six variantes, deux écrans chacune :
 * - `directe` : P(Z ≤ a), a > 0 — ligne et colonne de la case, puis Φ(a) ;
 * - `complement` : P(Z ≥ a) ou P(Z > a) — écriture avec Φ (choix), puis la valeur ;
 * - `symetrie` : P(Z ≤ −a) — écriture avec Φ (piège : Φ(−a) = Φ(a)), puis la valeur ;
 * - `intervalle` : P(a ≤ Z ≤ b), borne inférieure positive ou négative — écriture, puis la valeur ;
 * - `inverse` : z tel que P(Z ≤ z) = p > 0,5 — case la plus proche, puis z ;
 * - `inverseSymetrie` : z tel que P(Z ≥ z) = q ou P(Z ≤ z) = p < 0,5 — valeur de Φ à chercher
 *   (1 − q ou 1 − p), puis z (avec son signe).
 * Référence = lecture de la table (z au centième, Φ à quatre décimales) ; la valeur exacte de la
 * calculatrice est acceptée aussi (fenêtre des deux).
 */

export type VarianteLTP = "directe" | "complement" | "symetrie" | "intervalle" | "inverse" | "inverseSymetrie";
export type PhaseLTP = "case" | "ecriture" | "valeur" | "cible" | "z";

export const VARIANTES_LTP: VarianteLTP[] = ["directe", "complement", "symetrie", "intervalle", "inverse", "inverseSymetrie"];

export interface ExerciceLTP {
  variante: VarianteLTP;
  /** Nombre positif lu dans la table (z à deux décimales), ou borne inférieure en valeur absolue. */
  a: number;
  /** Borne supérieure (intervalle). */
  b: number;
  /** Intervalle : borne inférieure négative (−a). */
  aNeg: boolean;
  /** Complément : « > » au lieu de « ≥ ». */
  strict: boolean;
  /** Sens inverse : probabilité donnée (quatre décimales). */
  p: number;
  /** z cherché (sens inverse), avec son signe. */
  z: number;
  /** inverseSymetrie : « sup » = P(Z ≥ z) = p (z > 0) ; « inf » = P(Z ≤ z) = p < 0,5 (z < 0). */
  sens: "inf" | "sup";
  /** Ordre d'affichage des options de l'écran « écriture ». */
  options: string[];
}

export function phases(e: ExerciceLTP): PhaseLTP[] {
  switch (e.variante) {
    case "directe":
      return ["case", "valeur"];
    case "inverse":
      return ["case", "z"];
    case "inverseSymetrie":
      return ["cible", "z"];
    default:
      return ["ecriture", "valeur"];
  }
}

/** Identifiant de la bonne écriture (écran « écriture »). */
export function bonneEcriture(e: ExerciceLTP): string {
  if (e.variante === "intervalle") return e.aNeg ? "sommeMoinsUn" : "diff";
  return "unMoins";
}

export const OPTIONS_ECRITURE: Record<"complement" | "symetrie" | "intervalle" | "intervalleNeg", string[]> = {
  complement: ["unMoins", "phi", "phiMoinsDemi", "demiMoins"],
  symetrie: ["unMoins", "phi", "moinsPhi", "phiMoinsDemi"],
  intervalle: ["diff", "somme", "diffInv", "unMoinsSomme"],
  intervalleNeg: ["sommeMoinsUn", "diff", "somme", "unMoinsDiff"],
};

/** Valeur (table) d'une écriture avec Φ pour l'instance (options fausses comprises : messages). */
export function valeurEcriture(e: ExerciceLTP, id: string, phi: (z: number) => number = phiTable): number {
  const A = phi(e.a);
  const B = phi(e.b);
  switch (id) {
    case "unMoins":
      return 1 - A;
    case "phi":
      return A;
    case "phiMoinsDemi":
      return A - 0.5;
    case "demiMoins":
      return 0.5 - A;
    case "moinsPhi":
      return -A;
    case "diff":
      return B - A;
    case "somme":
      return A + B;
    case "diffInv":
      return A - B;
    case "unMoinsSomme":
      return 1 - A - B;
    case "sommeMoinsUn":
      return A + B - 1;
    case "unMoinsDiff":
      return 1 - B + A;
  }
  return NaN;
}

const r4 = (x: number) => Math.round(x * 1e4) / 1e4;

/** Probabilité cherchée (variantes « directes ») : lecture de la table, et valeur exacte. */
export function probaTable(e: ExerciceLTP): number {
  return e.variante === "directe" ? phiTable(e.a) : r4(valeurEcriture(e, bonneEcriture(e)));
}
export function probaExacte(e: ExerciceLTP): number {
  return e.variante === "directe" ? phiExact(e.a) : valeurEcriture(e, bonneEcriture(e), phiExact);
}

/** Ligne (unité et dixième) et colonne (centième) de la case de a. */
export function ligneColonne(z: number): { ligne: number; colonne: number } {
  const c = Math.round(Math.abs(z) * 100);
  return { ligne: Math.floor(c / 10) / 10, colonne: (c % 10) / 100 };
}

/** Valeur de Φ à chercher dans la table (sens inverse) : p, 1 − q ou 1 − p. */
export function cible(e: ExerciceLTP): number {
  return e.variante === "inverse" ? e.p : r4(1 - e.p);
}
