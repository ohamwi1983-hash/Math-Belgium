import type { ExerciceTangenteA, ExerciceTangenteB, ExerciceTangenteC, ExerciceTangenteD, ExerciceTangenteE, ExerciceTangentesConique, TangenteDepuisPoint, TangenteParallele } from "../core6e/tangentesConique.types";
import type { Point } from "../core6e/identificationConiques.types";
import { diagnostiquerValeur } from "./equivalenceExponentielle";
import { diagnostiquerEquivalenceDeuxSymboles } from "./expressionDeuxSymboles";
import { diagnostiquerEquivalenceQuadratiqueXY } from "./expressionQuadratiqueXY";
import type { StatutVerification } from "../moteur/statutVerification";
import type { PhaseTangentesConique } from "./typesTangentesConique";

/**
 * Couche B (6e) — vérification propre à `6gen62` (dispatch par famille/écran). N'importe JAMAIS
 * `src/generateurs6e/` (règle non négociable, CLAUDE.md) — les formules de dédoublement/discriminant
 * déjà écrites en Couche A (`generateurs6e/tangentesConique/algebreTangente.ts`) sont donc
 * DUPLIQUÉES ci-dessous (section "Duplications volontaires") plutôt qu'importées, exactement comme
 * `moteur/verificationDroite.ts` duplique `generateurs/vecteur/arithmetique.ts` (voir son en-tête) —
 * ces formules restent de la mathématique PURE, sans tirage aléatoire, jamais un raccourci qui
 * romprait l'isolation des couches. `generateurs6e/tangentesConique/session.integration.test.ts`
 * reste le SEUL fichier autorisé à importer les deux couches ensemble.
 */

function combinerStatuts(...statuts: StatutVerification[]): StatutVerification {
  if (statuts.some((s) => s === "parse_error")) return "parse_error";
  if (statuts.some((s) => s === "not_equivalent")) return "not_equivalent";
  return "correct";
}

function diagnostiquerChoix(valeur: string | undefined, attendu: string): StatutVerification {
  return valeur === attendu ? "correct" : "not_equivalent";
}

// ============================================================================
// Duplications volontaires (mathématique pure, aucun tirage aléatoire) — voir en-tête de fichier.
// ============================================================================

function dedoublementCentreeB(A: number, B: number, M: number, x0: number, y0: number): { coefX: number; coefY: number; coefC: number } {
  return { coefX: A * x0, coefY: B * y0, coefC: M };
}

function dedoublementParaboleB(axe: "horizontal" | "vertical", p: number, x0: number, y0: number): { coefX: number; coefY: number; coefC: number } {
  if (axe === "horizontal") return { coefX: -2 * p, coefY: y0, coefC: 2 * p * x0 };
  return { coefX: x0, coefY: -2 * p, coefC: 2 * p * y0 };
}

function coefficientsEquationEnMB(A: number, B: number, M: number, x0: number, y0: number): { a2: number; a1: number; a0: number } {
  return { a2: B * (A * x0 * x0 - M), a1: -2 * A * B * x0 * y0, a0: A * (B * y0 * y0 - M) };
}

// ============================================================================
// Famille A — tangente en un point donné (dédoublement).
// ============================================================================

function cibleAEquation(e: ExerciceTangenteA): (x: number, y: number) => number {
  const { x: x0, y: y0 } = e.P;
  const d = e.typeConique === "centree" ? dedoublementCentreeB(e.conique.coeffX, e.conique.coeffY, e.conique.M, x0, y0) : dedoublementParaboleB(e.conique.axe, e.conique.p, x0, y0);
  return (x, y) => d.coefX * x + d.coefY * y - d.coefC;
}

function diagnostiquerA(e: ExerciceTangenteA, phase: PhaseTangentesConique, valeurs: string[]): StatutVerification {
  if (phase === "aEcran1") return diagnostiquerValeur(valeurs[0] ?? "", e.valeurConfirmation);
  // aEcran2 (dédoublement posé) ET aEcran3 (forme simplifiée) partagent la MÊME classe
  // d'équivalence — chaque écran teste une étape distincte du raisonnement de l'élève, pas une
  // cible mathématique différente (même convention que `6gen59`, familles memeAxe/axesPerp, où
  // l'écran final "équation" est déjà entièrement déterminé par les valeurs confirmées à l'écran
  // précédent).
  return diagnostiquerEquivalenceQuadratiqueXY(valeurs[0] ?? "", 0, 0, cibleAEquation(e));
}

