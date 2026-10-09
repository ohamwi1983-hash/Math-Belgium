import type { ExerciceLieuxA, ExerciceLieuxB, ExerciceLieuxC, ExerciceLieuxD, ExerciceLieuxE, ExerciceLieuxGeometriquesParametres, TypeStatutLieu } from "../core6e/lieuxGeometriquesParametres.types";
import { diagnostiquerValeur } from "./equivalenceExponentielle";
import type { StatutVerification } from "../moteur/statutVerification";
import type { PhaseLieuxGeometriquesParametres } from "./typesLieuxGeometriquesParametres";

/**
 * Couche B (6e) — vérification propre à `6gen56` (dispatch par famille/sous-type/écran). N'importe
 * JAMAIS rien de `src/generateurs6e/` (règle non négociable, CLAUDE.md) — voir
 * `generateurs6e/lieuxGeometriquesParametres/session.integration.test.ts` pour le seul fichier
 * autorisé Couche A + Couche B ensemble.
 *
 * Toutes les valeurs attendues sont déjà PRÉ-CALCULÉES par la Couche A dans l'exercice — ce fichier
 * se contente de les comparer, dans l'ORDRE d'affichage (`ui6e/formatLieuxGeometriquesParametres.ts`
 * doit rester en accord, écrit indépendamment — même convention que `diagnostiquerAEcran`/`champsA`
 * de 6gen43), à la saisie élève. Champs numériques via `diagnostiquerValeur` (tolérance 0.01,
 * accepte une expression saisie non réduite). Champs `choix` (nature du lieu, configuration,
 * stratégie, régime) comparés par égalité de chaîne exacte — jamais `parse_error` (aucune saisie
 * libre possible, boutons `.btn.toggle-active` uniquement).
 */

function combinerStatuts(...statuts: StatutVerification[]): StatutVerification {
  if (statuts.some((s) => s === "parse_error")) return "parse_error";
  if (statuts.some((s) => s === "not_equivalent")) return "not_equivalent";
  return "correct";
}

function diagnostiquerValeurs(valeurs: string[], attendues: number[]): StatutVerification {
  if (valeurs.length !== attendues.length) return "not_equivalent";
  return combinerStatuts(...attendues.map((v, i) => diagnostiquerValeur(valeurs[i] ?? "", v)));
}

function diagnostiquerChoix(valeur: string | undefined, attendu: string): StatutVerification {
  return valeur === attendu ? "correct" : "not_equivalent";
}

// ============================================================================
// Famille A.
// ============================================================================

export function nombreDeCasA(exercice: ExerciceLieuxA): number {
  return exercice.sousType === "paralleles" ? 2 : 4;
}

export function diagnostiquerAEcran(exercice: ExerciceLieuxA, phase: PhaseLieuxGeometriquesParametres, valeurs: string[]): StatutVerification {
  if (exercice.sousType === "paralleles") {
    if (phase === "aParallelesEcran1") return diagnostiquerValeurs(valeurs, [2]);
    return diagnostiquerValeurs(valeurs, [exercice.constante1, exercice.constante2]);
  }
  if (exercice.sousType === "nonBorne") {
    if (phase === "aNonBorneEcran1") return diagnostiquerValeurs(valeurs, [4]);
    return diagnostiquerValeurs(
      valeurs,
      exercice.cas.map((c) => c.c),
    );
  }
  // losange
  if (phase === "aLosangeEcran1") return diagnostiquerValeurs(valeurs, [4]);
  if (phase === "aLosangeEcran2")
    return diagnostiquerValeurs(
      valeurs,
      exercice.cas.map((c) => c.c),
    );
  return diagnostiquerValeurs(
    valeurs,
    exercice.sommets.flatMap((s) => [s.x, s.y]),
  );
}

// ============================================================================
// Famille B — 6 sous-types, 4 écrans uniformes (écran3 allégé pour les 3 sans seuil).
// ============================================================================

