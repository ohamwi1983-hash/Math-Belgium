import type { DecompositionSommeDes, ExerciceDenombCombPurA, ExerciceDenombCombPurB, ExerciceDenombCombPurC, ExerciceDenombCombPurD, ExerciceDenombrementCombinatoirePur } from "../core6e/denombrementCombinatoirePur.types";
import { diagnostiquerValeurCombinatoire, diagnostiquerValeursCombinatoire } from "./expressionCombinatoire";
import type { StatutVerification } from "../moteur/statutVerification";
import type { PhaseDenombrementCombinatoirePur } from "./typesDenombrementCombinatoirePur";

/**
 * Couche B (6e) — vérification propre à `6gen46` (dispatch par famille/phase). N'importe JAMAIS
 * rien de `src/generateurs6e/` (règle non négociable, CLAUDE.md) — voir
 * `generateurs6e/denombrementCombinatoirePur/session.integration.test.ts` pour le seul fichier
 * autorisé Couche A + Couche B ensemble.
 *
 * Toutes les valeurs attendues sont déjà PRÉ-CALCULÉES par la Couche A dans l'exercice. Réutilise
 * `diagnostiquerValeurCombinatoire`/`diagnostiquerValeursCombinatoire`
 * (`moteur6e/expressionCombinatoire.ts`, BigInt, ÉGALITÉ EXACTE — 6gen44) pour TOUT champ
 * numérique/formule, familles A à D indifféremment : cohérent avec l'exigence de la mission
 * ("Toutes les valeurs numériques : égalité exacte (nombres entiers)"), et permet accessoirement à
 * l'élève de taper une formule non réduite (ex. "8*28") plutôt qu'une valeur déjà calculée. Les
 * SEULS écrans de CHOIX (jamais de texte libre) sont le champ "comparaison" de la famille D écran 3
 * (identifiant `correct`/`not_equivalent` uniquement, jamais `parse_error`).
 */

function combinerStatuts(...statuts: StatutVerification[]): StatutVerification {
  if (statuts.some((s) => s === "parse_error")) return "parse_error";
  if (statuts.some((s) => s === "not_equivalent")) return "not_equivalent";
  return "correct";
}

// ============================================================================
// Famille A — Poker.
// ============================================================================

export function diagnostiquerAEcran(exercice: ExerciceDenombCombPurA, phase: PhaseDenombrementCombinatoirePur, valeurs: string[]): StatutVerification {
  if (phase === "aEcran1") return diagnostiquerValeurCombinatoire(valeurs[0] ?? "", exercice.etape1);
  if (phase === "aEcran2") return diagnostiquerValeurCombinatoire(valeurs[0] ?? "", exercice.etape2);
  return diagnostiquerValeurCombinatoire(valeurs[0] ?? "", exercice.resultatFinal);
}

// ============================================================================
// Famille B — Répartition multinomiale (réutilise l'évaluateur BigInt de 6gen44).
// ============================================================================

export function diagnostiquerBEcran(exercice: ExerciceDenombCombPurB, _phase: PhaseDenombrementCombinatoirePur, valeurs: string[]): StatutVerification {
  return diagnostiquerValeurCombinatoire(valeurs[0] ?? "", exercice.resultat);
}

// ============================================================================
// Famille C — Dénombrement avec répétition. Écran unique.
// ============================================================================

export function diagnostiquerCEcran(exercice: ExerciceDenombCombPurC, valeurs: string[]): StatutVerification {
  return diagnostiquerValeurCombinatoire(valeurs[0] ?? "", exercice.resultat);
}

// ============================================================================
// Famille D — Triplets ordonnés pour une somme donnée.
// ============================================================================

/** Marqueur SENTINELLE séparant, dans le tableau `valeurs: string[]` plat imposé par le moteur de
 * session générique, la liste de décompositions saisies pour `s1` de celle saisie pour `s2` (écran
 * 1 uniquement — le seul écran de ce générateur avec 2 listes de taille VARIABLE simultanées,
 * convention "add-as-needed" CLAUDE.md). Chaîne impossible à produire par un parsing valide d'une
 * décomposition (aucun chiffre), donc sans ambiguïté. */
export const SEPARATEUR_LISTES_D = "__SEP__";

/** Parse une décomposition texte ("1,2,6", "1 2 6", "1;2;6"...) en triplet TRIÉ croissant
 * d'entiers dans `[1,6]` — `null` sur toute erreur de syntaxe ou de domaine. */
