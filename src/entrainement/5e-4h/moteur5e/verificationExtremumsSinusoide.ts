/**
 * Couche B (5e) — vérification pour 5gen11 ("Extremums d'une fonction sinusoïdale"). N'importe
 * jamais rien de `src/generateurs5e/`. Réutilise DIRECTEMENT `diagnostiquerBranches`/
 * `diagnostiquerEnsembleNumerique` (`moteur5e/verificationEquationTrig.ts`, 5gen10, moteur→moteur
 * déjà établi ailleurs sur la plateforme) : `brancheU`/`brancheX` de 5gen11 sont structurellement
 * identiques à une `BrancheCible` (`{constante, periode}`) de 5gen10 une fois wrappées en
 * `ValeurPiOuDecimale` — `a`/`bArg` étant TOUJOURS des `RationnelPi` exacts (jamais de régime
 * décimal ici), le wrapping est trivial (`exact: v` systématique).
 *
 * B.1 — écran 1, changement de comportement (pas seulement de texte) : la réponse ATTENDUE est
 * désormais l'équation COMPLÈTE, argument substitué ("ax+bArg = constante+k·période"), jamais la
 * forme abstraite "u=...". `diagnostiquerPoserEquationExtremum` sépare donc le texte soumis en
 * membre gauche/droit (sur le PREMIER "=" seulement) et vérifie CHACUN indépendamment :
 * - membre gauche : doit être la fonction AFFINE "a·x+bArg" EXACTE de l'exercice (pas une forme
 *   affine quelconque) — extraite par évaluation en x=0/x=1 (`evaluerExpressionGenerale`, qui
 *   interprète nativement le jeton "x", contrairement à "k"/"n" qui doivent être substitués à la
 *   main ailleurs dans ce fichier) et comparée à (bArg, a) à ±`TOLERANCE_EQUATION_TRIG` près.
 * - membre droit : réutilise `diagnostiquerBranches` TEL QUEL (même primitive que l'ancien écran,
 *   simplement appliquée au membre droit isolé plutôt qu'au texte entier).
 */
import { evaluerExpressionGenerale } from "../moteur/expressionGenerale";
import type { ValeurPiOuDecimale } from "../core5e/equationsTrigonometriques.types";
import type { ExerciceExtremumsSinusoide, RationnelPi } from "../core5e/extremumsSinusoide.types";
import type { StatutVerification } from "../moteur/statutVerification";
import { TOLERANCE_EQUATION_TRIG, diagnostiquerBranches, diagnostiquerEnsembleNumerique } from "./verificationEquationTrig";

/** Dupliquée depuis `generateurs5e/parametresSinusoide/rationnelPi.ts::valeurNumerique` — jamais
 * importée (`src/moteur5e/` n'importe jamais `src/generateurs5e/`, règle non négociable). */
function valeurNumeriqueLocal(v: RationnelPi): number {
  return (v.numerateur / v.denominateur) * Math.PI ** v.degrePi;
}

function versValeur(v: RationnelPi): ValeurPiOuDecimale {
  return { exact: v, decimal: valeurNumeriqueLocal(v) };
}

/** Membre gauche de l'écran 1 — doit être EXACTEMENT "a·x+bArg" (pas une forme affine quelconque) :
 * évalué en x=0 (⟹ bArg) et x=1 (⟹ a+bArg, donc pente=a). `null` ⟺ parse_error (expression
 * illisible, ex. si l'élève y écrit "k" par erreur — "k" n'est pas un identifiant connu de
 * `evaluerExpressionGenerale`, ce qui lève une exception ici, correctement traduite en parse_error).
 * "pi" est reconnu nativement par `evaluerExpressionGenerale` (audit promptauditparsingpisqrt.md),
 * aucune substitution textuelle n'est plus nécessaire ici. */
function evaluerMembreAffineEnX(texte: string): { constante: number; pente: number } | null {
  try {
    const f0 = evaluerExpressionGenerale(texte, 0);
    const f1 = evaluerExpressionGenerale(texte, 1);
    if (!Number.isFinite(f0) || !Number.isFinite(f1)) return null;
    return { constante: f0, pente: f1 - f0 };
  } catch {
    return null;
  }
}

/** Écran 1 — poser l'équation d'extremum COMPLÈTE (B.1) : "a·x+bArg = constante+k·période". */
export function diagnostiquerPoserEquationExtremum(exercice: ExerciceExtremumsSinusoide, texte: string): StatutVerification {
  const parties = texte.split("=");
  if (parties.length !== 2) return "parse_error";
  const [membreGauche, membreDroit] = parties;

  const affine = evaluerMembreAffineEnX(membreGauche);
  if (affine === null) return "parse_error";

  const aVal = valeurNumeriqueLocal(exercice.a);
  const bArgVal = valeurNumeriqueLocal(exercice.bArg);
  if (Math.abs(affine.constante - bArgVal) > TOLERANCE_EQUATION_TRIG || Math.abs(affine.pente - aVal) > TOLERANCE_EQUATION_TRIG) {
    return "not_equivalent";
  }

  return diagnostiquerBranches([membreDroit], [{ constante: versValeur(exercice.brancheU.constante), periode: versValeur(exercice.brancheU.periode) }]);
}

/** Écran 2 — isoler x (x=constante+k·période, UNE SEULE branche). */
export function diagnostiquerIsolerXExtremum(exercice: ExerciceExtremumsSinusoide, texte: string): StatutVerification {
  return diagnostiquerBranches([texte], [{ constante: versValeur(exercice.brancheX.constante), periode: versValeur(exercice.brancheX.periode) }]);
}

/** Écran 3 (bonus) — solutions distinctes dans [0;2π[, équivalence d'ensembles. */
export function diagnostiquerSolutionsExtremum(exercice: ExerciceExtremumsSinusoide, textes: string[]): StatutVerification {
  return diagnostiquerEnsembleNumerique(textes, exercice.solutions);
}
