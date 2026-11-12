import type { ExerciceAffixesRacines, ExerciceFamilleA, ExerciceFamilleB, ExerciceFamilleC, ExerciceFamilleD, IdRelationParallelogramme, IdSystemeRacine } from "../core6e/affixesRacines.types";
import type { StatutVerification } from "../moteur/statutVerification";
import { evaluerValeurComplexe } from "./expressionComplexe";
import { TOLERANCE_COMPLEXE, diagnostiquerComplexe } from "./verificationComplexes";
import type { Complexe } from "./verificationComplexes";
import type { PhaseAffixesRacines } from "./typesAffixesRacines";

/**
 * Couche B (6e) — vérification propre à `6gen35` (dispatch par famille/écran). N'importe JAMAIS
 * rien de `src/generateurs6e/` (règle non négociable, CLAUDE.md) — voir
 * `generateurs6e/affixesRacines/session.integration.test.ts` pour le seul fichier autorisé Couche A
 * + Couche B ensemble. Toute la comparaison numérique d'UN complexe est déléguée à
 * `diagnostiquerComplexe` (`moteur6e/verificationComplexes.ts`, LA fondation chapitre 7, importée
 * comme prescrit — jamais `expressionComplexe.ts` directement pour cette comparaison-là) — ce
 * fichier ne fait qu'extraire la bonne cible par écran, combiner plusieurs statuts (familles A/C
 * écran1 — 2 champs) et, pour famille C écran 3, implémenter localement le wrapper "ensemble de 2
 * racines, ordre indifférent" anticipé par l'en-tête de `verificationComplexes.ts`.
 *
 * ============================================================================
 * **Écrans QCM (bEcran1, cEcran1) — pas de "saisie libre", donc pas de `StatutVerification`**
 * ============================================================================
 * Les 2 écrans "poser la relation"/"poser le système" sont un CHOIX parmi options prédéfinies
 * (`.btn.toggle-active`, jamais un champ texte), même patron que `EtapeChoixOuiNonExpoProblemes.tsx`/
 * `EtapeStatutGEquationsExpLog.tsx` (6gen12/6gen14) : la comparaison est une simple égalité d'id,
 * jamais `parse_error` possible (l'id soumis vient TOUJOURS d'un bouton, jamais d'une saisie libre).
 * `diagnostiquerBEcran1`/`diagnostiquerCEcran1` existent quand même (retournent "correct"/
 * "not_equivalent", jamais "parse_error") pour que `diagnostiquerEcran`/`verifierEcran` restent des
 * dispatchers UNIFORMES sur toutes les phases (même signature `(exercice, phase, valeurs: string[])`
 * partout — la valeur soumise pour un écran QCM est `[id]`, un tableau à 1 élément comme les autres).
 *
 * ============================================================================
 * **`diagnostiquerRacinesCarrees` — wrapper local "ensemble de 2 racines, ordre indifférent"**
 * ============================================================================
 * `verificationComplexes.ts` anticipe EXPLICITEMENT ce besoin dans son en-tête ("un futur
 * générateur... doit écrire son propre wrapper LOCAL au-dessus de `evaluerValeurComplexe`, mirroir
 * `diagnostiquerEnsembleValeurs` dans `equivalenceExponentielle.ts`") — jamais une modification de
 * ce fichier partagé. Mirroir STRUCTUREL exact de `diagnostiquerEnsembleValeurs` (nombres réels),
 * adapté aux `Complexe` (comparaison sur `re` ET `im`) : le nombre de valeurs soumises doit être
 * EXACTEMENT `cibles.length` (2 ici) — soumettre 1 seule racine, même correcte, retourne
 * `"not_equivalent"`, JAMAIS `"correct"` en acceptant un sous-ensemble (piège central de la spec,
 * voir `familleC.test.ts`/`verificationAffixesRacines.test.ts`).
 */

export function diagnostiquerRacinesCarrees(textes: string[], cibles: Complexe[], tolerance: number = TOLERANCE_COMPLEXE): StatutVerification {
  if (textes.length !== cibles.length) return "not_equivalent";
  const valeurs: Complexe[] = [];
  for (const t of textes) {
    const v = evaluerValeurComplexe(t);
    if (v === null) return "parse_error";
    valeurs.push(v);
  }
  const restantes = [...cibles];
  for (const v of valeurs) {
    const index = restantes.findIndex((c) => Math.abs(c.re - v.re) <= tolerance && Math.abs(c.im - v.im) <= tolerance);
    if (index === -1) return "not_equivalent";
    restantes.splice(index, 1);
  }
  return "correct";
}

// ============================================================================
// Famille A — écran unique à 2 champs (z+z̄, z-z̄), "parse_error" prioritaire.
// ============================================================================

export function diagnostiquerAEcran1(exercice: ExerciceFamilleA, valeurs: string[]): StatutVerification {
  const statutSomme = diagnostiquerComplexe(valeurs[0], exercice.somme);
  const statutDiff = diagnostiquerComplexe(valeurs[1], exercice.difference);
  if (statutSomme === "parse_error" || statutDiff === "parse_error") return "parse_error";
  if (statutSomme === "not_equivalent" || statutDiff === "not_equivalent") return "not_equivalent";
  return "correct";
}
export function verifierAEcran1(exercice: ExerciceFamilleA, valeurs: string[]): boolean {
  return diagnostiquerAEcran1(exercice, valeurs) === "correct";
}

// ============================================================================
// Famille B.
// ============================================================================

function affixeD(exercice: ExerciceFamilleB): Complexe {
  return { re: exercice.reD2 / 2, im: exercice.imD2 / 2 };
}

