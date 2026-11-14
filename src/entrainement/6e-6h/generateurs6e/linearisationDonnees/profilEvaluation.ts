import type { ProfilInstance } from "../../../export/genererFeuilleExercices";
import type { ExerciceLinearisation } from "../../core6e/linearisationDonnees";

/**
 * Profil de tirage équilibré de `6gen89` « Linéariser des données »
 * (`.claude/rules/feuilles-evaluations.md`, « Tirage équilibré des évaluations »).
 *
 * - Aucun cas particulier : chaque instance a toutes ses étapes (rien ne raccourcit la résolution),
 *   et la représentation à choisir (variante `choisir`) est un VERDICT — elle n'entre ni dans le cas
 *   particulier ni dans `forme`, et reste tirée au hasard (une fois sur trois chacune) dans chaque
 *   série.
 * - `forme` = variante + type de prévision : `semilog:valeur`, `semilog:seuil`, `loglog:valeur`,
 *   `loglog:seuil` (une prévision « seuil » demande de résoudre une équation exponentielle ou
 *   puissance) ; `choisir` (prévision toujours directe). Le contexte n'y entre pas : la démarche est
 *   la même d'un contexte à l'autre. Fréquences mesurées (5 000 tirages par variante) : chaque forme
 *   ≈ 50 % de sa variante — introuvable jamais.
 * - `calcul` : toujours `calculatrice` (logarithmes de mesures, exponentielles) ; toutes les
 *   variantes exigent la calculatrice (`calculatriceIndispensable: true` dans l'adaptateur).
 */
export function profilLinearisation(e: ExerciceLinearisation): ProfilInstance {
  return { casParticulier: null, calcul: "calculatrice", forme: e.variante === "choisir" ? "choisir" : `${e.variante}:${e.typePrevision}` };
}
