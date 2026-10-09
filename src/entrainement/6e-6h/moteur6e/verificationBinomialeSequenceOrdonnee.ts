import type { ExerciceBinomialeA, ExerciceBinomialeB, ExerciceBinomialeSequenceOrdonnee } from "../core6e/binomialeSequenceOrdonnee.types";
import type { StatutVerification } from "../moteur/statutVerification";
import type { PhaseBinomialeSequenceOrdonnee } from "./typesBinomialeSequenceOrdonnee";
import { evaluerValeurExponentielle } from "./expressionExponentielle";
import { diagnostiquerValeur } from "./verificationProbabilites";

/**
 * Couche B (6e) — vérification propre à `6gen48` (dispatch par famille/phase). N'importe JAMAIS
 * rien de `src/generateurs6e/` (règle non négociable, CLAUDE.md) — voir
 * `generateurs6e/binomialeSequenceOrdonnee/session.integration.test.ts` pour le seul fichier
 * autorisé Couche A + Couche B ensemble.
 *
 * Réutilise `diagnostiquerValeur` (`moteur6e/verificationProbabilites.ts`, chapitre 8 — voir son
 * en-tête pour le contrat, réexportée par-là depuis `equivalenceExponentielle.ts`) pour tout champ
 * de PROBABILITÉ de la famille A — tolérance par défaut `0,01`, cohérente avec le reste du chapitre
 * 8 (6gen30-33) : les probabilités de la famille A restent dans un ordre de grandeur usuel
 * (`p∈[0,2;0,8]`, `n≤10`), jamais assez petites pour que cette tolérance absolue devienne trompeuse.
 *
 * **Famille B — tolérance DÉDIÉE (`diagnostiquerProduitFinal`), jamais `diagnostiquerValeur`** : le
 * produit `1/(n·(n-1)·...·(n-k+1))` peut descendre jusqu'à `1/95040` (n=12,k=5) — une tolérance
 * ABSOLUE de `0,01` accepterait alors N'IMPORTE QUELLE réponse proche de 0 (y compris `0`
 * lui-même), ce qui viderait la vérification de tout sens pour cette famille. `diagnostiquerProduitFinal`
 * utilise donc une tolérance RELATIVE (2%, avec un plancher absolu `1e-9` pour ne jamais diviser par
 * une cible nulle) : accepte la fraction exacte ("1/5040") comme une décimale raisonnablement
 * arrondie, rejette toujours une erreur de calcul structurelle (ex. un dénominateur oublié/répété,
 * qui change la valeur de bien plus que 2%).
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

/** Compare une liste d'entiers saisie en texte libre (ex. "3,4,5" ou "5, 4, 3") à une liste
 * d'entiers attendus, ORDRE INDIFFÉRENT (l'élève identifie un ENSEMBLE de termes, pas une
 * séquence). `parse_error` si un seul token ne se parse pas ; `not_equivalent` si l'ensemble diffère
 * (nombre de termes ou valeurs). */
function diagnostiquerListeEntiers(texte: string, attendus: number[]): StatutVerification {
  const tokens = texte
    .split(",")
    .map((t) => t.trim())
    .filter((t) => t.length > 0);
  if (tokens.length === 0) return "parse_error";
  const valeurs: number[] = [];
  for (const t of tokens) {
    const v = evaluerValeurExponentielle(t);
    if (v === null) return "parse_error";
    valeurs.push(v);
  }
  if (valeurs.length !== attendus.length) return "not_equivalent";
  const restants = [...attendus];
  for (const v of valeurs) {
    const index = restants.findIndex((a) => Math.abs(a - v) < 1e-9);
    if (index === -1) return "not_equivalent";
    restants.splice(index, 1);
  }
  return "correct";
}

const TOLERANCE_RELATIVE_B = 0.02;
const PLANCHER_ABSOLU_B = 1e-9;

