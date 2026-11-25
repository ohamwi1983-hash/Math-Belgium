import { C } from "../ui6e/nombresCombinatoireLotH2";

/**
 * Couche core — `6gen106` « Chemins dans un quadrillage » (6e ch. 7, § 4, processus 3 TRANSFÉRER).
 * Un chemin le plus court de A (en bas à gauche) à B (en haut à droite) d'un quadrillage de m
 * carreaux de large et n de haut compte m déplacements « → » et n déplacements « ↑ », dans un ordre
 * quelconque : il y en a C₍ₘ₊ₙ₎ⁿ (choisir les places des n « ↑ » parmi les m + n déplacements).
 * Trois variantes :
 * - `total` : chemins de A à B (écran 1 : nombre de déplacements et de « ↑ » ; écran 2 : chemins) ;
 * - `passage` : chemins qui passent par le nœud P (A → P, P → B, produit) ;
 * - `eviter` : chemins qui évitent P (total, chemins par P, différence).
 * P est un nœud intérieur (ni sur le bord, ni en A ou B) : le produit et la différence ne sont
 * jamais triviaux.
 */

export type VarianteChemins = "total" | "passage" | "eviter";
export type PhaseChemins = "pas" | "chemins" | "avantP" | "apresP" | "total" | "parP";

export interface ExerciceChemins {
  variante: VarianteChemins;
  /** Largeur (déplacements « → ») et hauteur (déplacements « ↑ ») du quadrillage. */
  m: number;
  n: number;
  /** Nœud P (colonne, ligne) depuis A ; 0, 0 pour `total`. */
  px: number;
  py: number;
  /** Contexte : 0 robot sur un quadrillage, 1 livreur dans des rues en damier. */
  ctx: 0 | 1;
}

export function phasesChemins(e: ExerciceChemins): PhaseChemins[] {
  if (e.variante === "total") return ["pas", "chemins"];
  if (e.variante === "passage") return ["avantP", "apresP", "chemins"];
  return ["total", "parP", "chemins"];
}

export const totalAB = (e: ExerciceChemins): number => C(e.m + e.n, e.n);
export const avantP = (e: ExerciceChemins): number => C(e.px + e.py, e.py);
export const apresP = (e: ExerciceChemins): number => C(e.m - e.px + (e.n - e.py), e.n - e.py);
export const parP = (e: ExerciceChemins): number => avantP(e) * apresP(e);

/** Nombre cherché par la question. */
export function reponseFinale(e: ExerciceChemins): number {
  if (e.variante === "total") return totalAB(e);
  if (e.variante === "passage") return parP(e);
  return totalAB(e) - parP(e);
}

/** Valeur attendue d'un écran (l'écran « pas » a deux champs : déplacements, dont « ↑ »). */
export function valeursAttendues(e: ExerciceChemins, p: PhaseChemins): number[] {
  switch (p) {
    case "pas":
      return [e.m + e.n, e.n];
    case "avantP":
      return [avantP(e)];
    case "apresP":
      return [apresP(e)];
    case "total":
      return [totalAB(e)];
    case "parP":
      return [parP(e)];
    case "chemins":
      return [reponseFinale(e)];
  }
}

/** Un chemin d'exemple (mot de « R » et « U ») : par P si `parP`, sinon en évitant P (corrigé). */
export function cheminExemple(e: ExerciceChemins, parLeNoeud: boolean): string {
  if (e.variante === "total") return "R".repeat(Math.ceil(e.m / 2)) + "U".repeat(Math.ceil(e.n / 2)) + "R".repeat(Math.floor(e.m / 2)) + "U".repeat(Math.floor(e.n / 2));
  if (parLeNoeud) return "R".repeat(e.px) + "U".repeat(e.py) + "U".repeat(e.n - e.py) + "R".repeat(e.m - e.px);
  // Évite P : tout en haut d'abord si possible (P intérieur, donc la colonne 0 ne passe jamais par P).
  return "U".repeat(e.n) + "R".repeat(e.m);
}
