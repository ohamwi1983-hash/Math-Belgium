import type { ExerciceTransfoA, ExerciceTransfoB, ExerciceTransfoC, ExerciceTransfoD, ExerciceTransformationsPlan } from "../core6e/transformationsPlan.types";
import type { StatutVerification } from "../moteur/statutVerification";
import { diagnostiquerAngle, diagnostiquerValeur } from "./equivalenceExponentielle";
import { evaluerValeurComplexe } from "./expressionComplexe";
import { TOLERANCE_COMPLEXE, diagnostiquerComplexe } from "./verificationComplexes";
import type { Complexe } from "./verificationComplexes";
import type { PhaseTransformationsPlan } from "./typesTransformationsPlan";

/**
 * Couche B (6e) — vérification propre à `6gen40` (dispatch par famille/écran). N'importe JAMAIS
 * rien de `src/generateurs6e/` (règle non négociable, CLAUDE.md) — voir
 * `generateurs6e/transformationsPlan/session.integration.test.ts` pour le seul fichier autorisé
 * Couche A + Couche B ensemble.
 *
 * Réutilise TELLE QUELLE la fondation chapitre 7 : `diagnostiquerComplexe`
 * (`moteur6e/verificationComplexes.ts`, `6gen34`) pour tout champ "affixe a+bi" (écran 2 famille A,
 * écran 1 famille B, vecteur famille B écran 2, écran 3 famille C) ; `diagnostiquerValeur`
 * (`moteur6e/equivalenceExponentielle.ts`, chapitre 2) pour tout champ réel simple (module, angle) —
 * cet évaluateur supporte nativement `sqrt`/`pi`/les fractions, nécessaire pour le module d'un point
 * "quart" (ex. `2\sqrt2`, famille B/C).
 *
 * ============================================================================
 * **Écran famille A, écran 1 — QCM "poser la formule", pas de saisie libre**
 * ============================================================================
 * `valeurs[0]` est l'identifiant de l'option choisie, TOUJOURS `"correct"` pour l'option correcte
 * (voir `ui6e/formatTransformationsPlan.ts`, `optionsFormuleA`) — jamais de `parse_error` possible
 * (bouton, pas de texte libre), même patron que `diagnostiquerBEcran1`/`diagnostiquerCEcran1` de
 * `moteur6e/verificationAffixesRacines.ts` (6gen35).
 *
 * ============================================================================
 * **Famille B, écran 2 — nature imposée (audit 6e ch. 5, point 41)** : voir `diagnostiquerBEcran2`.
 * Tous les ANGLES saisis sont comparés à 2kπ près via `diagnostiquerAngle` (point 3).
 */

function combinerStatuts(...statuts: StatutVerification[]): StatutVerification {
  if (statuts.some((s) => s === "parse_error")) return "parse_error";
  if (statuts.some((s) => s === "not_equivalent")) return "not_equivalent";
  return "correct";
}

// ============================================================================
// Famille A.
// ============================================================================

export function diagnostiquerAEcran1(exercice: ExerciceTransfoA, valeurs: string[]): StatutVerification {
  void exercice;
  return valeurs[0] === "correct" ? "correct" : "not_equivalent";
}
export function diagnostiquerAEcran2(exercice: ExerciceTransfoA, valeurs: string[]): StatutVerification {
  return diagnostiquerComplexe(valeurs[0], { re: exercice.image.a, im: exercice.image.b });
}

// ============================================================================
// Famille B.
// ============================================================================

export function diagnostiquerBEcran1(exercice: ExerciceTransfoB, valeurs: string[]): StatutVerification {
  return diagnostiquerComplexe(valeurs[0], { re: exercice.zResultat.a, im: exercice.zResultat.b });
}

/** Écran 2 — la nature de la transformation est désormais IMPOSÉE par la consigne (audit 6e ch. 5,
 * point 41 : demander « translation ou similitude ? » juste après avoir lu le symbole + ou ·
 * n'évaluait rien) ; la consigne précise aussi le point de départ (M = image de A, P = image de A),
 * donc une seule lecture est attendue : vecteur z_B (somme), rapport r_B et angle θ_B à 2π près
 * (produit). `valeurs` : `[vecteur]` ou `[rapport, angle]`. */
export function diagnostiquerBEcran2(exercice: ExerciceTransfoB, valeurs: string[]): StatutVerification {
  if (exercice.sousType === "somme") return diagnostiquerComplexe(valeurs[0] ?? "", { re: exercice.zB.a, im: exercice.zB.b });
  return combinerStatuts(diagnostiquerValeur(valeurs[0] ?? "", exercice.rB), diagnostiquerAngle(valeurs[1] ?? "", exercice.angleB.numerique).statut);
}

// ============================================================================
// Famille C.
// ============================================================================

export function diagnostiquerCEcran1(exercice: ExerciceTransfoC, valeurs: string[]): StatutVerification {
  return combinerStatuts(diagnostiquerValeur(valeurs[0], exercice.moduleCommun), diagnostiquerValeur(valeurs[1], exercice.moduleCommun));
}
/** Angle accepté à 2kπ près (audit 6e ch. 5, point 3 : 3π/2 pour −π/2 était refusé). */
export function diagnostiquerCEcran2(exercice: ExerciceTransfoC, valeurs: string[]): StatutVerification {
  return diagnostiquerAngle(valeurs[0], exercice.angleRotation.numerique).statut;
}

