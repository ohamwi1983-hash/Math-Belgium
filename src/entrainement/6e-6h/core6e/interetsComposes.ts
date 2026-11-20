/**
 * Couche core — `6gen151` « Intérêts composés et nombre e » (6e ch. 2, § 2, processus 3 TRANSFÉRER ;
 * lot G de l'audit). Le problème de Jacob Bernoulli (1683) : capitaliser plus souvent rapporte plus,
 * mais le capital reste borné — il tend vers K₀·e^{rt} (définition de e par (1 + 1/m)^m, cours § 2).
 * Aucun logarithme : seules les touches puissance et eˣ de la calculatrice servent.
 *
 * Décomposition du raisonnement (un écran par étape) :
 * 1. trois capitaux K₀(1 + r/n)^{nt} pour trois fréquences n (une par champ : taux par période r/n,
 *    n·t périodes) ;
 * 2. la limite quand n → +∞ : (1 + r/n)^{nt} = [(1 + 1/m)^m]^{rt} avec m = n/r, donc K₀·e^{rt} ;
 * 3. le taux annuel équivalent à la capitalisation continue : e^{r} − 1 (en %).
 *
 * Variantes : `bernoulli` (taux de 100 %, un an, capital en florins) et `placement` (taux réalistes,
 * plusieurs années, en euros).
 */

export type VarianteInteretsComposes = "bernoulli" | "placement";

export interface ExerciceInteretsComposes {
  variante: VarianteInteretsComposes;
  K0: number;
  /** Taux annuel en pour cent (100 pour Bernoulli). */
  tauxPourcent: number;
  t: number;
  /** Trois fréquences de capitalisation par an, croissantes (la dernière vaut 365). */
  frequences: [number, number, number];
  cleCollecteur: string;
}

export const tauxDecimal = (e: ExerciceInteretsComposes): number => e.tauxPourcent / 100;
export const capital = (e: ExerciceInteretsComposes, n: number): number => e.K0 * Math.pow(1 + tauxDecimal(e) / n, n * e.t);
export const capitalLimite = (e: ExerciceInteretsComposes): number => e.K0 * Math.exp(tauxDecimal(e) * e.t);
/** Taux annuel équivalent à la capitalisation continue, en pour cent. */
export const tauxEquivalent = (e: ExerciceInteretsComposes): number => 100 * (Math.exp(tauxDecimal(e)) - 1);
