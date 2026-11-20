import type { ExerciceFonctionsCyclometriques } from "../core6e/fonctionsCyclometriques.types";
import type { StatutVerification } from "../moteur/statutVerification";
import { evaluerValeurCyclometrique } from "./expressionCyclometrique";

/**
 * Couche B (6e) — vérification pour `6gen2` (REFONTE TOTALE). Le contrat unifié
 * `existe`/`valeurLatex`/`valeurNumerique` (identique sur les 3 variantes, voir
 * `core6e/fonctionsCyclometriques.types.ts`) permet UNE SEULE fonction de vérification.
 */

/** Une valeur EXACTE évaluée (π/3, √3/2, −1/2, 0,5) coïncide avec la valeur attendue à 1e-9 près. */
const TOLERANCE = 1e-9;

/**
 * « Donne sa valeur exacte » (consigne, audit du 6e ch. 1, E5) : une fonction trigonométrique ou
 * cyclométrique recopiée (« arccos(1/2) ») n'est pas une valeur calculée, et une écriture décimale
 * n'est exacte que si elle ÉGALE la valeur (« 0,5 » pour 1/2) — « 1,047 » pour π/3 est une valeur
 * approchée. L'écran signale ces deux cas SANS tentative (`RetourSaisieCyclo`) ; le moteur les juge
 * faux par sécurité.
 */
export function estFormeExacte(texte: string): boolean {
  return !/(arc|a)?(sin|cos|tan)/i.test(texte);
}

/** "N'existe pas" est une réponse correcte À PART ENTIÈRE quand `exercice.existe===false`. */
export interface ReponseFonctionsCyclometriques {
  existe: boolean;
  /** ignoré si `existe===false`. */
  texte: string | null;
}

export function verifierReponseFonctionsCyclometriques(exercice: ExerciceFonctionsCyclometriques, reponse: ReponseFonctionsCyclometriques): boolean {
  if (reponse.existe !== exercice.existe) return false;
  if (!exercice.existe) return true;
  if (reponse.texte === null) return false;
  return diagnostiquerValeurFonctionsCyclometriques(exercice, reponse.texte) === "correct";
}

/** Statut à 3 valeurs du champ « valeur » (appelé seulement quand l'élève a choisi « Existe »). */
export function diagnostiquerValeurFonctionsCyclometriques(exercice: ExerciceFonctionsCyclometriques, texte: string): StatutVerification {
  const v = evaluerValeurCyclometrique(texte);
  if (v === null) return "parse_error";
  if (!exercice.existe) return "not_equivalent";
  const attendu = exercice.valeurNumerique as number;
  return estFormeExacte(texte) && Math.abs(v - attendu) <= TOLERANCE * Math.max(1, Math.abs(attendu)) ? "correct" : "not_equivalent";
}