/** Voir en-tête de fichier — tolérance RELATIVE, dédiée aux petites probabilités de la famille B. */
export function diagnostiquerProduitFinal(texte: string, cible: number): StatutVerification {
  const v = evaluerValeurExponentielle(texte);
  if (v === null) return "parse_error";
  const tolerance = Math.max(PLANCHER_ABSOLU_B, Math.abs(cible) * TOLERANCE_RELATIVE_B);
  return Math.abs(v - cible) <= tolerance ? "correct" : "not_equivalent";
}

// ============================================================================
// Famille A.
// ============================================================================

const OPTIONS_STRATEGIE = ["termeUnique", "somme", "complement"] as const;

function diagnostiquerAEcran1(e: ExerciceBinomialeA, valeurs: string[]): StatutVerification {
  const strategieSaisie = valeurs[0];
  if (!OPTIONS_STRATEGIE.includes(strategieSaisie as (typeof OPTIONS_STRATEGIE)[number])) return "not_equivalent";
  const statutStrategie: StatutVerification = strategieSaisie === e.strategie ? "correct" : "not_equivalent";
  const statutListe = diagnostiquerListeEntiers(valeurs[1] ?? "", e.termesACalculer);
  return combinerStatuts(statutStrategie, statutListe);
}

function diagnostiquerAEcran2(e: ExerciceBinomialeA, valeurs: string[]): StatutVerification {
  return diagnostiquerValeurs(valeurs, e.valeursTermes);
}

function diagnostiquerAEcran3(e: ExerciceBinomialeA, valeurs: string[]): StatutVerification {
  return diagnostiquerValeurs(valeurs, [e.resultatFinal]);
}

export function diagnostiquerAEcran(exercice: ExerciceBinomialeSequenceOrdonnee, phase: PhaseBinomialeSequenceOrdonnee, valeurs: string[]): StatutVerification {
  if (exercice.famille !== "A") throw new Error("diagnostiquerAEcran : exercice attendu de famille A");
  if (phase === "aTermeUniqueEcran1" || phase === "aSommeEcran1" || phase === "aComplementEcran1") return diagnostiquerAEcran1(exercice, valeurs);
  if (phase === "aTermeUniqueEcran2" || phase === "aSommeEcran2" || phase === "aComplementEcran2") return diagnostiquerAEcran2(exercice, valeurs);
  return diagnostiquerAEcran3(exercice, valeurs);
}

// ============================================================================
// Famille B.
// ============================================================================

function diagnostiquerBEcran1(e: ExerciceBinomialeB, valeurs: string[]): StatutVerification {
  return diagnostiquerValeurs(valeurs, e.denominateurs);
}

function diagnostiquerBEcran2(e: ExerciceBinomialeB, valeurs: string[]): StatutVerification {
  return diagnostiquerProduitFinal(valeurs[0] ?? "", e.produitFinal);
}

export function diagnostiquerBEcran(exercice: ExerciceBinomialeSequenceOrdonnee, phase: PhaseBinomialeSequenceOrdonnee, valeurs: string[]): StatutVerification {
  if (exercice.famille !== "B") throw new Error("diagnostiquerBEcran : exercice attendu de famille B");
  return phase === "bEcran1" ? diagnostiquerBEcran1(exercice, valeurs) : diagnostiquerBEcran2(exercice, valeurs);
}

// ============================================================================
// Dispatcher générique.
// ============================================================================

export function diagnostiquerEcran(exercice: ExerciceBinomialeSequenceOrdonnee, phase: PhaseBinomialeSequenceOrdonnee, valeurs: string[]): StatutVerification {
  return exercice.famille === "A" ? diagnostiquerAEcran(exercice, phase, valeurs) : diagnostiquerBEcran(exercice, phase, valeurs);
}

export function verifierEcran(exercice: ExerciceBinomialeSequenceOrdonnee, phase: PhaseBinomialeSequenceOrdonnee, valeurs: string[]): boolean {
  return diagnostiquerEcran(exercice, phase, valeurs) === "correct";
}
