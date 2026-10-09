import type {
  ExerciceFamilleA,
  ExerciceFamilleB,
  ExerciceFamilleB_Carre,
  ExerciceFamilleB_Cube,
  ExerciceFamilleB_Produit,
  ExerciceFamilleC,
  ExerciceFamilleD,
  ExerciceFamilleE,
  ExerciceFamilleF,
  ExerciceFamilleG,
  ExerciceNombresComplexes,
} from "../core6e/nombresComplexes.types";
import type { StatutVerification } from "../moteur/statutVerification";
import { diagnostiquerComplexe } from "./verificationComplexes";
import type { PhaseNombresComplexes } from "./typesNombresComplexes";

/**
 * Couche B (6e) — vérification propre à `6gen34` (dispatch par famille/écran). N'importe JAMAIS
 * rien de `src/generateurs6e/` (règle non négociable, CLAUDE.md) — voir
 * `generateurs6e/nombresComplexes/session.integration.test.ts` pour le seul fichier autorisé Couche
 * A + Couche B ensemble. Toute la comparaison numérique proprement dite est déléguée à
 * `diagnostiquerComplexe` (`moteur6e/verificationComplexes.ts`, LA fondation chapitre 7) — ce
 * fichier ne fait qu'extraire la bonne cible `Complexe` par écran et, pour la famille C (2 champs),
 * combiner 2 statuts.
 *
 * ============================================================================
 * **Écran spécial — famille F, écran 1 : la réponse DOIT être structurellement simplifiée**
 * ============================================================================
 * Même piège que `diagnostiquerAEcran2` de `verificationLongueurArc.ts` (6gen28, voir son en-tête) :
 * la spec demande explicitement de simplifier le quotient interne AVANT toute mise au carré — une
 * expression numériquement équivalente mais qui laisse le quotient SOUS FORME DE FRACTION (ex.
 * `"(-2+1i)/(1+2i)"` au lieu de la forme réduite `"i"`) n'a pas fait le travail demandé et doit être
 * REJETÉE, bien que `diagnostiquerComplexe` seul (comparaison purement numérique) ne puisse pas
 * distinguer les deux cas. Contrôle structurel ajouté : le texte soumis (espaces retirés) ne doit
 * contenir AUCUNE occurrence du caractère `"/"` — `quotientSimplifie` est TOUJOURS une valeur simple
 * (entier ou i, jamais une fraction, voir `generateurs6e/nombresComplexes/familleF.ts`, banque de
 * cibles), donc une réponse correcte et bien simplifiée n'a structurellement jamais besoin d'une
 * division. Classée `"not_equivalent"` (jamais `"parse_error"` — l'expression a bien pu être lue,
 * voir `moteur/statutVerification.ts`).
 */

function contientDivisionLitterale(texte: string): boolean {
  return texte.replace(/\s+/g, "").includes("/");
}

// ============================================================================
// Famille A.
// ============================================================================

export function diagnostiquerAEcran1(exercice: ExerciceFamilleA, valeurs: string[]): StatutVerification {
  return diagnostiquerComplexe(valeurs[0], exercice.resultat);
}
export function verifierAEcran1(exercice: ExerciceFamilleA, valeurs: string[]): boolean {
  return diagnostiquerAEcran1(exercice, valeurs) === "correct";
}

// ============================================================================
// Famille B.
// ============================================================================

export function diagnostiquerBProduitEcran1(exercice: ExerciceFamilleB_Produit, valeurs: string[]): StatutVerification {
  return diagnostiquerComplexe(valeurs[0], exercice.resultat);
}
export function diagnostiquerBCarreEcran1(exercice: ExerciceFamilleB_Carre, valeurs: string[]): StatutVerification {
  return diagnostiquerComplexe(valeurs[0], exercice.resultat);
}
export function diagnostiquerBCubeEcran1(exercice: ExerciceFamilleB_Cube, valeurs: string[]): StatutVerification {
  return diagnostiquerComplexe(valeurs[0], exercice.carre);
}
/** Toujours comparé au CUBE réel — indépendant de ce que l'élève a soumis à l'écran 1 (convention
 * transversale du chantier : chaque écran réutilise la valeur CORRECTE de l'écran précédent). */
