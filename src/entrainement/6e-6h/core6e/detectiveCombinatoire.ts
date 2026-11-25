/**
 * Couche core — `6gen109` « Détective d'erreurs : analyse combinatoire » (6e ch. 7, fin du chapitre,
 * processus 3 TRANSFÉRER). Même mécanique que 6gen163 / 6gen152 / 5gen72 : un élève fictif a résolu un
 * exercice du chapitre en lignes numérotées ; UNE ligne est fausse et la suite en découle. Trois
 * écrans : la ligne fausse (choix fermé), l'erreur (4 descriptions, choix fermé), la correction (le
 * nombre ou la probabilité juste, trois tentatives).
 *
 * VARIANTE = TYPE D'ERREUR (le nom de la variante donne la réponse de l'écran 2 : groupe à verdict
 * `groupe_erreur`) : ordre compté ou oublié (A = C · k! mal utilisé), « / 2 » du collier oublié,
 * Cₙᵏ au dénominateur d'une probabilité hypergéométrique (au lieu de C_Nⁿ), exposants inversés (k^n
 * pour nᵏ, ou p et 1 − p échangés dans la loi binomiale), « − 1 » oublié (le mot lui-même, la partie
 * vide), lettres répétées non divisées (n! au lieu de n!/(a!·b!…)).
 * « Quelle ligne ? » est aussi un verdict : 0 à 3 lignes justes (préliminaires) précèdent la ligne
 * fausse, tiré 1/4 chacun EN DERNIER (`d.av`) — jamais dans `forme`.
 */

export type VarianteDetectiveCombi = "ordre" | "collier" | "denominateur" | "exposants" | "moinsUn" | "repetitions";

export const VARIANTES_DETECTIVE_COMBI: VarianteDetectiveCombi[] = ["ordre", "collier", "denominateur", "exposants", "moinsUn", "repetitions"];

export interface ExerciceDetectiveCombi {
  variante: VarianteDetectiveCombi;
  /** Paramètres entiers du scénario (dont `ctx`, `mot` = indice du mot, `av` = lignes justes avant la
   * ligne fausse, 0 à 3). */
  d: Record<string, number>;
  /** Les 4 descriptions de l'écran 2, dans l'ordre d'affichage. */
  options: string[];
}

/** Mots réels à lettres répétées (anagrammes) : mot, puis multiplicités des lettres répétées. */
export const MOTS: { mot: string; rep: [string, number][] }[] = [
  { mot: "ANANAS", rep: [["A", 3], ["N", 2]] },
  { mot: "BANANE", rep: [["A", 2], ["N", 2]] },
  { mot: "CERISE", rep: [["E", 2]] },
  { mot: "POMME", rep: [["M", 2]] },
  { mot: "KIWI", rep: [["I", 2]] },
  { mot: "RADAR", rep: [["R", 2], ["A", 2]] },
  { mot: "PAPAYE", rep: [["P", 2], ["A", 2]] },
  { mot: "TOMATE", rep: [["T", 2]] },
  { mot: "COCOTTE", rep: [["C", 2], ["O", 2], ["T", 2]] },
  { mot: "ELLIPSE", rep: [["E", 2], ["L", 2]] },
];
