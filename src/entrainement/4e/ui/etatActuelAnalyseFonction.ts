import type { EtatSessionAnalyseFonction } from "../moteur/typesAnalyseFonction";

/**
 * "État actuel de l'expression" pour l'écran "racines" (point 3, prompt-4-modifications-analyse-
 * fonction.md) — même principe que src/ui/etatActuel.ts (exercice 1) : dérivé uniquement des
 * scores déjà trackés par le moteur, jamais de la saisie de l'élève. La reconnaissance seule ne
 * transforme rien (choix de méthode, pas de factorisation) ; l'équation ne devient "état actuel"
 * qu'une fois champ1 (factorisation) confirmé — categorie n'est jamais cas_general ici, donc
 * jamais l'étape "Factorisation après Δ" à prendre en compte, contrairement à l'exercice 1.
 */
export function calculerEtatActuelAnalyseFonctionRacines(etat: EtatSessionAnalyseFonction): string | null {
  if (etat.scoreRacinesChamp1Exercice !== null) {
    return `${etat.exerciceCourant.exercice.solution.formeFactorisee} = 0`;
  }
  return null;
}
