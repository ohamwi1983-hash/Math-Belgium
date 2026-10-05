/**
 * Couche B (5e) — vérification pour 5gen17 ("Problèmes classiques sur les suites"). Réutilise
 * `evaluerExpressionGenerale` (cross-chantier, déjà établi) pour tout champ numérique en texte
 * libre (accepte fractions/racines/pi). `combinerStatuts`/`statutNumerique`/`toleranceLarge` sont
 * RÉPLIQUÉS localement (même principe que `verificationProblemesContexte.ts`, 5gen5) — seules de
 * minuscules primitives génériques traversent la frontière de chantier, jamais un module de
 * vérification entier ; `src/moteur5e/` n'importe JAMAIS `src/generateurs5e/`, donc les quelques
 * formules pures nécessaires ici (somme géométrique finie) sont dupliquées localement.
 */
import type {
  ExerciceCarresEmboites,
  ExerciceEchiquier,
  ExerciceFibonacci,
  ExercicePapyrusRhind,
  ExerciceSuiteClassique,
  ExerciceSuitesCombinees,
  ExerciceTrianglesZigzag,
  ExerciceVitesse,
} from "../core5e/suitesClassiques.types";
import { evaluerExpressionGenerale } from "../moteur/expressionGenerale";
import type { StatutVerification } from "../moteur/statutVerification";
import type { PhaseSuiteClassique } from "./typesSuiteClassique";

export const TOLERANCE_PRECISE = 0.01;
export const TOLERANCE_ARRONDIE = 0.5;

function sommeGeometriqueFinieLocal(u1: number, q: number, n: number): number {
  if (q === 1) return n * u1;
  return (u1 * (1 - Math.pow(q, n))) / (1 - q);
}

export function statutNumerique(valeur: number, cible: number, tolerance: number): StatutVerification {
  if (!Number.isFinite(valeur)) return "parse_error";
  return Math.abs(valeur - cible) <= tolerance ? "correct" : "not_equivalent";
}

export function combinerStatuts(...statuts: StatutVerification[]): StatutVerification {
  if (statuts.some((s) => s === "parse_error")) return "parse_error";
  return statuts.every((s) => s === "correct") ? "correct" : "not_equivalent";
}

/** Tolérance relative (0,1%) + plancher — pour les très grandes valeurs de l'échiquier, où une
 * comparaison absolue serait soit inutilement stricte soit inutilement large selon l'ordre de
 * grandeur. */
function toleranceRelative(cible: number, fraction: number, plancher: number): number {
  return Math.max(plancher, Math.abs(cible) * fraction);
}

export function diagnostiquerNombreTexte(texte: string, cible: number, tolerance: number): StatutVerification {
  try {
    const valeur = evaluerExpressionGenerale(texte, 0);
    return statutNumerique(valeur, cible, tolerance);
  } catch {
    return "parse_error";
  }
}

/** Comparaison ORDONNÉE (pas un ensemble) — chaque texte à sa position correspond à la cible de
 * même position, pour une liste de termes/valeurs dont l'ordre est structurellement significatif
 * (ex. les 5 termes du papyrus de Rhind, dans l'ordre croissant). */
export function diagnostiquerListeTexte(textes: string[], cibles: number[], tolerance: number): StatutVerification {
  if (textes.length !== cibles.length) return "not_equivalent";
  return combinerStatuts(...textes.map((t, i) => diagnostiquerNombreTexte(t, cibles[i], tolerance)));
}

// ============================================================================
// echiquier
// ============================================================================
/** `exercice.u64`/`exercice.sommeTotale` sont des `bigint` (2⁶³/2⁶⁴−1 dépassent
 * `Number.MAX_SAFE_INTEGER`, voir `core5e/suitesClassiques.types.ts`) — converti en `Number`
 * UNIQUEMENT ici, au point de comparaison à tolérance avec la saisie élève (jamais pour un
 * affichage : `Number(bigint)` perd de la précision, acceptable seulement pour une comparaison à
 * tolérance relative 0,1%, motif déjà établi ailleurs sur ce chantier). */
export function diagnostiquerU64(texte: string, exercice: ExerciceEchiquier): StatutVerification {
  const cible = Number(exercice.u64);
  return diagnostiquerNombreTexte(texte, cible, toleranceRelative(cible, 0.001, 1));
}
export function diagnostiquerSommeTotaleEchiquier(texte: string, exercice: ExerciceEchiquier): StatutVerification {
  const cible = Number(exercice.sommeTotale);
  return diagnostiquerNombreTexte(texte, cible, toleranceRelative(cible, 0.001, 1));
}
/** `textes` = [poidsTotalTonnes, facteurComparaison], dans cet ordre. */
export function diagnostiquerPoidsComparaison(textes: string[], exercice: ExerciceEchiquier): StatutVerification {
  if (textes.length !== 2) return "not_equivalent";
  return combinerStatuts(
    diagnostiquerNombreTexte(textes[0], exercice.poidsTotalTonnes, toleranceRelative(exercice.poidsTotalTonnes, 0.02, 1)),
    diagnostiquerNombreTexte(textes[1], exercice.facteurComparaison, toleranceRelative(exercice.facteurComparaison, 0.02, 1)),
  );
}

