/**
 * `56gen15` — « Démontrer qu'un nombre est irrationnel » (5e (6h), « Nombres réels et suites »,
 * étape 1 « irrationnels », processus 2 APPLIQUER). La démonstration du cours (√2, √p, ∛7) guidée en
 * cinq écrans pour ᵏ√N : supposer ᵏ√N = m/n, élever (mᵏ = N·nᵏ), décomposer N en facteurs premiers,
 * comparer les exposants (multiples de k dans mᵏ), conclure. Le verdict « irrationnel » / « naturel »
 * (N puissance k-ième parfaite) est tiré à parts égales AVANT N ; les cinq écrans sont les mêmes dans
 * les deux cas (niveau et durée constants).
 */

export type VarianteIrrationalite = "carree" | "grande" | "cubique";
export type VerdictIrrationalite = "irrationnel" | "naturel";

export interface ExerciceIrrationalite {
  variante: VarianteIrrationalite;
  /** Indice de la racine : 2 (carrée) ou 3 (cubique). */
  k: 2 | 3;
  N: number;
  verdict: VerdictIrrationalite;
  /** Décomposition de N, bases croissantes. */
  facteurs: [number, number][];
  /** ᵏ√N quand le verdict est « naturel ». */
  racine: number | null;
  /** Plus petit premier dont l'exposant n'est pas multiple de k (verdict « irrationnel »). */
  premierTemoin: number | null;
}

export type PhaseIrrationalite = "hypothese" | "elever" | "facteurs" | "exposants" | "conclusion";
export const PHASES_IRRATIONALITE: PhaseIrrationalite[] = ["hypothese", "elever", "facteurs", "exposants", "conclusion"];
