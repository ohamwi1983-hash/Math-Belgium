import type { Signe, SigneTan } from "../core/cercleTrigonometrique.types";

/**
 * Cycle des cellules de l'écran "Signes" (correction 5, promptcorrectionsgenerateurcercletrigo1.md)
 * — sur le modèle des tableaux de signes déjà existants (`cycleValeurCellule.ts`, exercice 5), mais
 * avec une différence assumée et explicitement demandée : le cycle BOUCLE jusqu'à "?" (jamais un
 * état de départ à sens unique comme `cyclerValeurCellule`, qui ne revient jamais à "?"). sin/cos
 * cyclent sur 4 états (`∄` en est exclu, mathématiquement sans sens pour ces deux lignes) ; tan
 * cycle sur 5 états.
 */
export type EtatCelluleSigne = "?" | Signe;
export type EtatCelluleTan = "?" | SigneTan;

export function cyclerSigneSinCos(actuel: EtatCelluleSigne): EtatCelluleSigne {
  switch (actuel) {
    case "?":
      return "+";
    case "+":
      return "-";
    case "-":
      return "0";
    case "0":
      return "?";
  }
}

export function cyclerSigneTan(actuel: EtatCelluleTan): EtatCelluleTan {
  switch (actuel) {
    case "?":
      return "+";
    case "+":
      return "-";
    case "-":
      return "0";
    case "0":
      return "indefini";
    case "indefini":
      return "?";
  }
}

/**
 * Marquage rouge en direct après un échec — même principe que `celluleEstErronee` (exercice 5) :
 * une cellule encore à "?" n'est jamais marquée erronée (rien à comparer, l'élève n'a simplement
 * pas encore répondu), seule une valeur définie mais fausse l'est.
 */
export function celluleSigneErronee(saisie: EtatCelluleSigne | EtatCelluleTan, attendu: Signe | SigneTan): boolean {
  return saisie !== "?" && saisie !== attendu;
}