export function diagnostiquerBCubeEcran2(exercice: ExerciceFamilleB_Cube, valeurs: string[]): StatutVerification {
  return diagnostiquerComplexe(valeurs[0], exercice.cube);
}

export function verifierBProduitEcran1(exercice: ExerciceFamilleB_Produit, valeurs: string[]): boolean {
  return diagnostiquerBProduitEcran1(exercice, valeurs) === "correct";
}
export function verifierBCarreEcran1(exercice: ExerciceFamilleB_Carre, valeurs: string[]): boolean {
  return diagnostiquerBCarreEcran1(exercice, valeurs) === "correct";
}
export function verifierBCubeEcran1(exercice: ExerciceFamilleB_Cube, valeurs: string[]): boolean {
  return diagnostiquerBCubeEcran1(exercice, valeurs) === "correct";
}
export function verifierBCubeEcran2(exercice: ExerciceFamilleB_Cube, valeurs: string[]): boolean {
  return diagnostiquerBCubeEcran2(exercice, valeurs) === "correct";
}

// ============================================================================
// Famille C — écran 1 à 2 champs (numérateur, dénominateur), "parse_error" prioritaire.
// ============================================================================

export function diagnostiquerCEcran1(exercice: ExerciceFamilleC, valeurs: string[]): StatutVerification {
  const statutNum = diagnostiquerComplexe(valeurs[0], exercice.numerateurDeveloppe);
  const statutDen = diagnostiquerComplexe(valeurs[1], { re: exercice.denominateurDeveloppe, im: 0 });
  if (statutNum === "parse_error" || statutDen === "parse_error") return "parse_error";
  if (statutNum === "not_equivalent" || statutDen === "not_equivalent") return "not_equivalent";
  return "correct";
}
export function diagnostiquerCEcran2(exercice: ExerciceFamilleC, valeurs: string[]): StatutVerification {
  return diagnostiquerComplexe(valeurs[0], exercice.resultat);
}
export function verifierCEcran1(exercice: ExerciceFamilleC, valeurs: string[]): boolean {
  return diagnostiquerCEcran1(exercice, valeurs) === "correct";
}
export function verifierCEcran2(exercice: ExerciceFamilleC, valeurs: string[]): boolean {
  return diagnostiquerCEcran2(exercice, valeurs) === "correct";
}

// ============================================================================
// Famille D.
// ============================================================================

export function diagnostiquerDEcran1(exercice: ExerciceFamilleD, valeurs: string[]): StatutVerification {
  return diagnostiquerComplexe(valeurs[0], exercice.resultat);
}
export function verifierDEcran1(exercice: ExerciceFamilleD, valeurs: string[]): boolean {
  return diagnostiquerDEcran1(exercice, valeurs) === "correct";
}

// ============================================================================
// Famille E — écran 1 à 2 champs (une fraction chacun), "parse_error" prioritaire.
// ============================================================================

export function diagnostiquerEEcran1(exercice: ExerciceFamilleE, valeurs: string[]): StatutVerification {
  const statut1 = diagnostiquerComplexe(valeurs[0], exercice.fraction1);
  const statut2 = diagnostiquerComplexe(valeurs[1], exercice.fraction2);
  if (statut1 === "parse_error" || statut2 === "parse_error") return "parse_error";
  if (statut1 === "not_equivalent" || statut2 === "not_equivalent") return "not_equivalent";
  return "correct";
}
export function diagnostiquerEEcran2(exercice: ExerciceFamilleE, valeurs: string[]): StatutVerification {
  return diagnostiquerComplexe(valeurs[0], exercice.resultat);
}
export function verifierEEcran1(exercice: ExerciceFamilleE, valeurs: string[]): boolean {
  return diagnostiquerEEcran1(exercice, valeurs) === "correct";
}
export function verifierEEcran2(exercice: ExerciceFamilleE, valeurs: string[]): boolean {
  return diagnostiquerEEcran2(exercice, valeurs) === "correct";
}

// ============================================================================
// Famille F — voir en-tête de fichier ("Écran spécial").
// ============================================================================

