/**
 * Couche core — `6gen131` « Détective d'erreurs : lieux, droites et cercles » (6e ch. 9, fin du chapitre,
 * processus 3 TRANSFÉRER). Même mécanique que 6gen99 / 6gen109 / 6gen122 : un élève fictif a résolu un
 * exercice du chapitre en lignes numérotées ; UNE ligne est fausse et la suite en découle. Trois écrans :
 * la ligne fausse (choix fermé), l'erreur (4 descriptions, choix fermé), la correction (champ, trois
 * tentatives : points, nombre exact ou équation selon l'exercice).
 *
 * VARIANTE = TYPE D'ERREUR (groupe à verdict `groupe_erreur`) : sommets du losange pris en (p ± k ; q ± k),
 * théorème de la médiane sans le « / 2 », division par 1 − k pour k = 1 (Apollonius), centre lu sans
 * diviser par m, incentre pris comme moyenne simple, une seule solution d'aire (valeur absolue oubliée),
 * tangente verticale oubliée, restriction oubliée (Thalès). « Quelle ligne ? » est aussi un verdict : 0 à
 * 3 lignes justes (préliminaires) précèdent la ligne fausse, tiré EN DERNIER (`d.av`), jamais dans `forme`.
 */

export type VarianteDL = "losange" | "mediane" | "apollonius" | "centreM" | "incentre" | "aire" | "tangente" | "restriction";

export const VARIANTES_DL: VarianteDL[] = ["losange", "mediane", "apollonius", "centreM", "incentre", "aire", "tangente", "restriction"];

export type PhaseDL = "ligne" | "erreur" | "correction";
export const PHASES_DL: PhaseDL[] = ["ligne", "erreur", "correction"];

export interface ExerciceDL {
  variante: VarianteDL;
  /** Paramètres entiers du scénario (`av` = lignes justes avant la ligne fausse, 0 à 3). */
  d: Record<string, number>;
  /** Les 4 descriptions de l'écran 2, dans l'ordre d'affichage. */
  options: string[];
}

/** Nature de la valeur corrigée (écran 3). */
export type TypeCorrectionDL = "points" | "nombre" | "equation";
