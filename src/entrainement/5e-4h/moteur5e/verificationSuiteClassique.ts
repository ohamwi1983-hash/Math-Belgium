/**
 * Couche B (5e) — vérification pour 5gen17 ("Problèmes classiques sur les suites"). Réutilise
 * `evaluerExpressionGenerale` (cross-chantier, déjà établi) pour tout champ numérique en texte
 * libre (accepte fractions/racines/puissances/pi, virgule décimale, « − » typographique).
 * `combinerStatuts`/`statutNumerique` sont RÉPLIQUÉS localement (même principe que
 * `verificationProblemesContexte.ts`, 5gen5) ; `src/moteur5e/` n'importe JAMAIS
 * `src/generateurs5e/`, donc la petite formule de somme géométrique finie est dupliquée ici.
 *
 * Tolérances : chaque consigne annonce sa précision (« arrondi au centième », « au millième »,
 * « à l'unité »), et la tolérance absorbe l'arrondi PROPAGÉ d'une démarche correcte (ex. les 5 parts
 * du papyrus calculées à partir de a et Δ arrondis au centième : jusqu'à 5 × 0,005 d'écart).
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
/** Valeur demandée « arrondie au centième » et réutilisée dans un calcul suivant. */
export const TOLERANCE_PROPAGEE = 0.03;
/** Valeur demandée « arrondie au centième » (calcul direct). */
export const TOLERANCE_CENTIEME = 0.006;
/** Valeur demandée « arrondie au millième ». */
export const TOLERANCE_MILLIEME = 0.0006;
/** Valeur demandée « arrondie à l'unité ». */
export const TOLERANCE_ARRONDIE = 0.51;

function sommeGeometriqueFinieLocal(u1: number, q: number, n: number): number {
  if (q === 1) return n * u1;
  return (u1 * (1 - Math.pow(q, n))) / (1 - q);
}

export function statutNumerique(valeur: number, cible: number, tolerance: number): StatutVerification {
  if (!Number.isFinite(valeur)) return "parse_error";
  return Math.abs(valeur - cible) <= tolerance + 1e-9 ? "correct" : "not_equivalent";
}

export function combinerStatuts(...statuts: StatutVerification[]): StatutVerification {
  if (statuts.some((s) => s === "parse_error")) return "parse_error";
  return statuts.every((s) => s === "correct") ? "correct" : "not_equivalent";
}

/** Tolérance relative + plancher — pour les très grandes valeurs de l'échiquier, où une
 * comparaison absolue serait soit inutilement stricte soit inutilement large. */
function toleranceRelative(cible: number, fraction: number, plancher: number): number {
  return Math.max(plancher, Math.abs(cible) * fraction);
}

/** Espaces de groupement de milliers (« 1 234 567 ») retirés avant l'évaluation : seuls les
 * espaces ENTRE deux chiffres, jamais les autres (« 2 ^ 63 » reste une expression). */
function sansEspacesDeMilliers(texte: string): string {
  return texte.replace(/(\d)[\s  ]+(?=\d{3}\b)/g, "$1");
}

export function diagnostiquerNombreTexte(texte: string, cible: number, tolerance: number): StatutVerification {
  try {
    const valeur = evaluerExpressionGenerale(sansEspacesDeMilliers(texte), 0);
    return statutNumerique(valeur, cible, tolerance);
  } catch {
    return "parse_error";
  }
}

/** Comparaison ORDONNÉE (pas un ensemble) — chaque texte à sa position correspond à la cible de
 * même position. */
export function diagnostiquerListeTexte(textes: string[], cibles: number[], tolerance: number): StatutVerification {
  if (textes.length !== cibles.length) return "not_equivalent";
  return combinerStatuts(...textes.map((t, i) => diagnostiquerNombreTexte(t, cibles[i], tolerance)));
}

// ============================================================================
// echiquier
// ============================================================================
/** `uCase`/`sommeTotale` sont des `bigint` — convertis en `Number` UNIQUEMENT ici, au point de
 * comparaison à tolérance relative (0,1 %). « 2^39 », l'entier complet ou 5,5·10¹¹ conviennent. */