// ============================================================================
// Famille B — tangentes parallèles à une droite donnée (hyperbole).
// ============================================================================

function cibleBEcran1(e: ExerciceTangenteB): (x: number, k: number) => number {
  const { coeffX: A, coeffY: B, M } = e.conique;
  const m = e.m;
  return (x, k) => (A + B * m * m) * x * x + 2 * B * m * k * x + (B * k * k - M);
}

function cibleBEcran2(e: ExerciceTangenteB): (x: number, k: number) => number {
  const { coeffX: A, coeffY: B, M } = e.conique;
  const m = e.m;
  return (_x, k) => A * B * k * k - M * A - M * B * m * m;
}

/** Compare une paire de valeurs soumises à une paire de cibles SANS TENIR COMPTE DE L'ORDRE — les 2
 * racines d'une équation du second degré n'ont pas d'ordre "objectif" que l'élève puisse deviner
 * (contrairement à un signe +/- déjà visible). Essaie les 2 appariements possibles (n=2, jamais
 * besoin d'un algorithme de couplage général). */
function diagnostiquerPaireNonOrdonnee(valeurs: [string | undefined, string | undefined], cibles: [number, number]): StatutVerification {
  const direct = combinerStatuts(diagnostiquerValeur(valeurs[0] ?? "", cibles[0]), diagnostiquerValeur(valeurs[1] ?? "", cibles[1]));
  if (direct === "correct") return "correct";
  const croise = combinerStatuts(diagnostiquerValeur(valeurs[0] ?? "", cibles[1]), diagnostiquerValeur(valeurs[1] ?? "", cibles[0]));
  if (croise === "correct") return "correct";
  // Si un des 2 champs est franchement illisible dans les 2 sens, remonter parse_error plutôt que
  // masquer l'échec de saisie derrière un simple "faux".
  if (direct === "parse_error" && croise === "parse_error") return "parse_error";
  return "not_equivalent";
}

function diagnostiquerB(e: ExerciceTangenteB, phase: PhaseTangentesConique, valeurs: string[]): StatutVerification {
  if (phase === "bEcran1") return diagnostiquerEquivalenceDeuxSymboles(valeurs[0] ?? "", "x", "k", 1.7, 1.3, cibleBEcran1(e));
  if (phase === "bEcran2") return diagnostiquerEquivalenceDeuxSymboles(valeurs[0] ?? "", "x", "k", 1.7, 1.3, cibleBEcran2(e));
  if (phase === "bEcran3") {
    const statutChoix = diagnostiquerChoix(valeurs[0], e.aSolution ? "existe" : "aucune");
    if (!e.aSolution) return statutChoix;
    const [k1, k2] = e.tangentes.map((t) => t.k);
    return combinerStatuts(statutChoix, diagnostiquerPaireNonOrdonnee([valeurs[1], valeurs[2]], [k1!, k2!]));
  }
  // bEcran4
  return diagnostiquerListeTangentesParalleles(valeurs[0] ?? "", e.m, e.tangentes);
}

// ============================================================================
// Famille C — tangentes depuis un point donné (ellipse).
// ============================================================================

function cibleCEcran1(e: ExerciceTangenteC): (x: number, m: number) => number {
  const { coeffX: A, coeffY: B, M } = e.conique;
  const { x: x0, y: y0 } = e.P;
  return (x, m) => (A + B * m * m) * x * x + 2 * B * m * (y0 - m * x0) * x + (B * (y0 - m * x0) * (y0 - m * x0) - M);
}

function cibleCEcran2(e: ExerciceTangenteC): (x: number, m: number) => number {
  const { a2, a1, a0 } = coefficientsEquationEnMB(e.conique.coeffX, e.conique.coeffY, e.conique.M, e.P.x, e.P.y);
  return (_x, m) => a2 * m * m + a1 * m + a0;
}

