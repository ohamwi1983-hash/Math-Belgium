/**
 * Contrat — "Comparaison de deux séries statistiques", trente-huitième générateur du projet,
 * huitième et dernier du chapitre 5 ("Statistiques") — voir `promptgencomparaisonseriescreation.md`.
 *
 * Présente TOUJOURS deux séries A et B, portant sur le MÊME contexte + caractère (banque déjà
 * partagée pour "Inégalité de Bienaymé-Tchebychev", `generateurs/bienaymeTchebychev/contextes.ts`,
 * import générateur→générateur, explicitement autorisé — même principe que "Boîte à moustaches"/
 * "Médiane"/"Moyenne pondérée"), avec des données numériques différentes.
 *
 * **Un seul tableau x_i/n_i canonique par série, généré et calculé une fois pour toutes,
 * indépendamment de la variante affichée** — jamais trois chemins de construction distincts pour
 * les 3 variantes. C'est ce qui permet à la question "seuil" (variante 1 ou 3) de rester exacte
 * sur un vrai tableau sous-jacent, et à la variante "recapitulatif" de montrer des x̄/σ/quartiles
 * réellement cohérents avec un tableau qui, lui, n'est jamais affiché à l'élève dans cette
 * variante — seule la PRÉSENTATION change selon `variante`, jamais les données elles-mêmes :
 * - `"tableaux"` (V1) : les 2 tableaux x_i/n_i bruts sont affichés, jamais $\bar{x}$/σ/médiane/
 *   quartiles (déjà couverts par "Moyenne pondérée"/"Médiane" — cette variante teste la lecture
 *   comparative sur un tableau, jamais le calcul).
 * - `"recapitulatif"` (V2) : seul le résumé calculé (`SerieComparaison` moins les `lignes`) est
 *   affiché, jamais le tableau brut — lecture/comparaison/interprétation uniquement.
 * - `"graphique"` (V3) : les 2 courbes cumulées (effectif OU fréquence cumulée, `cumul`) sont
 *   affichées sur un même graphe Mafs, jamais le tableau brut ni le résumé chiffré — lecture
 *   graphique uniquement (réutilise l'approche de rendu polygonal déjà établie par "Paramètres de
 *   position"/gen33 pour ses courbes cumulées).
 *
 * **Une seule question tirée par génération** (pas de séquence de sous-questions) — le type est
 * tiré aléatoirement parmi ceux compatibles avec la variante active (`TYPES_COMPATIBLES`,
 * `generateurs/comparaisonSeries/index.ts`) :
 *
 * | Type            | V1 | V2 | V3 |
 * |-----------------|----|----|----|
 * | centrage        | ❌ | ✅ | ✅ |
 * | dispersion      | ❌ | ✅ | ✅ |
 * | seuil           | ✅ | ❌ | ✅ |
 * | interpretation  | ✅ | ✅ | ✅ |
 *
 * **Contraintes de génération, garanties par construction (retry loop), jamais un cas ambigu
 * laissé au hasard** : médianes des 2 séries toujours distinctes ; écart-type ET écart
 * interquartile pointent TOUJOURS vers la même série comme "la plus homogène" (jamais de cas
 * contradictoire — explicitement hors périmètre de cette version, voir le prompt de création).
 */
import type { ContexteBienaymeTchebychev } from "./bienaymeTchebychev.types";

export type VarianteComparaisonSeries = "tableaux" | "recapitulatif" | "graphique";

/** Type de courbe cumulée affichée (variante "graphique" uniquement) — tiré une fois par exercice,
 * partagé par les 2 séries (jamais une série en effectif et l'autre en fréquence, ce qui rendrait
 * la comparaison visuelle incohérente). */
export type CumulComparaisonSeries = "effectif" | "frequence";