export function diagnostiquerFEcran1(exercice: ExerciceFamilleF, valeurs: string[]): StatutVerification {
  const texte = valeurs[0];
  const equivalence = diagnostiquerComplexe(texte, exercice.quotientSimplifie);
  if (equivalence !== "correct") return equivalence;
  if (contientDivisionLitterale(texte)) return "not_equivalent";
  return "correct";
}
export function diagnostiquerFEcran2(exercice: ExerciceFamilleF, valeurs: string[]): StatutVerification {
  return diagnostiquerComplexe(valeurs[0], exercice.resultat);
}
export function verifierFEcran1(exercice: ExerciceFamilleF, valeurs: string[]): boolean {
  return diagnostiquerFEcran1(exercice, valeurs) === "correct";
}
export function verifierFEcran2(exercice: ExerciceFamilleF, valeurs: string[]): boolean {
  return diagnostiquerFEcran2(exercice, valeurs) === "correct";
}

// ============================================================================
// Famille G — écran 1 = reste (réel pur), écran 2 = valeur du cycle.
// ============================================================================

export function diagnostiquerGEcran1(exercice: ExerciceFamilleG, valeurs: string[]): StatutVerification {
  return diagnostiquerComplexe(valeurs[0], { re: exercice.reste, im: 0 });
}
export function diagnostiquerGEcran2(exercice: ExerciceFamilleG, valeurs: string[]): StatutVerification {
  return diagnostiquerComplexe(valeurs[0], exercice.resultat);
}
export function verifierGEcran1(exercice: ExerciceFamilleG, valeurs: string[]): boolean {
  return diagnostiquerGEcran1(exercice, valeurs) === "correct";
}
export function verifierGEcran2(exercice: ExerciceFamilleG, valeurs: string[]): boolean {
  return diagnostiquerGEcran2(exercice, valeurs) === "correct";
}

// ============================================================================
// Dispatcher générique (mirroir 6gen28/6gen26).
// ============================================================================

export function diagnostiquerEcran(exercice: ExerciceNombresComplexes, phase: PhaseNombresComplexes, valeurs: string[]): StatutVerification {
  switch (phase) {
    case "aEcran1":
      return diagnostiquerAEcran1(exercice as ExerciceFamilleA, valeurs);
    case "bProduitEcran1":
      return diagnostiquerBProduitEcran1(exercice as ExerciceFamilleB_Produit, valeurs);
    case "bCarreEcran1":
      return diagnostiquerBCarreEcran1(exercice as ExerciceFamilleB_Carre, valeurs);
    case "bCubeEcran1":
      return diagnostiquerBCubeEcran1(exercice as ExerciceFamilleB_Cube, valeurs);
    case "bCubeEcran2":
      return diagnostiquerBCubeEcran2(exercice as ExerciceFamilleB_Cube, valeurs);
    case "cEcran1":
      return diagnostiquerCEcran1(exercice as ExerciceFamilleC, valeurs);
    case "cEcran2":
      return diagnostiquerCEcran2(exercice as ExerciceFamilleC, valeurs);
    case "dEcran1":
      return diagnostiquerDEcran1(exercice as ExerciceFamilleD, valeurs);
    case "eEcran1":
      return diagnostiquerEEcran1(exercice as ExerciceFamilleE, valeurs);
    case "eEcran2":
      return diagnostiquerEEcran2(exercice as ExerciceFamilleE, valeurs);
    case "fEcran1":
      return diagnostiquerFEcran1(exercice as ExerciceFamilleF, valeurs);
    case "fEcran2":
      return diagnostiquerFEcran2(exercice as ExerciceFamilleF, valeurs);
    case "gEcran1":
      return diagnostiquerGEcran1(exercice as ExerciceFamilleG, valeurs);
    case "gEcran2":
      return diagnostiquerGEcran2(exercice as ExerciceFamilleG, valeurs);
  }
}

export function verifierEcran(exercice: ExerciceNombresComplexes, phase: PhaseNombresComplexes, valeurs: string[]): boolean {
  return diagnostiquerEcran(exercice, phase, valeurs) === "correct";
}

// Types de famille B non utilisés par le dispatcher direct (utile aux appelants) — réexportés pour
// éviter une double origine d'import côté `App6gen34.tsx`.
export type { ExerciceFamilleB };