// ============================================================================
// papyrusRhind
// ============================================================================
export type ChoixSysteme = "correct" | "sommeSeule" | "sansContrainte" | "produitInverse";
export function diagnostiquerPoserSysteme(choix: ChoixSysteme): boolean {
  return choix === "correct";
}
/** `textes` = [a, delta], dans cet ordre. */
export function diagnostiquerResoudreSysteme(textes: string[], exercice: ExercicePapyrusRhind): StatutVerification {
  if (textes.length !== 2) return "not_equivalent";
  return diagnostiquerListeTexte(textes, [exercice.a, exercice.delta], TOLERANCE_PRECISE);
}
export function diagnostiquerSuiteFinalePapyrus(textes: string[], exercice: ExercicePapyrusRhind): StatutVerification {
  return diagnostiquerListeTexte(textes, exercice.termes, TOLERANCE_PRECISE);
}

// ============================================================================
// suitesCombinees
// ============================================================================
export type ChoixEquationCombinees = "correct" | "yzSeul" | "sommeXYZ" | "carreSeul";
export function diagnostiquerPoserEquationCombinees(choix: ChoixEquationCombinees): boolean {
  return choix === "correct";
}
export function diagnostiquerResoudreRCombinees(texte: string, exercice: ExerciceSuitesCombinees): StatutVerification {
  return diagnostiquerNombreTexte(texte, exercice.r, TOLERANCE_PRECISE);
}
export function diagnostiquerSuitesFinalesCombinees(reponse: { arithmetique: string[]; geometrique: string[] }, exercice: ExerciceSuitesCombinees): StatutVerification {
  return combinerStatuts(
    diagnostiquerListeTexte(reponse.arithmetique, exercice.arithmetique, TOLERANCE_PRECISE),
    diagnostiquerListeTexte(reponse.geometrique, exercice.geometrique, TOLERANCE_PRECISE),
  );
}

// ============================================================================
// vitesse
// ============================================================================
export function diagnostiquerDistance11(texte: string, exercice: ExerciceVitesse): StatutVerification {
  return diagnostiquerNombreTexte(texte, exercice.distance11, TOLERANCE_PRECISE);
}
export function diagnostiquerSommeTotale11(texte: string, exercice: ExerciceVitesse): StatutVerification {
  return diagnostiquerNombreTexte(texte, exercice.sommeTotale11, TOLERANCE_PRECISE);
}
export function diagnostiquerTroisMethodes(textes: string[], exercice: ExerciceVitesse): StatutVerification {
  return diagnostiquerListeTexte(textes, [exercice.vitesseMethode1KmH, exercice.vitesseMethode2KmH, exercice.vitesseMethode3KmH], TOLERANCE_ARRONDIE);
}

// ============================================================================
// fibonacci
// ============================================================================
export function diagnostiquerDixTermes(textes: string[], exercice: ExerciceFibonacci): StatutVerification {
  return diagnostiquerListeTexte(textes, exercice.dixPremiersTermes, TOLERANCE_PRECISE);
}
export type ChoixFormuleRecurrence = "correct" | "sommeTousLesTermes" | "differenceConstante" | "produitConstant";
export function diagnostiquerFormuleRecurrence(choix: ChoixFormuleRecurrence): boolean {
  return choix === "correct";
}
export function diagnostiquerCalculV5(texte: string, exercice: ExerciceFibonacci): StatutVerification {
  return diagnostiquerNombreTexte(texte, exercice.v5, TOLERANCE_PRECISE);
}
export function diagnostiquerResoudrePhi(texte: string, exercice: ExerciceFibonacci): StatutVerification {
  return diagnostiquerNombreTexte(texte, exercice.phi, 0.001);
}
export type ChoixProprieteInverse = "phiMoinsUn" | "phiPlusUn" | "unMoinsPhi" | "phiCarre";
export function diagnostiquerProprieteInverse(choix: ChoixProprieteInverse): boolean {
  return choix === "phiMoinsUn";
}

// ============================================================================
// trianglesZigzag
// ============================================================================
export function diagnostiquerHauteursZigzag(textes: string[], exercice: ExerciceTrianglesZigzag): StatutVerification {
  return diagnostiquerListeTexte(textes, exercice.hauteurs, TOLERANCE_PRECISE);
}
export function diagnostiquerAiresZigzag(textes: string[], exercice: ExerciceTrianglesZigzag): StatutVerification {
  return diagnostiquerListeTexte(textes, exercice.aires, TOLERANCE_PRECISE);
}
export type ChoixLongueurZigzag = "resteEgaleADeux" | "tendVersZero" | "tendVersInfini" | "tendVersRacine3";
export function diagnostiquerLongueurZigzag(choix: ChoixLongueurZigzag): boolean {
  return choix === "resteEgaleADeux";
}
export function diagnostiquerAiresZigzagAC(textes: string[], exercice: ExerciceTrianglesZigzag): StatutVerification {
  return diagnostiquerListeTexte(textes, exercice.airesEntreZigzagEtAC, TOLERANCE_PRECISE);
}

