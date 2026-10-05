/**
 * Couche B — vérification pour "Boîte à moustaches" (chapitre 5, septième et dernier générateur du
 * chapitre).
 *
 * Écran "lecture" : statut à 3 valeurs (`StatutVerification`) sur les 5 champs libres, un par
 * indépendamment de ses voisins — même primitive `parserNombreOuFraction`
 * (`verificationAnalyseFonction.ts`, exercice 7, import moteur→moteur) et même tolérance minime
 * (`1e-9`, bruit de virgule flottante résiduel) que le reste du chapitre 5 : les 5 valeurs sont
 * toujours des entiers exacts par construction.
 *
 * Écran "construction" : **aucune saisie libre** — chaque marqueur est déplacé par glissement
 * CRANTÉ (même principe que l'écran "trace" de "Regroupement en classes et histogramme") : déjà un
 * entier exact au moment où il atteint la vérification, comparaison par simple égalité stricte,
 * jamais de statut à 3 valeurs ni de tolérance flottante.
 *
 * Écran "comparaison" (2 sous-écrans) : champs CATÉGORIELS ("A"/"B"), aucune saisie libre non plus
 * — logique booléenne dédiée, même principe que "Colinéarité"/"Orthogonalité"/"Mode".
 */
import { parserNombreOuFraction } from "./verificationAnalyseFonction";
import type { StatutVerification } from "./statutVerification";
import type {
  CinqNombres,
  ExerciceBoiteMoustachesComparaison,
  ExerciceBoiteMoustachesConstruction,
  ExerciceBoiteMoustachesLecture,
} from "../core/boiteMoustaches.types";

const TOLERANCE = 1e-9;

function statutValeurExacte(texte: string, cible: number): StatutVerification {
  const valeur = parserNombreOuFraction(texte);
  if (valeur === null) return "parse_error";
  return Math.abs(valeur - cible) <= TOLERANCE ? "correct" : "not_equivalent";
}

// ============================================================================
// Écran "construction" — 5 marqueurs déplacés par glissement cranté, déjà des entiers exacts.
// ============================================================================

export function diagnostiquerMarqueurConstruction(
  exercice: ExerciceBoiteMoustachesConstruction,
  cle: keyof CinqNombres,
  valeur: number,
): boolean {
  return valeur === exercice.valeurs[cle];
}

export function evaluerConstruction(exercice: ExerciceBoiteMoustachesConstruction, reponse: CinqNombres): Record<keyof CinqNombres, boolean> {
  return {
    min: diagnostiquerMarqueurConstruction(exercice, "min", reponse.min),
    q1: diagnostiquerMarqueurConstruction(exercice, "q1", reponse.q1),
    mediane: diagnostiquerMarqueurConstruction(exercice, "mediane", reponse.mediane),
    q3: diagnostiquerMarqueurConstruction(exercice, "q3", reponse.q3),
    max: diagnostiquerMarqueurConstruction(exercice, "max", reponse.max),
  };
}

export function verifierConstruction(exercice: ExerciceBoiteMoustachesConstruction, reponse: CinqNombres): boolean {
  const statuts = evaluerConstruction(exercice, reponse);
  return statuts.min && statuts.q1 && statuts.mediane && statuts.q3 && statuts.max;
}

// ============================================================================
// Écran "lecture" — 5 champs libres.
// ============================================================================

export interface ReponseLecture {
  min: string;
  q1: string;
  mediane: string;
  q3: string;
  max: string;
}

export interface StatutLecture {
  min: StatutVerification;
  q1: StatutVerification;
  mediane: StatutVerification;
  q3: StatutVerification;
  max: StatutVerification;
}

export function diagnostiquerLecture(exercice: ExerciceBoiteMoustachesLecture, reponse: ReponseLecture): StatutLecture {
  return {
    min: statutValeurExacte(reponse.min, exercice.valeurs.min),
    q1: statutValeurExacte(reponse.q1, exercice.valeurs.q1),
    mediane: statutValeurExacte(reponse.mediane, exercice.valeurs.mediane),
    q3: statutValeurExacte(reponse.q3, exercice.valeurs.q3),
    max: statutValeurExacte(reponse.max, exercice.valeurs.max),
  };
}

export function verifierLecture(exercice: ExerciceBoiteMoustachesLecture, reponse: ReponseLecture): boolean {
  const statuts = diagnostiquerLecture(exercice, reponse);
  return statuts.min === "correct" && statuts.q1 === "correct" && statuts.mediane === "correct" && statuts.q3 === "correct" && statuts.max === "correct";
}

// ============================================================================
// Écran "comparaison" — 2 questions catégorielles indépendantes.
// ============================================================================

export function verifierComparaisonMedianes(exercice: ExerciceBoiteMoustachesComparaison, choix: "A" | "B"): boolean {
  return choix === exercice.medianePlusGrande;
}

export function verifierComparaisonDispersions(exercice: ExerciceBoiteMoustachesComparaison, choix: "A" | "B"): boolean {
  return choix === exercice.ecartInterquartilePlusGrand;
}
