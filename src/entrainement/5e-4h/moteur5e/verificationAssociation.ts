/**
 * Couche B (5e) — vérification pour 5gen25 ("Association graphique/mots ↔ signe de f'/f''").
 * N'importe jamais rien de `src/generateurs5e/`.
 */
import { reponseCorrecteAssociation } from "../core5e/association.types";

/** Réponse possible à une ligne — `"aucune"` (5gen25, famille A avancée, `prompt5gen25varianteavanceerichessegraphique.md`)
 * représente "f' n'existe pas ici" ; absente des 3 familles historiques (jamais produite tant que
 * `optionSupplementaire` n'est pas fourni à `ComposantAssociation`). */
export type ChoixLigneAssociation = number | "aucune" | null;

/** Une ligne (un élément numéroté) est correcte si le choix EST la réponse correcte — `null` (rien
 * choisi) est toujours incorrect, jamais un état "neutre". `singulier` absent ⟹ comportement
 * inchangé pour les 3 familles historiques (toujours une lettre). */
export function verifierLigne(ordreLettres: number[], indexItem: number, choix: ChoixLigneAssociation, singulier?: boolean[]): boolean {
  return choix !== null && choix === reponseCorrecteAssociation(ordreLettres, singulier, indexItem);
}

/** Diagnostic PAR LIGNE — un booléen par élément numéroté, jamais un seul booléen global (chaque
 * dropdown se surligne indépendamment après une tentative ratée). */
export function diagnostiquerLignes(ordreLettres: number[], choixParItem: ChoixLigneAssociation[], singulier?: boolean[]): boolean[] {
  return choixParItem.map((choix, i) => verifierLigne(ordreLettres, i, choix, singulier));
}

/** L'exercice entier est réussi seulement si TOUTES les lignes sont correctes — une seule étape de
 * tentatives pour l'écran unique, même convention que tout autre écran multi-champs de la
 * plateforme (un échec partiel reste un échec de la tentative). */
export function verifierAssociationComplete(ordreLettres: number[], choixParItem: ChoixLigneAssociation[], singulier?: boolean[]): boolean {
  return diagnostiquerLignes(ordreLettres, choixParItem, singulier).every(Boolean);
}
