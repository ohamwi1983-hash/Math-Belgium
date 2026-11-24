/**
 * Couche core — `6gen163` « Détective d'erreurs : probabilités » (6e ch. 6, §§ 1 à 4, processus 3
 * TRANSFÉRER). Même mécanique que 6gen152 / 5gen72 / gen91 : un élève fictif a résolu un exercice du
 * chapitre en lignes numérotées ; UNE ligne est fausse et la suite en découle. Trois écrans : la ligne
 * fausse (choix fermé), l'erreur (4 descriptions, choix fermé), la correction (la probabilité juste,
 * trois tentatives).
 *
 * VARIANTE = TYPE D'ERREUR (le nom de la variante donne la réponse de l'écran 2 : groupe à verdict
 * `groupe_erreur`) : complémentaire de « au moins un » mal formulé, réunion sans retirer
 * l'intersection, conditionnelle inversée (on divise par P(A) au lieu de P(B)), produit comme si les
 * tirages étaient indépendants (sans remise traité avec remise), chemin d'arbre non multiplié (arbre
 * mal pondéré), ordre oublié (dénombrement ordonné / non ordonné : un seul des deux ordres compté).
 * « Quelle ligne ? » est aussi un verdict : 0 à 3 lignes justes (préliminaires puis début de la copie)
 * précèdent la ligne fausse, tiré 1/4 chacun EN DERNIER (`d.av`) — jamais dans `forme`.
 */

export type VarianteDetectiveProba = "complementaire" | "reunion" | "conditionnelleInversee" | "produitSansRemise" | "arbreMalPondere" | "ordreOublie";

export const VARIANTES_DETECTIVE_PROBA: VarianteDetectiveProba[] = ["complementaire", "reunion", "conditionnelleInversee", "produitSansRemise", "arbreMalPondere", "ordreOublie"];

export interface ExerciceDetectiveProba {
  variante: VarianteDetectiveProba;
  /** Paramètres entiers du scénario, dont `av` (lignes justes avant la ligne fausse, 0 à 3). */
  d: Record<string, number>;
  /** Les 4 descriptions de l'écran 2, dans l'ordre d'affichage (le `?code=` rouvre le même ordre). */
  options: string[];
}
