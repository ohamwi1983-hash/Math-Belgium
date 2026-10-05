/**
 * Couche B — vérification pour "Inégalité de Bienaymé-Tchebychev" (chapitre 5) — refonte complète.
 *
 * **Une seule tolérance, jamais deux** (contrairement à la première version) : chaque champ
 * "Attendu" du contrat (Couche A) est DÉJÀ la valeur arrondie selon la règle propre à ce champ
 * (`generateurs/bienaymeTchebychev/arrondis.ts`) — la vérification compare donc toujours la saisie
 * de l'élève à une cible EXACTE (au sens "déjà arrondie une fois pour toutes"), avec une tolérance
 * MINIME qui ne couvre que le bruit résiduel de virgule flottante, jamais une vraie marge d'arrondi
 * ("Vérification par égalité exacte sur la valeur numérique attendue telle que calculée par le
 * générateur", `promptgen37refonte.md`).
 */
import { parserNombreOuFraction } from "./verificationAnalyseFonction";
import type { StatutVerification } from "./statutVerification";

const TOLERANCE = 1e-6;

function statutValeur(texte: string, cible: number): StatutVerification {
  const valeur = parserNombreOuFraction(texte);
  if (valeur === null) return "parse_error";
  return Math.abs(valeur - cible) <= TOLERANCE ? "correct" : "not_equivalent";
}

// ============================================================================
// k — deux "rôles" de génération (depuis un intervalle donné, ou depuis un pourcentage donné),
// mais UNE SEULE vérification : la cible `kAttendu` est déjà la valeur correcte, quel que soit le
// rôle qui l'a produite.
// ============================================================================

export function diagnostiquerK(exercice: { kAttendu: number }, texte: string): StatutVerification {
  return statutValeur(texte, exercice.kAttendu);
}

export function verifierK(exercice: { kAttendu: number }, texte: string): boolean {
  return diagnostiquerK(exercice, texte) === "correct";
}

// ============================================================================
// Pourcentage minimal — final (V1, arrondi vers le bas) ou intermédiaire (V3, arrondi standard) :
// la DIFFÉRENCE est déjà capturée par la valeur de `pourcentAttendu` elle-même (Couche A), jamais
// par la vérification, qui reste une simple comparaison à cette cible.
// ============================================================================

export function diagnostiquerPourcent(exercice: { pourcentAttendu: number }, texte: string): StatutVerification {
  return statutValeur(texte, exercice.pourcentAttendu);
}

export function verifierPourcent(exercice: { pourcentAttendu: number }, texte: string): boolean {
  return diagnostiquerPourcent(exercice, texte) === "correct";
}

// ============================================================================
// Pourcentage minimal depuis un nombre d'individus donné (écran 0 des variantes V4/V7/V8).
// ============================================================================

export function diagnostiquerPourcentDepuisNombre(exercice: { pourcentAttendu0: number }, texte: string): StatutVerification {
  return statutValeur(texte, exercice.pourcentAttendu0);
}

export function verifierPourcentDepuisNombre(exercice: { pourcentAttendu0: number }, texte: string): boolean {
  return diagnostiquerPourcentDepuisNombre(exercice, texte) === "correct";
}

// ============================================================================
// Intervalle final (V2/V4) — 2 champs indépendants, diagnostiqués séparément pour isoler une
// erreur de signe sur une seule borne (même principe que "Point à partir d'une relation
// vectorielle").
// ============================================================================

export interface ReponseIntervalle {
  borneInf: string;
  borneSup: string;
}

export interface StatutIntervalle {
  borneInf: StatutVerification;
  borneSup: StatutVerification;
}

export function diagnostiquerIntervalleAttendu(exercice: { borneInfAttendue: number; borneSupAttendue: number }, reponse: ReponseIntervalle): StatutIntervalle {
  return {
    borneInf: statutValeur(reponse.borneInf, exercice.borneInfAttendue),
    borneSup: statutValeur(reponse.borneSup, exercice.borneSupAttendue),
  };
}

export function verifierIntervalleAttendu(exercice: { borneInfAttendue: number; borneSupAttendue: number }, reponse: ReponseIntervalle): boolean {
  const statut = diagnostiquerIntervalleAttendu(exercice, reponse);
  return statut.borneInf === "correct" && statut.borneSup === "correct";
}

// ============================================================================
// Nombre minimal d'individus (V3, dernier écran, aucune aide).
// ============================================================================

export function diagnostiquerNombre(exercice: { nMinAttendu: number }, texte: string): StatutVerification {
  return statutValeur(texte, exercice.nMinAttendu);
}

export function verifierNombre(exercice: { nMinAttendu: number }, texte: string): boolean {
  return diagnostiquerNombre(exercice, texte) === "correct";
}

// ============================================================================
// σ retrouvé (V5/V7).
// ============================================================================

export function diagnostiquerSigma(exercice: { sigmaAttendu: number }, texte: string): StatutVerification {
  return statutValeur(texte, exercice.sigmaAttendu);
}

export function verifierSigma(exercice: { sigmaAttendu: number }, texte: string): boolean {
  return diagnostiquerSigma(exercice, texte) === "correct";
}

// ============================================================================
// x̄ retrouvé (V6/V8).
// ============================================================================

export function diagnostiquerXBar(exercice: { xBarAttendu: number }, texte: string): StatutVerification {
  return statutValeur(texte, exercice.xBarAttendu);
}

export function verifierXBar(exercice: { xBarAttendu: number }, texte: string): boolean {
  return diagnostiquerXBar(exercice, texte) === "correct";
}