export function diagnostiquerU64(texte: string, exercice: ExerciceEchiquier): StatutVerification {
  const cible = Number(exercice.uCase);
  return diagnostiquerNombreTexte(texte, cible, toleranceRelative(cible, 0.001, 0.5));
}
export function diagnostiquerSommeTotaleEchiquier(texte: string, exercice: ExerciceEchiquier): StatutVerification {
  const cible = Number(exercice.sommeTotale);
  return diagnostiquerNombreTexte(texte, cible, toleranceRelative(cible, 0.001, 0.5));
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
/** « correct » : 5a + 10Δ = S et k(2a + Δ) = 3a + 9Δ. Distracteurs : relation inversée (le piège du
 * papyrus : k fois les 3 plus grandes), somme des parts mal écrite (a + 4Δ = S, la dernière part
 * seule), somme seule (une équation pour deux inconnues). */
export type ChoixSysteme = "correct" | "relationInversee" | "sommeMalEcrite" | "sommeSeule";
export function diagnostiquerPoserSysteme(choix: ChoixSysteme): boolean {
  return choix === "correct";
}
/** `textes` = [a, delta], dans cet ordre. */
export function diagnostiquerResoudreSysteme(textes: string[], exercice: ExercicePapyrusRhind): StatutVerification {
  if (textes.length !== 2) return "not_equivalent";
  return diagnostiquerListeTexte(textes, [exercice.a, exercice.delta], TOLERANCE_PRECISE);
}
export function diagnostiquerSuiteFinalePapyrus(textes: string[], exercice: ExercicePapyrusRhind): StatutVerification {
  return diagnostiquerListeTexte(textes, exercice.termes, TOLERANCE_PROPAGEE);
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
  return diagnostiquerNombreTexte(texte, exercice.distanceN, TOLERANCE_PRECISE);
}
export function diagnostiquerSommeTotale11(texte: string, exercice: ExerciceVitesse): StatutVerification {
  return diagnostiquerNombreTexte(texte, exercice.sommeTotaleN, TOLERANCE_PRECISE);
}
/** `textes` = [vitesse moyenne sur les n secondes, vitesse moyenne pendant la dernière seconde],
 * en km/h arrondies à l'unité. */
export function diagnostiquerTroisMethodes(textes: string[], exercice: ExerciceVitesse): StatutVerification {
  return diagnostiquerListeTexte(textes, [exercice.vitesseMoyenneTotaleKmH, exercice.vitesseDerniereSecondeKmH], TOLERANCE_ARRONDIE);
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
/** vₖ demandé « arrondi au centième » (la fraction exacte convient aussi). */
export function diagnostiquerCalculV5(texte: string, exercice: ExerciceFibonacci): StatutVerification {
  return diagnostiquerNombreTexte(texte, exercice.vk, TOLERANCE_CENTIEME);
}
/** φ demandé « arrondi au centième » : 1,62 accepté (audit 5e ch. 3, point 27), la valeur exacte
 * (1 + √5)/2 aussi ; 1,6 refusé. */
export function diagnostiquerResoudrePhi(texte: string, exercice: ExerciceFibonacci): StatutVerification {
  return diagnostiquerNombreTexte(texte, exercice.phi, TOLERANCE_CENTIEME);
}
export type ChoixProprieteInverse = "phiMoinsUn" | "phiPlusUn" | "unMoinsPhi" | "phiCarre";
export function diagnostiquerProprieteInverse(choix: ChoixProprieteInverse): boolean {
  return choix === "phiMoinsUn";
}

// ============================================================================
// trianglesZigzag
// ============================================================================
/** ℓ₁…ℓ₄ : valeurs exactes ou arrondies au centième. */
export function diagnostiquerHauteursZigzag(textes: string[], exercice: ExerciceTrianglesZigzag): StatutVerification {
  return diagnostiquerListeTexte(textes, exercice.longueurs, TOLERANCE_CENTIEME);
}
/** Longueur totale limite 2ℓ₁ = c√3 — calculée à partir de ℓ₁ arrondi au centième : tolérance
 * propagée. */
export function diagnostiquerLongueurZigzag(texte: string, exercice: ExerciceTrianglesZigzag): StatutVerification {
  return diagnostiquerNombreTexte(texte, exercice.longueurLimite, TOLERANCE_PROPAGEE);
}
/** A₁…A₃ des triangles emboîtés Tₖ : exactes ou arrondies au centième. */
export function diagnostiquerAiresZigzag(textes: string[], exercice: ExerciceTrianglesZigzag): StatutVerification {
  return diagnostiquerListeTexte(textes, exercice.airesT, TOLERANCE_CENTIEME);
}
/** Somme infinie des aires des petits triangles Uₖ (= A₁), à partir de valeurs arrondies. */
export function diagnostiquerAiresZigzagAC(texte: string, exercice: ExerciceTrianglesZigzag): StatutVerification {
  return diagnostiquerNombreTexte(texte, exercice.sommeAiresU, TOLERANCE_PROPAGEE);
}

// ============================================================================
// carresEmboites
// ============================================================================
/** S₅ « arrondie au millième » (la fraction exacte convient aussi). */
export function diagnostiquerSommePartielleA(texte: string, exercice: ExerciceCarresEmboites): StatutVerification {
  const cible = sommeGeometriqueFinieLocal(exercice.u1A, exercice.qA, 5);
  return diagnostiquerNombreTexte(texte, cible, TOLERANCE_MILLIEME);
}
export type ChoixLimitePuissanceA = "zero" | "unQuart" | "un" | "infini";
export function diagnostiquerLimitePuissanceA(choix: ChoixLimitePuissanceA): boolean {
  return choix === "zero";
}
export function diagnostiquerSommeInfinieA(texte: string, exercice: ExerciceCarresEmboites): StatutVerification {
  return diagnostiquerNombreTexte(texte, exercice.sommeInfinieA, TOLERANCE_MILLIEME);
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
      return (exercice as ExercicePapyrusRhind).termes.map((cible) => ({ cible, tolerance: TOLERANCE_PROPAGEE }));
    case "troisMethodes": {
      const e = exercice as ExerciceVitesse;
      return [e.vitesseMoyenneTotaleKmH, e.vitesseDerniereSecondeKmH].map((cible) => ({ cible, tolerance: TOLERANCE_ARRONDIE }));
    }
    case "dixTermes":
      return (exercice as ExerciceFibonacci).dixPremiersTermes.map((cible) => ({ cible, tolerance: TOLERANCE_PRECISE }));
    case "hauteursZigzag":
      return (exercice as ExerciceTrianglesZigzag).longueurs.map((cible) => ({ cible, tolerance: TOLERANCE_CENTIEME }));
    case "airesZigzag":
      return (exercice as ExerciceTrianglesZigzag).airesT.map((cible) => ({ cible, tolerance: TOLERANCE_CENTIEME }));
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
