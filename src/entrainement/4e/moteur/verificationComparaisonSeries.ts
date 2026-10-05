/**
 * Couche B — vérification pour "Comparaison de deux séries statistiques" (chapitre 5, huitième et
 * dernier générateur du chapitre). Une seule question par exercice (mono-écran) — 4 formes de
 * réponse distinctes, chacune sa propre logique :
 *
 * - "centrage"/"interpretation" : champ CATÉGORIEL pur ("A"/"B") — simple booléen, aucune saisie
 *   libre, jamais de statut à 3 valeurs (même principe que "Colinéarité"/"Orthogonalité"/"Mode").
 * - "seuil" : champ numérique libre — statut à 3 valeurs (`StatutVerification`), même primitive
 *   `parserNombreOuFraction` (`verificationAnalyseFonction.ts`, exercice 7, import moteur→moteur)
 *   et même tolérance minime (`1e-9`, bruit de virgule flottante résiduel) que le reste du
 *   chapitre 5 : la cible (`question.reponseAttendue`) est toujours un entier exact par
 *   construction (effectif/fréquence cumulé, jamais interpolé).
 * - "dispersion" : champ catégoriel ("A"/"B") + un ENSEMBLE d'arguments SANS ORDRE IMPOSÉ — motif
 *   entièrement nouveau pour ce projet (aucun autre générateur n'a de sélection multiple à
 *   vérifier) : voir `verifierDispersion` ci-dessous.
 */
import { parserNombreOuFraction } from "./verificationAnalyseFonction";
import type { StatutVerification } from "./statutVerification";
import type {
  ArgumentDispersionComparaison,
  QuestionCentrage,
  QuestionDispersion,
  QuestionInterpretation,
  QuestionSeuil,
} from "../core/comparaisonSeries.types";

const TOLERANCE = 1e-9;

// ============================================================================
// "centrage" — champ catégoriel pur.
// ============================================================================

export function verifierCentrage(question: QuestionCentrage, choix: "A" | "B"): boolean {
  return choix === question.medianePlusGrande;
}

// ============================================================================
// "interpretation" — champ catégoriel pur.
// ============================================================================

export function verifierInterpretation(question: QuestionInterpretation, choix: "A" | "B"): boolean {
  return choix === question.serieDecrite;
}

// ============================================================================
// "seuil" — champ numérique libre, statut à 3 valeurs.
// ============================================================================

export function diagnostiquerSeuil(question: QuestionSeuil, texte: string): StatutVerification {
  const valeur = parserNombreOuFraction(texte);
  if (valeur === null) return "parse_error";
  return Math.abs(valeur - question.reponseAttendue) <= TOLERANCE ? "correct" : "not_equivalent";
}

export function verifierSeuil(question: QuestionSeuil, texte: string): boolean {
  return diagnostiquerSeuil(question, texte) === "correct";
}

// ============================================================================
// "dispersion" — champ catégoriel + sélection MULTIPLE (ensemble sans ordre imposé).
// ============================================================================

/** Options proposées à l'élève (checkbox) pour justifier l'homogénéité — 3 choix affichés, dont
 * "étendue" toujours invalide : prolonge le piège déjà ciblé par "Étendue et écart
 * interquartile"/gen35 (confondre l'étendue, sensible aux valeurs extrêmes, avec un vrai indicateur
 * de dispersion typique). */
export type ArgumentDispersionOption = ArgumentDispersionComparaison | "etendue";

export interface ReponseDispersion {
  serie: "A" | "B";
  arguments: ArgumentDispersionOption[];
}

const ARGUMENTS_VALIDES: readonly ArgumentDispersionComparaison[] = ["ecartType", "ecartInterquartile"];

function estArgumentValide(argument: ArgumentDispersionOption): argument is ArgumentDispersionComparaison {
  return (ARGUMENTS_VALIDES as readonly string[]).includes(argument);
}

/**
 * Vérifie un ENSEMBLE d'arguments SANS ORDRE IMPOSÉ, jamais une comparaison position par position
 * ni une liste figée à l'avance : la génération garantit que σ ET l'écart interquartile pointent
 * TOUJOURS vers la même série (`serieHomogene`), donc les 2 valeurs de `ARGUMENTS_VALIDES` sont
 * TOUJOURS individuellement correctes — pour N=1, N'IMPORTE LEQUEL des deux suffit ; pour N=2, les
 * DEUX doivent être sélectionnés (aucun troisième argument valide n'existe). Le nombre d'arguments
 * soumis doit correspondre EXACTEMENT à `question.nombreArguments` (ni oubli, ni argument en trop) ;
 * "étendue" n'appartient jamais à `ARGUMENTS_VALIDES`, la sélectionner fait donc toujours échouer la
 * vérification, quel que soit le reste de la sélection — le piège se matérialise nativement, sans
 * cas spécial.
 */
export function verifierDispersion(question: QuestionDispersion, reponse: ReponseDispersion): boolean {
  if (reponse.serie !== question.serieHomogene) return false;
  if (reponse.arguments.length !== question.nombreArguments) return false;
  if (new Set(reponse.arguments).size !== reponse.arguments.length) return false;
  return reponse.arguments.every(estArgumentValide);
}
