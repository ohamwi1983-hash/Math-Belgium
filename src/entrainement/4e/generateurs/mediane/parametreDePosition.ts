/**
 * Couche A — calcul d'UN paramètre de position (médiane, Q1, Q3) pour "Paramètres de position"
 * (gen33), isolé dans ce module dédié (`promptgen33refactoringquartiles.md`) pour que l'ajout
 * éventuel d'une autre convention de calcul (ex. méthode de Tukey, interpolation type Excel) se
 * fasse plus tard en ajoutant une seule branche `methode` ici, sans toucher au reste du générateur.
 *
 * **Refactoring interne pur — aucun changement de comportement.** La seule convention active reste
 * celle déjà en place : le premier élément (ligne discrète ou classe) dont l'effectif cumulé v_i
 * dépasse STRICTEMENT le seuil demandé — jamais `>=` — sans interpolation pour une table discrète
 * (la valeur x_i exacte de cet élément), avec interpolation linéaire sur le polygone des effectifs
 * cumulés pour des classes (`L + ((seuil-CFavant)/fClasse)·amplitude`). Remplace `indexMedianeDepuisCumules`/
 * `interpolerSeuil`, jusque-là dispersées dans `index.ts` et appelées indépendamment pour la
 * médiane/Q1/Q3 des deux variantes.
 *
 * **Amplitude PAR CLASSE, jamais un scalaire commun** (`promptgen32gen33corrections.md`, point 1 —
 * les classes n'ont plus toujours la même largeur) : l'amplitude utilisée dans la formule
 * d'interpolation est désormais celle de la classe RETENUE elle-même (`classe.borneSup -
 * classe.borneInf`), jamais un `amplitude` global qui supposerait toutes les classes identiques —
 * `DonneesPositionClasses` ne porte donc plus ce champ.
 */
import type { ClasseMediane } from "../../core/mediane.types";

/** Convention de calcul, actuellement figée sur la seule valeur en place — aucune autre méthode
 * n'est implémentée, `calculerParametreDePosition` lève si `methode` diffère de cette valeur. */
export type MethodeParametreDePosition = "seuilStrict";

/** Table discrète — `valeurs`/`cumules` de même longueur et dans le même ordre (les x_i triés
 * croissant et leurs effectifs cumulés v_i correspondants). */
export interface DonneesPositionDiscrete {
  type: "discrete";
  valeurs: number[];
  cumules: number[];
}

/** Classes groupées, amplitude possiblement DIFFÉRENTE d'une classe à l'autre — mêmes classes que
 * `core/mediane.types.ts::ClasseMediane`, l'amplitude de chacune se déduisant directement de
 * `borneSup-borneInf`, jamais un champ scalaire séparé. */
export interface DonneesPositionClasses {
  type: "classes";
  classes: ClasseMediane[];
}

export type DonneesParametreDePosition = DonneesPositionDiscrete | DonneesPositionClasses;

export interface ParametreDePosition {
  /** Index (dans `valeurs`/`cumules` ou dans `classes`) de l'élément retenu par la convention. */
  index: number;
  /** Valeur du paramètre de position — exacte pour une table discrète, interpolée pour des classes.
   * Jamais arrondie ici : un éventuel arrondi (ex. `arrondi1`, gen33) reste la responsabilité de
   * l'appelant, propre à son propre contrat. */
  valeur: number;
}

/** Calcule un paramètre de position (médiane si `seuil=n/2`, Q1 si `seuil=n/4`, Q3 si
 * `seuil=3n/4`...) à partir de `donnees` et du `seuil` demandé, selon `methode` (par défaut, et
 * pour l'instant seule valeur possible, `"seuilStrict"`). */
export function calculerParametreDePosition(donnees: DonneesParametreDePosition, seuil: number, methode: MethodeParametreDePosition = "seuilStrict"): ParametreDePosition {
  if (methode !== "seuilStrict") {
    throw new Error(`calculerParametreDePosition : méthode "${methode}" non implémentée`);
  }

  if (donnees.type === "discrete") {
    const index = donnees.cumules.findIndex((v) => v > seuil);
    return { index, valeur: donnees.valeurs[index] };
  }

  const index = donnees.classes.findIndex((c) => c.effectifCumule > seuil);
  const classe = donnees.classes[index];
  const cumuleAvant = index === 0 ? 0 : donnees.classes[index - 1].effectifCumule;
  const amplitudeClasse = classe.borneSup - classe.borneInf;
  const valeur = classe.borneInf + ((seuil - cumuleAvant) / classe.effectif) * amplitudeClasse;
  return { index, valeur };
}