function parserDecomposition(texte: string): [number, number, number] | null {
  const parties = texte
    .split(/[,;\s]+/)
    .map((p) => p.trim())
    .filter((p) => p !== "");
  if (parties.length !== 3) return null;
  const nombres: number[] = [];
  for (const p of parties) {
    if (!/^\d+$/.test(p)) return null;
    const n = Number(p);
    if (n < 1 || n > 6) return null;
    nombres.push(n);
  }
  nombres.sort((a, b) => a - b);
  return nombres as [number, number, number];
}

function parserListeDecompositions(lignes: string[]): number[][] | null {
  const resultat: number[][] = [];
  for (const ligne of lignes) {
    const parsed = parserDecomposition(ligne);
    if (parsed === null) return null;
    resultat.push(parsed);
  }
  return resultat;
}

/** Compare un ENSEMBLE de triplets soumis à l'ensemble ATTENDU — égal SEULEMENT si même taille, même
 * contenu (aucune manquante, aucune en trop), et AUCUN doublon soumis (compter 2× la même
 * décomposition ne doit jamais compenser une décomposition manquante). */
function ensembleDecompositionsEgal(soumis: number[][], attendu: number[][]): boolean {
  const cle = (t: number[]) => t.join(",");
  const clesSoumis = soumis.map(cle);
  const clesUniquesSoumis = new Set(clesSoumis);
  if (clesUniquesSoumis.size !== clesSoumis.length) return false; // doublon soumis
  const clesAttendu = new Set(attendu.map(cle));
  if (clesUniquesSoumis.size !== clesAttendu.size) return false;
  for (const c of clesAttendu) if (!clesUniquesSoumis.has(c)) return false;
  return true;
}

export function diagnostiquerDEcran1(exercice: ExerciceDenombCombPurD, valeurs: string[]): StatutVerification {
  const idxSep = valeurs.indexOf(SEPARATEUR_LISTES_D);
  if (idxSep === -1) return "parse_error";
  const lignesS1 = valeurs.slice(0, idxSep);
  const lignesS2 = valeurs.slice(idxSep + 1);
  const parsedS1 = parserListeDecompositions(lignesS1);
  const parsedS2 = parserListeDecompositions(lignesS2);
  if (parsedS1 === null || parsedS2 === null) return "parse_error";
  const attenduS1 = exercice.decompositionsS1.map((d) => d.valeurs as number[]);
  const attenduS2 = exercice.decompositionsS2.map((d) => d.valeurs as number[]);
  const ok = ensembleDecompositionsEgal(parsedS1, attenduS1) && ensembleDecompositionsEgal(parsedS2, attenduS2);
  return ok ? "correct" : "not_equivalent";
}

function decompositionsOrdonnees(exercice: ExerciceDenombCombPurD): DecompositionSommeDes[] {
  return [...exercice.decompositionsS1, ...exercice.decompositionsS2];
}

export function diagnostiquerDEcran2(exercice: ExerciceDenombCombPurD, valeurs: string[]): StatutVerification {
  const attendu = decompositionsOrdonnees(exercice).map((d) => d.arrangements);
  return diagnostiquerValeursCombinatoire(valeurs, attendu);
}

export function diagnostiquerDEcran3(exercice: ExerciceDenombCombPurD, valeurs: string[]): StatutVerification {
  const statutTotaux = diagnostiquerValeursCombinatoire([valeurs[0] ?? "", valeurs[1] ?? ""], [exercice.totalS1, exercice.totalS2]);
  const statutComparaison: StatutVerification = valeurs[2] === exercice.comparaison ? "correct" : "not_equivalent";
  return combinerStatuts(statutTotaux, statutComparaison);
}

export function diagnostiquerDEcran(exercice: ExerciceDenombCombPurD, phase: PhaseDenombrementCombinatoirePur, valeurs: string[]): StatutVerification {
  if (phase === "dEcran1") return diagnostiquerDEcran1(exercice, valeurs);
  if (phase === "dEcran2") return diagnostiquerDEcran2(exercice, valeurs);
  return diagnostiquerDEcran3(exercice, valeurs);
}

// ============================================================================
// Dispatcher générique.
// ============================================================================

export function diagnostiquerEcran(exercice: ExerciceDenombrementCombinatoirePur, phase: PhaseDenombrementCombinatoirePur, valeurs: string[]): StatutVerification {
  switch (exercice.famille) {
    case "A":
      return diagnostiquerAEcran(exercice, phase, valeurs);
    case "B":
      return diagnostiquerBEcran(exercice, phase, valeurs);
    case "C":
      return diagnostiquerCEcran(exercice, valeurs);
    case "D":
      return diagnostiquerDEcran(exercice, phase, valeurs);
  }
}

export function verifierEcran(exercice: ExerciceDenombrementCombinatoirePur, phase: PhaseDenombrementCombinatoirePur, valeurs: string[]): boolean {
  return diagnostiquerEcran(exercice, phase, valeurs) === "correct";
}