export function diagnostiquerBEcran1(exercice: ExerciceFamilleB, valeurs: string[]): StatutVerification {
  void exercice;
  const choix = valeurs[0] as IdRelationParallelogramme;
  return choix === "correct" ? "correct" : "not_equivalent";
}
export function verifierBEcran1(exercice: ExerciceFamilleB, valeurs: string[]): boolean {
  return diagnostiquerBEcran1(exercice, valeurs) === "correct";
}

/** Toujours comparé à l'affixe D RÉELLE (A+C-B) — indépendant de ce que l'élève a choisi à l'écran
 * 1 (convention transversale du chantier : chaque écran réutilise la valeur CORRECTE de l'écran
 * précédent). */
export function diagnostiquerBEcran2(exercice: ExerciceFamilleB, valeurs: string[]): StatutVerification {
  return diagnostiquerComplexe(valeurs[0], affixeD(exercice));
}
export function verifierBEcran2(exercice: ExerciceFamilleB, valeurs: string[]): boolean {
  return diagnostiquerBEcran2(exercice, valeurs) === "correct";
}

// ============================================================================
// Famille C.
// ============================================================================

export function diagnostiquerCEcran1(exercice: ExerciceFamilleC, valeurs: string[]): StatutVerification {
  void exercice;
  const choix = valeurs[0] as IdSystemeRacine;
  return choix === "correct" ? "correct" : "not_equivalent";
}
export function verifierCEcran1(exercice: ExerciceFamilleC, valeurs: string[]): boolean {
  return diagnostiquerCEcran1(exercice, valeurs) === "correct";
}

/** Toujours comparé à `xPositif` RÉEL — indépendant du système choisi à l'écran 1. */
export function diagnostiquerCEcran2(exercice: ExerciceFamilleC, valeurs: string[]): StatutVerification {
  // x ET −x acceptés (audit 6e ch. 5, point 7) : le système admet les 2 couples (x ; y) et (−x ; −y),
  // qui donnent les 2 mêmes racines ±(x+yi).
  const statut = diagnostiquerComplexe(valeurs[0], { re: exercice.xPositif, im: 0 });
  if (statut !== "not_equivalent") return statut;
  return diagnostiquerComplexe(valeurs[0], { re: -exercice.xPositif, im: 0 });
}
export function verifierCEcran2(exercice: ExerciceFamilleC, valeurs: string[]): boolean {
  return diagnostiquerCEcran2(exercice, valeurs) === "correct";
}

/** Toujours comparé aux 2 racines RÉELLES (±(xPositif+yDeduit·i)) — indépendant de ce que l'élève a
 * soumis à l'écran 2 (même convention que ci-dessus). Voir en-tête de fichier pour le piège central
 * (1 seule racine soumise, même correcte, DOIT être rejetée). */
export function diagnostiquerCEcran3(exercice: ExerciceFamilleC, valeurs: string[]): StatutVerification {
  return diagnostiquerRacinesCarrees(valeurs, exercice.racines);
}
export function verifierCEcran3(exercice: ExerciceFamilleC, valeurs: string[]): boolean {
  return diagnostiquerCEcran3(exercice, valeurs) === "correct";
}

// ============================================================================
// Dispatcher générique (mirroir 6gen34).
// ============================================================================

export function diagnostiquerDEcran1(exercice: ExerciceFamilleD, valeurs: string[]): StatutVerification {
  return diagnostiquerComplexe(valeurs[0], exercice.milieu);
}
export function diagnostiquerDEcran2(exercice: ExerciceFamilleD, valeurs: string[]): StatutVerification {
  const statutDiff = diagnostiquerComplexe(valeurs[0], exercice.difference);
  const statutDist = diagnostiquerComplexe(valeurs[1], { re: exercice.distance, im: 0 });
  if (statutDiff === "parse_error" || statutDist === "parse_error") return "parse_error";
  if (statutDiff === "not_equivalent" || statutDist === "not_equivalent") return "not_equivalent";
  return "correct";
}

/** Valeur de x saisie à l'écran 2 de la famille C si elle vaut −x (accepté) : la session la retient
 * pour la suite de l'exercice. `null` si la saisie vaut +x ou n'est pas lisible. */
export function xOpposeSaisi(exercice: ExerciceFamilleC, valeurs: string[]): number | null {
  const v = evaluerValeurComplexe(valeurs[0]);
  if (v === null) return null;
  return Math.abs(v.re + exercice.xPositif) <= TOLERANCE_COMPLEXE && Math.abs(v.im) <= TOLERANCE_COMPLEXE ? -exercice.xPositif : null;
}

export function diagnostiquerEcran(exercice: ExerciceAffixesRacines, phase: PhaseAffixesRacines, valeurs: string[]): StatutVerification {
  switch (phase) {
    case "aEcran1":
      return diagnostiquerAEcran1(exercice as ExerciceFamilleA, valeurs);
    case "bEcran1":
      return diagnostiquerBEcran1(exercice as ExerciceFamilleB, valeurs);
    case "bEcran2":
      return diagnostiquerBEcran2(exercice as ExerciceFamilleB, valeurs);
    case "cEcran1":
      return diagnostiquerCEcran1(exercice as ExerciceFamilleC, valeurs);
    case "cEcran2":
      return diagnostiquerCEcran2(exercice as ExerciceFamilleC, valeurs);
    case "cEcran3":
      return diagnostiquerCEcran3(exercice as ExerciceFamilleC, valeurs);
    case "dEcran1":
      return diagnostiquerDEcran1(exercice as ExerciceFamilleD, valeurs);
    case "dEcran2":
      return diagnostiquerDEcran2(exercice as ExerciceFamilleD, valeurs);
  }
}

export function verifierEcran(exercice: ExerciceAffixesRacines, phase: PhaseAffixesRacines, valeurs: string[]): boolean {
  return diagnostiquerEcran(exercice, phase, valeurs) === "correct";
}
