/**
 * gen119 — « Problèmes avec une fraction » (4e, chapitre 2, § 5 et § 7, processus 3 TRANSFÉRER).
 *
 * Toutes les situations se traduisent par une équation de la forme
 *   N/x + σ·N/(x + s) = p/q        (σ = ±1, N, s, p, q entiers, q > 0)
 * - `prix`     : T/x − T/(x + k) = d       (x = nombre d'objets achetés) ;
 * - `trajet`   : D/x + D/(x − w) = H       (x = vitesse à l'aller, retour w km/h moins vite) ;
 * - `robinets` : 1/x + 1/(x + k) = 1/T     (x = durée du plus rapide, seul).
 * `forme` : la question porte sur x lui-même (`directe`) ou sur une grandeur qui s'en DÉDUIT
 * (`deduite` : prix d'un objet, vitesse au retour, durée de l'autre robinet).
 */

export type VarianteProblemesFraction = "prix" | "trajet" | "robinets";
export type FormeProblemesFraction = "directe" | "deduite";

interface Base {
  variante: VarianteProblemesFraction;
  forme: FormeProblemesFraction;
  /** Indice du sous-contexte (prénom, objet, véhicule…) dans la liste de la variante. */
  contexte: number;
  /** Équation N/x + σ·N/(x + s) = p/q. */
  N: number;
  sigma: 1 | -1;
  s: number;
  p: number;
  q: number;
  /** Racine gardée et racine rejetée par le contexte. */
  solution: number;
  autre: number;
}

export interface ExercicePrix extends Base {
  variante: "prix";
  /** Somme dépensée (€), baisse de prix (€), objets en plus. */
  total: number;
  baisse: number;
  enPlus: number;
}

export interface ExerciceTrajet extends Base {
  variante: "trajet";
  distance: number;
  ecart: number;
  /** Durée totale en minutes. */
  dureeMinutes: number;
}

export interface ExerciceRobinets extends Base {
  variante: "robinets";
  ecart: number;
  /** Durée ensemble, dans l'unité du contexte (h ou min) — en minutes si l'unité est l'heure. */
  ensembleMinutes: number;
  unite: "h" | "min";
}

export type ExerciceProblemesFraction = ExercicePrix | ExerciceTrajet | ExerciceRobinets;