function diagnostiquerC(e: ExerciceTangenteC, phase: PhaseTangentesConique, valeurs: string[]): StatutVerification {
  if (phase === "cEcran1") return diagnostiquerEquivalenceDeuxSymboles(valeurs[0] ?? "", "x", "m", 1.7, 1.3, cibleCEcran1(e));
  if (phase === "cEcran2") return diagnostiquerEquivalenceDeuxSymboles(valeurs[0] ?? "", "x", "m", 1.7, 1.3, cibleCEcran2(e));
  if (phase === "cEcran3") {
    const statutChoix = diagnostiquerChoix(valeurs[0], e.aSolution ? "exterieur" : "interieur");
    if (!e.aSolution) return statutChoix;
    const [m1, m2] = e.tangentes.map((t) => t.m);
    return combinerStatuts(statutChoix, diagnostiquerPaireNonOrdonnee([valeurs[1], valeurs[2]], [m1!, m2!]));
  }
  // cEcran4
  return diagnostiquerListeTangentesDepuisPoint(valeurs[0] ?? "", e.tangentes);
}

// ============================================================================
// Familles B/C écran "add-as-needed" — liste de {équation, point} appariée SANS ORDRE aux cibles.
// Encodage : `valeurs[i]` porte un JSON `string[][]` (une ligne = [équation, xTexte, yTexte]) —
// voir `ui6e/formatTangentesConique.ts`/`components6e/EtapeChampsTangentesConique.tsx` pour le
// champ `type:"liste"` qui produit cet encodage côté écran.
// ============================================================================

interface CibleTangenteLigne {
  cibleEquation: (x: number, y: number) => number;
  point: Point;
}

function parserLigne(ligne: string[]): { equation: string; x: string; y: string } | null {
  if (ligne.length !== 3) return null;
  return { equation: ligne[0] ?? "", x: ligne[1] ?? "", y: ligne[2] ?? "" };
}

function statutLigneVsCible(ligne: { equation: string; x: string; y: string }, cible: CibleTangenteLigne): StatutVerification {
  const statutEquation = diagnostiquerEquivalenceQuadratiqueXY(ligne.equation, 0, 0, cible.cibleEquation);
  const statutPoint = combinerStatuts(diagnostiquerValeur(ligne.x, cible.point.x), diagnostiquerValeur(ligne.y, cible.point.y));
  return combinerStatuts(statutEquation, statutPoint);
}

/** Diagnostic générique d'une liste add-as-needed de tangentes, appariée aux `cibles` SANS ORDRE
 * imposé (n=2 systématiquement dans ce générateur — voir `algebreTangente.ts`, les 2 racines
 * réelles sont toujours distinctes par construction) — essaie les 2 appariements possibles. */
function diagnostiquerListeGenerique(valeurJSON: string, cibles: CibleTangenteLigne[]): StatutVerification {
  let lignesBrutes: unknown;
  try {
    lignesBrutes = JSON.parse(valeurJSON);
  } catch {
    return "parse_error";
  }
  if (!Array.isArray(lignesBrutes) || lignesBrutes.length !== cibles.length) return "not_equivalent";

  const lignes = (lignesBrutes as string[][]).map(parserLigne);
  if (lignes.some((l) => l === null)) return "parse_error";
  const lignesValides = lignes as { equation: string; x: string; y: string }[];

  if (cibles.length !== 2) throw new Error("diagnostiquerListeGenerique : seul n=2 est géré (voir en-tête)");

  const matrice = lignesValides.map((ligne) => cibles.map((cible) => statutLigneVsCible(ligne, cible)));
  const pairing1 = matrice[0]![0] === "correct" && matrice[1]![1] === "correct";
  const pairing2 = matrice[0]![1] === "correct" && matrice[1]![0] === "correct";
  if (pairing1 || pairing2) return "correct";
  const toutParseError = matrice.every((ligne) => ligne.every((s) => s === "parse_error"));
  return toutParseError ? "parse_error" : "not_equivalent";
}

function diagnostiquerListeTangentesParalleles(valeurJSON: string, m: number, tangentes: TangenteParallele[]): StatutVerification {
  const cibles: CibleTangenteLigne[] = tangentes.map((t) => ({ cibleEquation: (x, y) => m * x - y + t.k, point: t.point }));
  return diagnostiquerListeGenerique(valeurJSON, cibles);
}