/**
 * Ensemble de N affixes (a+bi), ORDRE INDIFFÉRENT, COMPTE EXACT requis — mirroir STRUCTUREL de
 * `diagnostiquerRacinesCarrees` (`moteur6e/verificationAffixesRacines.ts`, 6gen35), généralisé à N
 * quelconque (au lieu de 2 fixe) : soumettre moins d'images que de points donnés, même toutes
 * correctes, retourne `"not_equivalent"`, JAMAIS `"correct"` en acceptant un sous-ensemble.
 */
export function diagnostiquerImagesRotation(textes: string[], cibles: Complexe[], tolerance: number = TOLERANCE_COMPLEXE): StatutVerification {
  // Lecture AVANT le contrôle du compte : une écriture illisible reste un `parse_error` (tentative
  // non décomptée) même si le nombre d'images est incomplet.
  const valeurs: Complexe[] = [];
  for (const t of textes) {
    const v = evaluerValeurComplexe(t);
    if (v === null) return "parse_error";
    valeurs.push(v);
  }
  if (textes.length !== cibles.length) return "not_equivalent";
  const restantes = [...cibles];
  for (const v of valeurs) {
    const index = restantes.findIndex((c) => Math.abs(c.re - v.re) <= tolerance && Math.abs(c.im - v.im) <= tolerance);
    if (index === -1) return "not_equivalent";
    restantes.splice(index, 1);
  }
  return "correct";
}

export function diagnostiquerCEcran3(exercice: ExerciceTransfoC, valeurs: string[]): StatutVerification {
  const cibles: Complexe[] = exercice.imagesAutresPoints.map((p) => ({ re: p.a, im: p.b }));
  return diagnostiquerImagesRotation(valeurs, cibles);
}

// ============================================================================
// Famille D — z′ = az + b (audit 6e ch. 5, point 42).
// ============================================================================

/** Écran 1 — choix de la nature (identifiant de l'option). */
export function diagnostiquerDEcran1(exercice: ExerciceTransfoD, valeurs: string[]): StatutVerification {
  return valeurs[0] === exercice.nature ? "correct" : "not_equivalent";
}

/** Écran 2 — éléments caractéristiques, champs selon la nature (voir `champsD`) :
 * translation `[vecteur]` ; rotation `[centre, angle]` ; homothétie `[centre, rapport k]` ;
 * similitude `[centre, rapport, angle]`. Angles à 2kπ près. */
export function diagnostiquerDEcran2(exercice: ExerciceTransfoD, valeurs: string[]): StatutVerification {
  const v = (i: number) => valeurs[i] ?? "";
  if (exercice.nature === "translation" || exercice.centre === null) return diagnostiquerComplexe(v(0), { re: exercice.b.a, im: exercice.b.b });
  const statutCentre = diagnostiquerComplexe(v(0), { re: exercice.centre.a, im: exercice.centre.b });
  if (exercice.nature === "rotation") return combinerStatuts(statutCentre, diagnostiquerAngle(v(1), exercice.angle.numerique).statut);
  if (exercice.nature === "homothetie") return combinerStatuts(statutCentre, diagnostiquerValeur(v(1), exercice.rapport));
  return combinerStatuts(statutCentre, diagnostiquerValeur(v(1), exercice.rapport), diagnostiquerAngle(v(2), exercice.angle.numerique).statut);
}

// ============================================================================
// Dispatcher générique (mirroir 6gen37).
// ============================================================================

export function diagnostiquerEcran(exercice: ExerciceTransformationsPlan, phase: PhaseTransformationsPlan, valeurs: string[]): StatutVerification {
  switch (phase) {
    case "aEcran1":
      return diagnostiquerAEcran1(exercice as ExerciceTransfoA, valeurs);
    case "aEcran2":
      return diagnostiquerAEcran2(exercice as ExerciceTransfoA, valeurs);
    case "bEcran1":
      return diagnostiquerBEcran1(exercice as ExerciceTransfoB, valeurs);
    case "bEcran2":
      return diagnostiquerBEcran2(exercice as ExerciceTransfoB, valeurs);
    case "cEcran1":
      return diagnostiquerCEcran1(exercice as ExerciceTransfoC, valeurs);
    case "cEcran2":
      return diagnostiquerCEcran2(exercice as ExerciceTransfoC, valeurs);
    case "cEcran3":
      return diagnostiquerCEcran3(exercice as ExerciceTransfoC, valeurs);
    case "dEcran1":
      return diagnostiquerDEcran1(exercice as ExerciceTransfoD, valeurs);
    case "dEcran2":
      return diagnostiquerDEcran2(exercice as ExerciceTransfoD, valeurs);
  }
}

export function verifierEcran(exercice: ExerciceTransformationsPlan, phase: PhaseTransformationsPlan, valeurs: string[]): boolean {
  return diagnostiquerEcran(exercice, phase, valeurs) === "correct";
}