export function diagnostiquerBEcran(exercice: ExerciceLieuxB, phase: PhaseLieuxGeometriquesParametres, valeurs: string[]): StatutVerification {
  switch (exercice.sousType) {
    case "bissectrices": {
      if (phase === "bBissectricesEcran1") return diagnostiquerValeurs(valeurs, [2]);
      if (phase === "bBissectricesEcran2") return diagnostiquerValeurs(valeurs, [exercice.xBis, exercice.yBis]);
      if (phase === "bBissectricesEcran3") return diagnostiquerChoix(valeurs[0], "non");
      return combinerStatuts(diagnostiquerChoix(valeurs[0], "pairDeDroites" satisfies TypeStatutLieu), diagnostiquerValeurs(valeurs.slice(1), [exercice.xBis, exercice.yBis]));
    }
    case "droite": {
      if (phase === "bDroiteEcran1") return diagnostiquerValeurs(valeurs, [1, 1]);
      if (phase === "bDroiteEcran2") return diagnostiquerValeurs(valeurs, [exercice.A, exercice.B, exercice.C]);
      if (phase === "bDroiteEcran3") return diagnostiquerChoix(valeurs[0], "non");
      return combinerStatuts(diagnostiquerChoix(valeurs[0], "droite" satisfies TypeStatutLieu), diagnostiquerValeurs(valeurs.slice(1), [exercice.A, exercice.B, exercice.C]));
    }
    case "cerclePerp": {
      if (phase === "bCerclePerpEcran1") return diagnostiquerValeurs(valeurs, [exercice.constanteEcran1]);
      if (phase === "bCerclePerpEcran2") return diagnostiquerValeurs(valeurs, [exercice.D, exercice.E, exercice.F]);
      if (phase === "bCerclePerpEcran3") return diagnostiquerChoix(valeurs[0], "non");
      return combinerStatuts(diagnostiquerChoix(valeurs[0], "cercle" satisfies TypeStatutLieu), diagnostiquerValeurs(valeurs.slice(1), [exercice.x0, exercice.y0, exercice.r]));
    }
    case "seuil2Points": {
      if (phase === "bSeuil2PointsEcran1") return diagnostiquerValeurs(valeurs, [exercice.constanteA, exercice.constanteB]);
      if (phase === "bSeuil2PointsEcran2") return diagnostiquerValeurs(valeurs, [exercice.D, exercice.E, exercice.F]);
      if (phase === "bSeuil2PointsEcran3") return combinerStatuts(diagnostiquerValeur(valeurs[0] ?? "", exercice.seuil), diagnostiquerChoix(valeurs[1], exercice.regime));
      // écran4 :
      const natureAttendue: TypeStatutLieu = exercice.regime === "cercle" ? "cercle" : exercice.regime === "point" ? "point" : "vide";
      const mx = (exercice.xa + exercice.xb) / 2;
      const my = (exercice.ya + exercice.yb) / 2;
      const numeriques = exercice.regime === "cercle" ? [mx, my, exercice.rayon as number] : exercice.regime === "point" ? [mx, my] : [];
      return combinerStatuts(diagnostiquerChoix(valeurs[0], natureAttendue), diagnostiquerValeurs(valeurs.slice(1), numeriques));
    }
    case "apollonius": {
      if (phase === "bApolloniusEcran1") return diagnostiquerValeurs(valeurs, [exercice.ecran1Val1, exercice.ecran1Val2]);
      if (phase === "bApolloniusEcran2") return exercice.casK1 ? diagnostiquerValeurs(valeurs, [exercice.ecran2CoefX]) : diagnostiquerValeurs(valeurs, [exercice.ecran2CoefX, exercice.ecran2Constante as number]);
      if (phase === "bApolloniusEcran3") return diagnostiquerChoix(valeurs[0], exercice.casK1 ? "k1" : "kAutre");
      // écran4 :
      const natureAttendue: TypeStatutLieu = exercice.casK1 ? "droite" : "cercle";
      const numeriques = exercice.casK1 ? [0] : [exercice.x0 as number, 0, exercice.r as number];
      return combinerStatuts(diagnostiquerChoix(valeurs[0], natureAttendue), diagnostiquerValeurs(valeurs.slice(1), numeriques));
    }
    case "seuilCarre": {
      if (phase === "bSeuilCarreEcran1") return diagnostiquerValeurs(valeurs, [exercice.constanteEcran1]);
      if (phase === "bSeuilCarreEcran2") return diagnostiquerValeurs(valeurs, [exercice.rhsEcran2]);
      if (phase === "bSeuilCarreEcran3") return combinerStatuts(diagnostiquerValeur(valeurs[0] ?? "", exercice.seuil), diagnostiquerChoix(valeurs[1], exercice.regime));
      const natureAttendue: TypeStatutLieu = exercice.regime === "cercle" ? "cercle" : exercice.regime === "point" ? "point" : "vide";
      const numeriques = exercice.regime === "cercle" ? [0, 0, exercice.rayon as number] : exercice.regime === "point" ? [0, 0] : [];
      return combinerStatuts(diagnostiquerChoix(valeurs[0], natureAttendue), diagnostiquerValeurs(valeurs.slice(1), numeriques));
    }
  }
}

// ============================================================================
// Famille C.
// ============================================================================

export function diagnostiquerCEcran(exercice: ExerciceLieuxC, phase: PhaseLieuxGeometriquesParametres, valeurs: string[]): StatutVerification {
  if (phase === "cEcran1") return diagnostiquerValeurs(valeurs, [exercice.h, exercice.kPrime, exercice.R]);
  return diagnostiquerValeurs(valeurs, [exercice.cx, exercice.cy, exercice.r]);
}

