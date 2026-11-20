/**
 * Profils d'instance (tirage équilibré des évaluations, `AdaptateurFeuilleExercices.profilInstance`)
 * des générateurs du chapitre 2 de 6e (« Fonctions exponentielles », 6gen6–6gen12) — lot E de
 * l'audit. Règles : `.claude/rules/feuilles-evaluations.md`, section « Tirage équilibré ».
 *
 * - `forme` = type de question, reproduit d'une série à l'autre : toujours la famille (une ligne
 *   « libre » garde ainsi la même famille en série B), plus le sous-type STRUCTUREL quand la variante
 *   en tire plusieurs (6gen6 A puissance / fraction, orientation de la règle de L'Hôpital, L1 / L2 ;
 *   6gen7 sous-types ; 6gen12 A « évaluer » / « doublement », G « rester » / « atteindre »). Jamais
 *   le verdict : ni la valeur ou le signe d'une limite, ni la base < 1, ni le nombre de solutions, ni
 *   la réponse oui / non de 6gen12 G, ni la forme indéterminée de 6gen6 B / C (présentation produit
 *   ou quotient tirée librement).
 * - Cas particuliers (décision de l'utilisateur, audit V1–V3) : « aucune solution » de 6gen9
 *   (familles D, B contradictoire, A3 à Δ < 0, C sans racine t > 0) et inéquation « toujours vraie /
 *   toujours fausse » de 6gen10 (B, C-f, C-k). Ils RACCOURCISSENT la résolution ; les variantes qui
 *   n'ont que ce cas (6gen9 D1, D2 ; 6gen10 B, C-f, C-k) restent tirées quand le professeur les
 *   choisit (palier de repli « sans contrainte » du moteur).
 * - `calcul` : 6gen12 seulement (A « doublement » exact, tout le reste à la calculatrice). Les
 *   limites de 6gen6, les équations de 6gen9 (puissances exactes de la base) et les autres
 *   générateurs sont toujours exacts : aucune contrainte de calculatrice ne s'y applique.
 */
import type { ProfilInstance } from "../../export/genererFeuilleExercices";
import type { ExerciceLimiteExponentielle } from "../core6e/limitesExponentielles.types";
import type { ExerciceDomaineDeriveeExponentielle } from "../core6e/domaineDeriveeExponentielles.types";
import type { ExerciceGraphiqueDeriveeExponentielle } from "../core6e/graphiquesDeriveeExponentielles.types";
import type { ExerciceEquationExponentielle } from "../core6e/equationsExponentielles.types";
import type { ExerciceInequationExponentielle } from "../core6e/inequationsExponentielles.types";
import type { ExerciceEtudeFonctionExponentielle } from "../core6e/etudeFonctionExponentielle.types";
import type { ExerciceExponentiellesProblemes } from "../core6e/exponentiellesProblemes.types";

/** 6gen6 — limites (toujours exactes). */
export function profilLimitesExponentielles(e: ExerciceLimiteExponentielle): ProfilInstance {
  switch (e.famille) {
    case "A":
      return { casParticulier: null, forme: `A:${e.sousCas}` };
    case "H":
    case "K":
      return { casParticulier: null, forme: `${e.famille}:${e.expAuNumerateur ? "exp-num" : "exp-den"}` };
    case "I":
      return { casParticulier: null, forme: `I:${e.sinAuNumerateur ? "sin-num" : "sin-den"}` };
    case "J":
      return { casParticulier: null, forme: `J:${e.arcFn}:${e.arcAuNumerateur ? "arc-num" : "arc-den"}` };
    case "L":
      return { casParticulier: null, forme: `L:${e.sousType}` };
    default:
      return { casParticulier: null, forme: e.famille };
  }
}

/** 6gen7 — domaine et dérivée (toujours exacts). */
export function profilDomaineDeriveeExponentielles(e: ExerciceDomaineDeriveeExponentielle): ProfilInstance {
  return { casParticulier: null, forme: "sousType" in e ? `${e.famille}:${e.sousType}` : e.famille };
}

/** 6gen8 — graphique de la dérivée (le graphique choisi est le verdict). */
export function profilGraphiquesDeriveeExponentielles(e: ExerciceGraphiqueDeriveeExponentielle): ProfilInstance {
  return { casParticulier: null, forme: e.famille };
}

export const LIBELLE_CAS_EQUATIONS_EXPONENTIELLES = "Inclure un cas particulier (équation sans solution)";

/** 6gen9 — équations (puissances exactes de la base : toujours exactes). */
export function profilEquationsExponentielles(e: ExerciceEquationExponentielle): ProfilInstance {
  switch (e.famille) {
    case "A":
      return { casParticulier: e.sousType === "A3" && e.solutions.length === 0 ? "aucune-solution" : null, forme: e.sousType };
    case "B":
      return { casParticulier: e.contradictoire ? "aucune-solution" : null, forme: "B" };
    case "C":
      return { casParticulier: e.solutionsX.length === 0 ? "aucune-solution" : null, forme: `C:${e.style}` };
    case "D":
      return { casParticulier: "aucune-solution", forme: e.sousType };
  }
}

export const LIBELLE_CAS_INEQUATIONS_EXPONENTIELLES = "Inclure un cas particulier (inéquation impossible ou vraie pour tout réel)";

/** 6gen10 — inéquations (toujours exactes). */
export function profilInequationsExponentielles(e: ExerciceInequationExponentielle): ProfilInstance {
  switch (e.famille) {
    case "B":
      return { casParticulier: "inequation-triviale", forme: "B" };
    case "C":
      return { casParticulier: "inequation-triviale", forme: `C-${e.sousType}` };
    case "D":
      return { casParticulier: null, forme: `D-${e.sousType}` };
    default:
      return { casParticulier: null, forme: e.famille };
  }
}

/** Groupe à verdict de 6gen10 : B (toujours impossible) et C-f (toujours vraie) — choisir l'une,
 * c'est donner le verdict. C-k reste à part : son nom ne dit pas la réponse, et avec lui la série B
 * retombait sur le même verdict que la série A une fois sur trois (C-f et C-k donnent toutes deux ℝ). */
export const GROUPES_VERDICT_INEQUATIONS_EXPONENTIELLES = [{ id: "groupe_triviale", label: "Impossible ou vraie pour tout réel, au hasard (B, C — produit)", variantes: ["B", "C-f"] }];

/** 6gen11 — étude de fonction (sens de variation, concavité et graphique : verdicts). */
export function profilEtudeFonctionExponentielle(e: ExerciceEtudeFonctionExponentielle): ProfilInstance {
  return { casParticulier: null, forme: e.famille };
}

/** 6gen12 — problèmes : A « doublement » se fait de tête, tout le reste demande la calculatrice. */
export function profilExponentiellesProblemes(e: ExerciceExponentiellesProblemes): ProfilInstance {
  switch (e.famille) {
    case "A":
      return { casParticulier: null, forme: `A:${e.sousType}`, calcul: e.sousType === "doublement" ? "exacte" : "calculatrice" };
    case "G":
      return { casParticulier: null, forme: `G:${e.objectif}`, calcul: "calculatrice" };
    default:
      return { casParticulier: null, forme: e.famille, calcul: "calculatrice" };
  }
}

export const VARIANTES_CALCULATRICE_PROBLEMES = ["B", "C", "D", "E", "F", "G"];