export interface LigneComparaisonSeries {
  valeur: number;
  effectif: number;
  /** Effectif cumulé jusqu'à et y compris cette ligne (table triée croissant). */
  effectifCumule: number;
  /** = effectifCumule / n × 100 — TOUJOURS un entier exact (`n` toujours un diviseur de 100, voir
   * le générateur), jamais une valeur arrondie approximativement. */
  frequenceCumulee: number;
}

/** Résumé statistique complet d'une série — calculé une seule fois à la génération, source unique
 * de vérité pour les 3 variantes (seule la présentation choisit ce qu'elle en montre). $\bar{x}$/σ
 * sont arrondis à 2 décimales (σ en cascade à partir de la variance déjà arrondie, même principe
 * que "Paramètres de dispersion"/gen34) ; min/Q1/médiane/Q3/max sont TOUJOURS des valeurs `x_i`
 * EXACTES de la table (règle en cascade `v_i > seuil`, jamais interpolées — même principe que
 * "Étendue et écart interquartile"/gen35, dupliqué). */
export interface SerieComparaison {
  lignes: LigneComparaisonSeries[];
  n: number;
  xBar: number;
  variance: number;
  sigma: number;
  min: number;
  q1: number;
  mediane: number;
  q3: number;
  max: number;
  ecartInterquartile: number;
}

export type TypeQuestionComparaisonSeries = "centrage" | "dispersion" | "seuil" | "interpretation";

export interface QuestionCentrage {
  type: "centrage";
  medianePlusGrande: "A" | "B";
}

/** Les 2 seuls arguments statistiquement VALABLES pour justifier l'homogénéité — jamais "étendue"
 * (piège, voir `ArgumentDispersionOption` côté Couche B). Puisque la génération garantit que σ ET
 * l'écart interquartile pointent tous deux vers la même série, les deux valent TOUJOURS comme
 * argument valide, indépendamment de `nombreArguments`. */
export type ArgumentDispersionComparaison = "ecartType" | "ecartInterquartile";

export interface QuestionDispersion {
  type: "dispersion";
  serieHomogene: "A" | "B";
  /** N — nombre d'arguments demandés, tiré à 1 ou 2. */
  nombreArguments: 1 | 2;
}

/** "Combien d'individus de la série [serie] ont une valeur {≤ lignes[indexHaut].valeur si
 * indexBas===null | dans ]lignes[indexBas].valeur ; lignes[indexHaut].valeur] sinon} ?" — les deux
 * bornes sont TOUJOURS de vraies valeurs `x_i` de la série choisie (jamais un seuil arbitraire
 * hors-table), donc `reponseAttendue` est toujours un effectif cumulé exact — ou une fréquence
 * cumulée exacte (`estFrequence`, uniquement possible pour la variante "graphique" quand
 * `cumul==="frequence"`, jamais pour la variante "tableaux" qui n'affiche aucune fréquence). */
export interface QuestionSeuil {
  type: "seuil";
  serie: "A" | "B";
  indexBas: number | null;
  indexHaut: number;
  estFrequence: boolean;
  reponseAttendue: number;
}

/** Une phrase de profil (dérivée de la position relative médiane/dispersion de la série décrite,
 * voir `formatProfilTexte`) décrit une seule des deux séries — l'élève associe le profil à la
 * bonne série. */
export interface QuestionInterpretation {
  type: "interpretation";
  serieDecrite: "A" | "B";
}

export type QuestionComparaisonSeries = QuestionCentrage | QuestionDispersion | QuestionSeuil | QuestionInterpretation;

export interface ExerciceComparaisonSeries {
  variante: VarianteComparaisonSeries;
  contexte: ContexteBienaymeTchebychev;
  serieA: SerieComparaison;
  serieB: SerieComparaison;
  /** Non-`null` uniquement si `variante === "graphique"`. */
  cumul: CumulComparaisonSeries | null;
  question: QuestionComparaisonSeries;
}

export type GenerateurExerciceComparaisonSeries = () => ExerciceComparaisonSeries;