function diagnostiquerListeTangentesDepuisPoint(valeurJSON: string, tangentes: TangenteDepuisPoint[]): StatutVerification {
  const cibles: CibleTangenteLigne[] = tangentes.map((t) => {
    const k = t.point.y - t.m * t.point.x;
    return { cibleEquation: (x, y) => t.m * x - y + k, point: t.point };
  });
  return diagnostiquerListeGenerique(valeurJSON, cibles);
}

// ============================================================================
// Famille D — construire une conique depuis un point de passage + une tangente.
// ============================================================================

function cibleDEcran1(e: ExerciceTangenteD): (a: number, b: number) => number {
  const signe = e.natureCible === "ellipse" ? 1 : -1;
  const { x: x0, y: y0 } = e.P;
  return (a, b) => (x0 * x0) / (a * a) + (signe * (y0 * y0)) / (b * b) - 1;
}

function cibleDEcran2(e: ExerciceTangenteD): (a: number, b: number) => number {
  const signe = e.natureCible === "ellipse" ? 1 : -1;
  const { m, k } = e.ligne;
  return (a, b) => a * a * m * m + signe * b * b - k * k;
}

function cibleDEcran4(e: ExerciceTangenteD): (x: number, y: number) => number {
  const signe = e.natureCible === "ellipse" ? 1 : -1;
  return (x, y) => (x * x) / (e.a * e.a) + (signe * (y * y)) / (e.b * e.b) - 1;
}

function diagnostiquerD(e: ExerciceTangenteD, phase: PhaseTangentesConique, valeurs: string[]): StatutVerification {
  if (phase === "dEcran1") return diagnostiquerEquivalenceDeuxSymboles(valeurs[0] ?? "", "a", "b", 2.3, 3.1, cibleDEcran1(e));
  if (phase === "dEcran2") return diagnostiquerEquivalenceDeuxSymboles(valeurs[0] ?? "", "a", "b", 2.3, 3.1, cibleDEcran2(e));
  if (phase === "dEcran3") return combinerStatuts(diagnostiquerValeur(valeurs[0] ?? "", e.a * e.a), diagnostiquerValeur(valeurs[1] ?? "", e.b * e.b));
  return diagnostiquerEquivalenceQuadratiqueXY(valeurs[0] ?? "", 0, 0, cibleDEcran4(e));
}

// ============================================================================
// Famille E — point d'une conique le plus proche d'une droite (réutilise famille B).
// ============================================================================

function diagnostiquerE(e: ExerciceTangenteE, phase: PhaseTangentesConique, valeurs: string[]): StatutVerification {
  const [pt1, pt2] = e.base.tangentes.map((t) => t.point);
  if (phase === "eEcran1") {
    return combinerStatuts(diagnostiquerValeur(valeurs[0] ?? "", pt1!.x), diagnostiquerValeur(valeurs[1] ?? "", pt1!.y), diagnostiquerValeur(valeurs[2] ?? "", pt2!.x), diagnostiquerValeur(valeurs[3] ?? "", pt2!.y));
  }
  if (phase === "eEcran2") {
    return combinerStatuts(diagnostiquerValeur(valeurs[0] ?? "", e.distances[0]), diagnostiquerValeur(valeurs[1] ?? "", e.distances[1]));
  }
  // eEcran3
  const idAttendu = e.indexPlusProche === 0 ? "point1" : "point2";
  return combinerStatuts(diagnostiquerChoix(valeurs[0], idAttendu), diagnostiquerValeur(valeurs[1] ?? "", e.distances[e.indexPlusProche]));
}

// ============================================================================
// Dispatcher générique.
// ============================================================================

export function diagnostiquerEcran(exercice: ExerciceTangentesConique, phase: PhaseTangentesConique, valeurs: string[]): StatutVerification {
  if (exercice.famille === "A") return diagnostiquerA(exercice, phase, valeurs);
  if (exercice.famille === "B") return diagnostiquerB(exercice, phase, valeurs);
  if (exercice.famille === "C") return diagnostiquerC(exercice, phase, valeurs);
  if (exercice.famille === "D") return diagnostiquerD(exercice, phase, valeurs);
  return diagnostiquerE(exercice, phase, valeurs);
}

export function verifierEcran(exercice: ExerciceTangentesConique, phase: PhaseTangentesConique, valeurs: string[]): boolean {
  return diagnostiquerEcran(exercice, phase, valeurs) === "correct";
}