// ============================================================================
// Famille D.
// ============================================================================

export function diagnostiquerDEcran(exercice: ExerciceLieuxD, phase: PhaseLieuxGeometriquesParametres, valeurs: string[]): StatutVerification {
  if (phase === "dSubstitutionEcran1" || phase === "dFractionsEcran1" || phase === "dRatioEcran1") return diagnostiquerChoix(valeurs[0], exercice.sousType);
  if (exercice.sousType === "substitution") {
    if (phase === "dSubstitutionEcran2") return diagnostiquerValeurs(valeurs, [exercice.coefX, exercice.coefConst]);
    return diagnostiquerValeurs(valeurs, [exercice.Afinal, exercice.Bfinal, exercice.Cfinal]);
  }
  if (exercice.sousType === "fractions") {
    if (phase === "dFractionsEcran2") return diagnostiquerValeurs(valeurs, [exercice.pente]);
    return diagnostiquerValeurs(valeurs, [exercice.pente, 1]);
  }
  // ratio
  if (phase === "dRatioEcran2") return diagnostiquerValeurs(valeurs, [exercice.exposantX, exercice.exposantY]);
  return diagnostiquerValeur(valeurs[0] ?? "", exercice.C.num / exercice.C.den);
}

// ============================================================================
// Famille E.
// ============================================================================

export function diagnostiquerEEcran(exercice: ExerciceLieuxE, phase: PhaseLieuxGeometriquesParametres, valeurs: string[]): StatutVerification {
  if (phase === "eParallelesEcran1" || phase === "ePerpendiculairesEcran1" || phase === "eSecantesEcran1" || phase === "eCarreEcran1") {
    const strategieAttendue = exercice.sousType === "paralleles" || exercice.sousType === "carre" ? "seuil" : "direct";
    return combinerStatuts(diagnostiquerChoix(valeurs[0], exercice.sousType), diagnostiquerChoix(valeurs[1], strategieAttendue));
  }

  if (exercice.sousType === "paralleles") {
    if (phase === "eParallelesEcran2") return diagnostiquerValeurs(valeurs, [exercice.d]);
    if (phase === "eParallelesEcran3") return diagnostiquerChoix(valeurs[0], exercice.regime);
    // écran4 (jamais atteint si regime==="vide") :
    if (exercice.regime === "bandePleine") return diagnostiquerValeurs(valeurs, [0, exercice.d]);
    return diagnostiquerValeurs(valeurs, [exercice.xGauche as number, exercice.xDroite as number]);
  }

  if (exercice.sousType === "perpendiculaires") {
    return combinerStatuts(diagnostiquerChoix(valeurs[0], "formeEtendue" satisfies TypeStatutLieu), diagnostiquerValeurs(valeurs.slice(1), [exercice.k]));
  }

  if (exercice.sousType === "secantes") {
    const sommetA = exercice.sommets[0];
    const sommetB = exercice.sommets[2];
    return combinerStatuts(diagnostiquerChoix(valeurs[0], "formeEtendue" satisfies TypeStatutLieu), diagnostiquerValeurs(valeurs.slice(1), [sommetA.x, sommetB.x, sommetB.y]));
  }

  // carre
  if (phase === "eCarreEcran2") return diagnostiquerValeurs(valeurs, [exercice.seuil]);
  if (phase === "eCarreEcran3") return diagnostiquerChoix(valeurs[0], exercice.regime);
  if (exercice.regime === "bandePleine") return diagnostiquerValeurs(valeurs, [2 * exercice.c]);
  return diagnostiquerValeurs(valeurs, [exercice.m as number]);
}

// ============================================================================
// Dispatcher générique.
// ============================================================================

export function diagnostiquerEcran(exercice: ExerciceLieuxGeometriquesParametres, phase: PhaseLieuxGeometriquesParametres, valeurs: string[]): StatutVerification {
  switch (exercice.famille) {
    case "A":
      return diagnostiquerAEcran(exercice, phase, valeurs);
    case "B":
      return diagnostiquerBEcran(exercice, phase, valeurs);
    case "C":
      return diagnostiquerCEcran(exercice, phase, valeurs);
    case "D":
      return diagnostiquerDEcran(exercice, phase, valeurs);
    case "E":
      return diagnostiquerEEcran(exercice, phase, valeurs);
  }
}

export function verifierEcran(exercice: ExerciceLieuxGeometriquesParametres, phase: PhaseLieuxGeometriquesParametres, valeurs: string[]): boolean {
  return diagnostiquerEcran(exercice, phase, valeurs) === "correct";
}
