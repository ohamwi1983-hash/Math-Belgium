import type { ExerciceTransfoA, ExerciceTransfoB, ExerciceTransfoC, ExerciceTransformationsPlan } from "../core6e/transformationsPlan.types";
import type { StatutVerification } from "../moteur/statutVerification";
import { diagnostiquerValeur } from "./equivalenceExponentielle";
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
 * **Famille B, écran 2 — champ structuré "type + paramètres", statut combiné documenté ici**
 * ============================================================================
 * Pas de nouveau type `StatutVerification` : le champ structuré (choix `.btn.toggle-active`
 * "translation"/"similitude" PUIS 1 ou 2 champs texte selon le choix, voir
 * `components6e/EtapeTypeParametresTransformationsPlan.tsx`) est encodé dans `valeurs: string[]`
 * comme tous les autres écrans du générateur — `valeurs[0]` = type choisi, `valeurs[1]` (+
 * `valeurs[2]` si similitude) = paramètre(s). `"parse_error"` si le(s) champ(s) paramètre ne
 * peuvent pas être évalués DU TOUT (quel que soit le type choisi) ; `"not_equivalent"` si le type
 * est faux OU si les paramètres, bien qu'évaluables, ne correspondent à AUCUNE des 2 lectures
 * valables (`z_A+z_B` ⟺ translation par `z_B` OU par `z_A` — voir en-tête `familleB.ts` ;
 * `z_A·z_B` ⟺ similitude de rapport/angle ceux de A OU ceux de B) ; `"correct"` sinon.
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

/** `texte` accepté s'il correspond à `zA` OU `zB` (translation symétrique — voir en-tête
 * `core6e/transformationsPlan.types.ts`/`familleB.ts`). */
function statutVecteurTranslation(texte: string, exercice: ExerciceTransfoB): StatutVerification {
  const versA = diagnostiquerComplexe(texte, { re: exercice.zA.a, im: exercice.zA.b });
  if (versA === "correct") return "correct";
  if (versA === "parse_error") return "parse_error";
  return diagnostiquerComplexe(texte, { re: exercice.zB.a, im: exercice.zB.b });
}

function statutPaireModuleAngle(rapportTexte: string, angleTexte: string, r: number, angleNumerique: number): StatutVerification {
  const statutR = diagnostiquerValeur(rapportTexte, r);
  const statutAngle = diagnostiquerValeur(angleTexte, angleNumerique);
  return combinerStatuts(statutR, statutAngle);
}

/** `(rapport,angle)` acceptés s'ils correspondent EXACTEMENT à la paire de A OU à la paire de B
 * (jamais un mélange rapport de A + angle de B) — voir en-tête `core6e/transformationsPlan.types.ts`/
 * `familleB.ts`. */
function statutPaireSimilitude(rapportTexte: string, angleTexte: string, exercice: ExerciceTransfoB): StatutVerification {
  const versA = statutPaireModuleAngle(rapportTexte, angleTexte, exercice.rA, exercice.angleA.numerique);
  if (versA === "correct") return "correct";
  if (versA === "parse_error") return "parse_error";
  return statutPaireModuleAngle(rapportTexte, angleTexte, exercice.rB, exercice.angleB.numerique);
}

export function diagnostiquerBEcran2(exercice: ExerciceTransfoB, valeurs: string[]): StatutVerification {
  const typeChoisi = valeurs[0];
  const typeCorrect = exercice.sousType === "somme" ? "translation" : "similitude";

  const statutParametres = typeChoisi === "translation" ? statutVecteurTranslation(valeurs[1] ?? "", exercice) : statutPaireSimilitude(valeurs[1] ?? "", valeurs[2] ?? "", exercice);

  if (statutParametres === "parse_error") return "parse_error";
  if (typeChoisi !== typeCorrect) return "not_equivalent";
  return statutParametres;
}

// ============================================================================
// Famille C.
// ============================================================================

export function diagnostiquerCEcran1(exercice: ExerciceTransfoC, valeurs: string[]): StatutVerification {
  return combinerStatuts(diagnostiquerValeur(valeurs[0], exercice.moduleCommun), diagnostiquerValeur(valeurs[1], exercice.moduleCommun));
}
export function diagnostiquerCEcran2(exercice: ExerciceTransfoC, valeurs: string[]): StatutVerification {
  return diagnostiquerValeur(valeurs[0], exercice.angleRotation.numerique);
}

/**
 * Ensemble de N affixes (a+bi), ORDRE INDIFFÉRENT, COMPTE EXACT requis — mirroir STRUCTUREL de
 * `diagnostiquerRacinesCarrees` (`moteur6e/verificationAffixesRacines.ts`, 6gen35), généralisé à N
 * quelconque (au lieu de 2 fixe) : soumettre moins d'images que de points donnés, même toutes
 * correctes, retourne `"not_equivalent"`, JAMAIS `"correct"` en acceptant un sous-ensemble.
 */
export function diagnostiquerImagesRotation(textes: string[], cibles: Complexe[], tolerance: number = TOLERANCE_COMPLEXE): StatutVerification {
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

export function diagnostiquerCEcran3(exercice: ExerciceTransfoC, valeurs: string[]): StatutVerification {
  const cibles: Complexe[] = exercice.imagesAutresPoints.map((p) => ({ re: p.a, im: p.b }));
  return diagnostiquerImagesRotation(valeurs, cibles);
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
  }
}

export function verifierEcran(exercice: ExerciceTransformationsPlan, phase: PhaseTransformationsPlan, valeurs: string[]): boolean {
  return diagnostiquerEcran(exercice, phase, valeurs) === "correct";
}
