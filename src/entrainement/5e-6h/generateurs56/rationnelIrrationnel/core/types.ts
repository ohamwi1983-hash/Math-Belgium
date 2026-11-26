import type { Frag } from "../../../../5e-4h/ui5e/ecransTrigo.types";

/**
 * `56gen14` — « Rationnel ou irrationnel ? » (5e (6h), « Nombres réels et suites », étape 1
 * « irrationnels », processus 1 CONNAÎTRE). Quatre nombres écrits sous une forme qui cache souvent leur
 * nature (racines, fractions, puissances, écritures décimales, expressions, valeurs trigonométriques,
 * π, Φ) ; un écran par nombre : le plus petit des ensembles ℕ, ℤ, ℚ, ℝ∖ℚ qui le contient (choix fermé,
 * une tentative). Le verdict (l'ensemble) de CHAQUE nombre est tiré à parts égales AVANT le nombre.
 */

/** N : naturels ; Z : entiers ; Q : rationnels ; I : irrationnels (ℝ∖ℚ). */
export type EnsembleNb = "N" | "Z" | "Q" | "I";
export const ENSEMBLES: EnsembleNb[] = ["N", "Z", "Q", "I"];

export type FamilleNombre = "racines" | "ecritures" | "expressions" | "constantes";
export const FAMILLES: FamilleNombre[] = ["racines", "ecritures", "expressions", "constantes"];

export type VarianteRationnel = FamilleNombre | "melange";

export interface LigneSimplification {
  latex: string;
  justification?: string;
}

export interface NombreClasse {
  famille: FamilleNombre;
  ensemble: EnsembleNb;
  /** Nombre tel qu'il est écrit dans l'énoncé (KaTeX). */
  latex: string;
  /** Simplification « comme au tableau » (première ligne : le nombre lui-même). */
  lignes: LigneSimplification[];
  /** Écriture simplifiée (KaTeX), reprise dans la réponse et le récapitulatif. */
  valeurL: string;
  /** Pourquoi c'est le plus petit ensemble (texte, résultat du corrigé). */
  raison: Frag[];
  /** Aide de niveau 2, posée pour CE nombre (jamais la réponse). */
  aide2: Frag[];
  /** Piège de ce nombre (corrigé, message après un choix faux). */
  piege: Frag[];
  /** Écriture « déguisée » (rationnel écrit avec une racine, un cosinus, une période…). */
  deguise: boolean;
  /** Identifiant du gabarit (anti-doublon dans un exercice, collecteur). */
  gabarit: string;
}

export interface ExerciceRationnel {
  variante: VarianteRationnel;
  nombres: NombreClasse[];
}

export type PhaseRationnel = "n0" | "n1" | "n2" | "n3";
export const PHASES_RATIONNEL: PhaseRationnel[] = ["n0", "n1", "n2", "n3"];
export const NOMS_NOMBRES = ["A", "B", "C", "D"];
