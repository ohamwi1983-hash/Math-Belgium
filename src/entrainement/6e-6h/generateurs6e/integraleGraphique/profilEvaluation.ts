import type { ProfilInstance } from "../../../export/genererFeuilleExercices";
import type { ExerciceIntegraleGraphique } from "../../core6e/integraleGraphique.types";
import { nombreIntervallesSigne } from "./index";

/**
 * Profil de tirage équilibré de `6gen77` « L'intégrale lue sur un graphique » (`.claude/rules/
 * feuilles-evaluations.md`, « Tirage équilibré des évaluations »).
 *
 * - Aucun cas particulier : chaque instance demande toutes les étapes (découpe, aires signées,
 *   somme ; ou lecture, additivité, bornes inversées). Une courbe sans partie sous l'axe n'existe pas
 *   en `calcul`/`aireIntegrale` (les deux signes sont toujours présents).
 * - `forme` = variante + portion de disque (aucune, demi, quart) + nombre de morceaux (`calcul`,
 *   `proprietes`) ou d'intervalles de signe constant (`aireIntegrale`) : la série A fixe cette
 *   signature, les autres séries la reproduisent avec une autre courbe. Le générateur tire la forme
 *   uniformément AVANT la courbe : chaque forme a une fréquence ≥ 1/9 dans sa variante (mesures dans
 *   le rapport), loin du seuil de la recherche de graine (20 000 essais).
 * - `calcul` absent : toutes les valeurs sont exactes (fractions, multiples de π), jamais de
 *   calculatrice.
 */
export function profilIntegraleGraphique(e: ExerciceIntegraleGraphique): ProfilInstance {
  const n = e.variante === "aireIntegrale" ? nombreIntervallesSigne(e.morceaux) : e.morceaux.length;
  return { casParticulier: null, forme: `${e.variante}-${e.disque}-${n}` };
}
