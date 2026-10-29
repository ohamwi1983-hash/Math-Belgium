import type { Signe, SigneTan, ValeurAxe, ValeurAxeTan } from "../core/cercleTrigonometrique.types";

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

/** Écran « valeurs exactes » des angles sur un axe (décision E1) — même principe de cycle avec
 * retour à "?" : sin/cos sur 1, −1, 0 ; tan ajoute « n'existe pas ». */
export type EtatCelluleValeurAxe = "?" | ValeurAxe;
export type EtatCelluleValeurAxeTan = "?" | ValeurAxeTan;

export function cyclerValeurAxe(actuel: EtatCelluleValeurAxe): EtatCelluleValeurAxe {
  switch (actuel) {
    case "?":
      return "1";
    case "1":
      return "-1";
    case "-1":
      return "0";
    case "0":
      return "?";
  }
}

export function cyclerValeurAxeTan(actuel: EtatCelluleValeurAxeTan): EtatCelluleValeurAxeTan {
  switch (actuel) {
    case "?":
      return "1";
    case "1":
      return "-1";
    case "-1":
      return "0";
    case "0":
      return "indefini";
    case "indefini":
      return "?";
  }
}

export function libelleValeurAxe(valeur: EtatCelluleValeurAxe | EtatCelluleValeurAxeTan): string {
  return valeur === "-1" ? "−1" : valeur === "indefini" ? "∄" : valeur;
}