// ============================================================================
// carresEmboites
// ============================================================================
export function diagnostiquerSommePartielleA(texte: string, exercice: ExerciceCarresEmboites): StatutVerification {
  const cible = sommeGeometriqueFinieLocal(exercice.u1A, exercice.qA, 5);
  return diagnostiquerNombreTexte(texte, cible, TOLERANCE_PRECISE);
}
export type ChoixLimitePuissanceA = "zero" | "unQuart" | "un" | "infini";
export function diagnostiquerLimitePuissanceA(choix: ChoixLimitePuissanceA): boolean {
  return choix === "zero";
}
export function diagnostiquerSommeInfinieA(texte: string, exercice: ExerciceCarresEmboites): StatutVerification {
  return diagnostiquerNombreTexte(texte, exercice.sommeInfinieA, TOLERANCE_PRECISE);
}
export function diagnostiquerAiresB(textes: string[], exercice: ExerciceCarresEmboites): StatutVerification {
  return diagnostiquerListeTexte(textes, exercice.airesB, TOLERANCE_PRECISE);
}
export function diagnostiquerSommeInfinieB(texte: string, exercice: ExerciceCarresEmboites): StatutVerification {
  return diagnostiquerNombreTexte(texte, exercice.sommeInfinieB, TOLERANCE_PRECISE);
}

// ============================================================================
// A.2 — statut à 3 valeurs PAR CHAMP pour les phases "liste" (highlight rouge indépendant par
// champ, sur `EtapeListeChampsClassique.tsx`). Mêmes cibles/tolérances que le diagnostic combiné
// de chaque phase ci-dessus, jamais recalculées indépendamment.
// ============================================================================
/** Cible + tolérance de CHAQUE champ, dans l'ordre affiché — `null` pour toute phase hors "liste"
 * (QCM, champ simple, ou `suitesFinalesCombinees` couvert séparément ci-dessous). */
export function champsListe(exercice: ExerciceSuiteClassique, phase: PhaseSuiteClassique): { cible: number; tolerance: number }[] | null {
  switch (phase) {
    case "poidsComparaison": {
      const e = exercice as ExerciceEchiquier;
      return [
        { cible: e.poidsTotalTonnes, tolerance: toleranceRelative(e.poidsTotalTonnes, 0.02, 1) },
        { cible: e.facteurComparaison, tolerance: toleranceRelative(e.facteurComparaison, 0.02, 1) },
      ];
    }
    case "resoudreSysteme": {
      const e = exercice as ExercicePapyrusRhind;
      return [
        { cible: e.a, tolerance: TOLERANCE_PRECISE },
        { cible: e.delta, tolerance: TOLERANCE_PRECISE },
      ];
    }
    case "suiteFinalePapyrus":
      return (exercice as ExercicePapyrusRhind).termes.map((cible) => ({ cible, tolerance: TOLERANCE_PRECISE }));
    case "troisMethodes": {
      const e = exercice as ExerciceVitesse;
      return [e.vitesseMethode1KmH, e.vitesseMethode2KmH, e.vitesseMethode3KmH].map((cible) => ({ cible, tolerance: TOLERANCE_ARRONDIE }));
    }
    case "dixTermes":
      return (exercice as ExerciceFibonacci).dixPremiersTermes.map((cible) => ({ cible, tolerance: TOLERANCE_PRECISE }));
    case "hauteursZigzag":
      return (exercice as ExerciceTrianglesZigzag).hauteurs.map((cible) => ({ cible, tolerance: TOLERANCE_PRECISE }));
    case "airesZigzag":
      return (exercice as ExerciceTrianglesZigzag).aires.map((cible) => ({ cible, tolerance: TOLERANCE_PRECISE }));
    case "airesZigzagAC":
      return (exercice as ExerciceTrianglesZigzag).airesEntreZigzagEtAC.map((cible) => ({ cible, tolerance: TOLERANCE_PRECISE }));
    case "airesB":
      return (exercice as ExerciceCarresEmboites).airesB.map((cible) => ({ cible, tolerance: TOLERANCE_PRECISE }));
    default:
      return null;
  }
}

export function diagnostiquerChampListe(texte: string, index: number, exercice: ExerciceSuiteClassique, phase: PhaseSuiteClassique): StatutVerification {
  const champs = champsListe(exercice, phase);
  if (!champs || index < 0 || index >= champs.length) return "parse_error";
  return diagnostiquerNombreTexte(texte, champs[index].cible, champs[index].tolerance);
}

/** Même principe que `diagnostiquerChampListe`, pour l'écran bespoke "suitesFinalesCombinees"
 * (2 groupes de 3 champs). */
export function diagnostiquerChampSuitesFinalesCombinees(groupe: "arithmetique" | "geometrique", index: number, texte: string, exercice: ExerciceSuitesCombinees): StatutVerification {
  const cible = exercice[groupe][index];
  return diagnostiquerNombreTexte(texte, cible, TOLERANCE_PRECISE);
}
