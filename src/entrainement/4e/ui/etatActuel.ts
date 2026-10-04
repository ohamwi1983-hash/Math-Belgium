import type { EtatSession } from "../moteur";
import { formatEnonceAffichage, formatEnonceLatex, formatEquationIsoleeNonDeveloppee } from "./formatEquation";

/**
 * "État actuel de l'expression" (prompt-corrections-moteur-partage.md, point 1) — pour un
 * générateur à une seule expression (exercice 1), la dernière forme confirmée, remplacée à
 * chaque nouvelle étape plutôt qu'accumulée : null tant que rien n'est confirmé, l'équation
 * réduite une fois la simplification confirmée (voir necessiteSimplification), puis la forme
 * isolée une fois l'isolement confirmé (encore groupée mais non développée, voir
 * formatEquationIsoleeNonDeveloppee), puis pleinement développée une fois l'étape "developper"
 * confirmée (cas_general/produit_remarquable + produit_egale_constante uniquement — voir
 * moteur/session.ts::necessiteDeveloppement), puis la forme factorisée une fois que champ1 l'est
 * (Δ seul pour cas_general, qui ne transforme pas l'expression — cette catégorie n'a plus d'étape
 * de factorisation séparée depuis prompt-generateurs123groupe.md, point 3). Même principe que
 * calculerRecapitulatif : dérivé uniquement des scores déjà trackés par le moteur, jamais de la
 * saisie de l'élève.
 *
 * Bug utilisateur du 26/09 : après confirmation de la simplification, cet état affichait à tort
 * `formatEnonceLatex` (toujours la forme canonique "ax²+bx+c=0"), alors que l'équation réellement
 * confirmée par l'élève garde la `formeAffichage` d'origine (ex. "x²=-11x-30" pour une forme
 * isolee_carre) — l'isolement, qui convertit vers "=0", est justement l'étape SUIVANTE, pas encore
 * franchie à ce stade. `formatEnonceAffichage` restitue la vraie forme confirmée.
 */
export function calculerEtatActuel(etat: EtatSession): string | null {
  const exercice = etat.exerciceCourant;

  if (etat.scoreChampPrincipalExercice !== null && exercice.categorie !== "cas_general") {
    return `${exercice.solution.formeFactorisee} = 0`;
  }

  if (etat.scoreDevelopperExercice !== null) {
    return formatEnonceLatex(exercice.enonce);
  }

  if (etat.scoreIsolementExercice !== null) {
    return formatEquationIsoleeNonDeveloppee(exercice);
  }

  if (etat.scoreSimplificationExercice !== null) {
    return formatEnonceAffichage(exercice.enonce, exercice.formeAffichage, exercice.parametresAffichage, exercice.irrationnel);
  }

  return null;
}
