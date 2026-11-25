import type { Poly } from "../moteur6e/algebreLieux";

/**
 * `6gen57` — Problèmes de lieux : méthode des génératrices (6e ch. 9, § 5, processus 3 TRANSFÉRER ;
 * audit du chapitre, lots B et C). Les génératrices, le résultat de l'élimination et les morceaux
 * sont des POLYNÔMES exacts (comparaison à une constante près, jamais de chaîne clavier).
 */

export type StatutMorceauLieu = "singulier" | "parasite" | "propre";

export interface MorceauLieu {
  /** Équation du morceau, en KaTeX (« y=0 », « x=\frac{7}{3} »). */
  latex: string;
  statut: StatutMorceauLieu;
}

export interface OptionRestrictionLieu {
  id: string;
  /** Libellé, formules entre `$…$`. */
  label: string;
}

export type DonneesGeneratrices =
  | { famille: "A"; b: number; d: number }
  | { famille: "B"; a: number; c: number }
  | { famille: "C"; h: number; k: number }
  | { famille: "D"; sousCas: 1; c: number; h: number }
  | { famille: "D"; sousCas: 2; b: number; c: number }
  | { famille: "E"; methode: "soustraction" | "produitCroise"; p: number; r: number };

export type FamilleMethodeGeneratrices = DonneesGeneratrices["famille"];

export interface ExerciceMethodeGeneratrices {
  donnees: DonneesGeneratrices;
  /** Lettre du paramètre dans les génératrices (« α », ou « t » = tan α en famille C). */
  parametre: "α" | "t";
  /** Noms des deux génératrices (« (AY) », « a »…) et leurs équations attendues (polynômes en x, y et le paramètre). */
  noms: [string, string];
  generatrices: [Poly, Poly];
  /** Équations des génératrices en KaTeX (réponse affichée). */
  generatricesLatex: [string, string];
  /** Résultat de l'élimination (polynôme en x, y, à une constante près) et sa forme factorisée en KaTeX. */
  elimine: Poly;
  elimineLatex: string;
  /** Même équation écrite au clavier (contrôles automatiques seulement, jamais affichée). */
  elimineTexte: string;
  /** Nombre de facteurs non constants (forme factorisée exigée si ≥ 2). */
  facteurs: number;
  morceaux: MorceauLieu[];
  optionsRestriction: OptionRestrictionLieu[];
  idRestrictionCorrecte: string;
  /** Texte de la bonne restriction (corrigé). */
  restrictionLatex: string;
}
