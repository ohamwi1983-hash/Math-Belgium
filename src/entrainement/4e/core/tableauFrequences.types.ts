/**
 * Contrat — "Tableau de fréquences", trentième générateur du projet, premier du chapitre 5
 * ("Statistiques") — voir `promptcreationgenerateur30tableaufrequences.md`. À partir d'une liste
 * brute de valeurs numériques discrètes, construire un tableau de fréquences : valeur distincte /
 * effectif / fréquence (%) / effectif cumulé.
 *
 * **Aucun catalogue de variantes** (convention CLAUDE.md, "Catalogue de variantes...") : la variété
 * vient uniquement des valeurs numériques tirées (n, valeurs distinctes, effectifs), jamais d'un
 * axe de technique/méthode discret — même exemption que "Caractéristiques d'une fonction" ou
 * "Comparaison visuelle de vecteurs sur figure".
 *
 * **Exactitude par construction, jamais de tolérance nécessaire pour arrondir un pourcentage
 * périodique** : `n` (la taille de l'échantillon, `donneesBrutes.length`) est toujours choisi de
 * la forme `2^a·5^b` (voir `generateurs/tableauFrequences/index.ts::CANDIDATS_N`) — un dénominateur
 * dont les seuls facteurs premiers sont 2 et 5 garantit que `effectif/n` a TOUJOURS une écriture
 * décimale finie (jamais périodique), quel que soit l'effectif entier tiré. `frequencePourcent`
 * est donc toujours une valeur exacte en base 10 (ex. `6.25`, jamais `6.666...`), vérifiable par
 * égalité (à une tolérance flottante minime près, jamais la tolérance large `0,005` utilisée
 * ailleurs dans le projet pour des racines/rapports irrationnels).
 */
import type { ContexteBienaymeTchebychev } from "./bienaymeTchebychev.types";

export interface LigneFrequence {
  /** Valeur distincte de la liste brute — les lignes sont toujours triées par valeur croissante. */
  valeur: number;
  /** Nombre d'occurrences de `valeur` dans `donneesBrutes`. */
  effectif: number;
  /** `effectif/n*100`, toujours une décimale exacte par construction (voir ci-dessus). */
  frequencePourcent: number;
  /** Somme courante des effectifs jusqu'à cette ligne incluse — la dernière ligne vaut toujours `n`. */
  effectifCumule: number;
  /** `effectifCumule/n*100` — toujours une décimale exacte par construction (même preuve que
   * `frequencePourcent`, `effectifCumule` étant lui-même toujours un entier) ; la dernière ligne
   * vaut donc toujours exactement 100 (`promptameliorationsgenerateur30.md`, point 5). Calculée
   * directement depuis `effectifCumule`, jamais par somme cumulative de `frequencePourcent` — un
   * seul chemin de calcul, mathématiquement équivalent mais plus robuste numériquement. */
  frequenceCumulee: number;
}

export interface ExerciceTableauFrequences {
  /** Banque de contextes narratifs déjà intégrée pour "Inégalité de Bienaymé-Tchebychev"
   * (`generateurs/bienaymeTchebychev/contextes.ts`), réutilisée telle quelle — jamais une seconde
   * banque dupliquée pour ce générateur (`promptgen303132contexte.md`). Habille la liste brute
   * d'une narration (population + caractère mesuré + unité), sans jamais changer la mécanique de
   * génération/vérification des 4 écrans. */
  contexte: ContexteBienaymeTchebychev;
  /** Liste brute, `n` valeurs, mélangée (Fisher-Yates) — jamais déjà triée. */
  donneesBrutes: number[];
  /** `donneesBrutes.length` — toujours de la forme `2^a·5^b` (voir ci-dessus). */
  n: number;
  /** Table de référence complète, triée par valeur croissante — seule source de vérité. */
  lignes: LigneFrequence[];
}

export type GenerateurExerciceTableauFrequences = () => ExerciceTableauFrequences;
