import type { ExerciceAireExcentriciteConique, ExerciceFamilleA, ExerciceFamilleB } from "../core6e/aireExcentriciteConique.types";
import { diagnostiquerValeur } from "./equivalenceExponentielle";
import { evaluerExpressionExponentielle } from "./expressionExponentielle";
import type { StatutVerification } from "../moteur/statutVerification";
import type { PhaseAireExcentriciteConique } from "./typesAireExcentriciteConique";

/**
 * Couche B (6e) — vérification propre à `6gen60` (dispatch par famille/écran). N'importe JAMAIS
 * rien de `src/generateurs6e/` (règle non négociable, CLAUDE.md) — voir
 * `generateurs6e/aireExcentriciteConique/session.integration.test.ts` pour le seul fichier autorisé
 * Couche A + Couche B ensemble.
 *
 * Famille A : toutes les valeurs numériques (|PF|,|PF'|,cos(angle),aire) comparées par ÉQUIVALENCE
 * NUMÉRIQUE (`diagnostiquerValeur`, tolérance 0.01 — `equivalenceExponentielle.ts`, déjà éprouvée
 * par plusieurs chapitres 6e). `cos(angle)` est TOUJOURS rationnel par construction (voir en-tête
 * `familleA.ts`) mais reste comparé numériquement comme les autres — le champ accepte aussi bien
 * "11/25" que "0.44".
 *
 * Famille B écran 1 ("équation posée reliant a,b,c, ou directement e") : AUCUNE bibliothèque de
 * calcul formel installée sur ce projet (convention CLAUDE.md) — équivalence vérifiée par
 * ÉCHANTILLONNAGE NUMÉRIQUE, exactement le même principe que `expressionQuadratiqueXY.ts`
 * (6gen58/59) mais généralisé à N variables symboliques (a,b,c,e,k) via l'évaluateur MULTI-VARIABLE
 * déjà partagé `expressionExponentielle.ts` (chapitre 2) plutôt qu'un second parseur dédié : deux
 * polynômes (ici, de degré ≤2) décrivent la MÊME relation ssi l'un est un multiple scalaire non nul
 * de l'autre, testé sur plusieurs points génériques (jamais des points "sur la condition" — la
 * cible EST déjà la relation spécifique, comme dans `expressionQuadratiqueXY.ts`).
 *
 * **Formes acceptées, volontairement bornées** (liste de cibles candidates par sous-type, PAS une
 * équivalence algébrique complète genre mise au carré) : couvre les reformulations naturelles
 * qu'un élève écrit réellement (réordonnée, mise à l'échelle, avec ou sans le facteur `a` qui
 * s'annule pour `distanceDirectrices`) — mêmes limites déjà acceptées pour
 * `diagnostiquerEquivalenceQuadratiqueXY` (ne couvre pas une transformation non linéaire comme
 * "élever au carré les deux membres").
 */

function combinerStatuts(...statuts: StatutVerification[]): StatutVerification {
  if (statuts.some((s) => s === "parse_error")) return "parse_error";
  if (statuts.some((s) => s === "not_equivalent")) return "not_equivalent";
  return "correct";
}

// ============================================================================
// Famille A.
// ============================================================================

function diagnostiquerA(e: ExerciceFamilleA, phase: PhaseAireExcentriciteConique, valeurs: string[]): StatutVerification {
  if (phase === "aEcran1") {
    return combinerStatuts(diagnostiquerValeur(valeurs[0] ?? "", e.pf.num / e.pf.den), diagnostiquerValeur(valeurs[1] ?? "", e.pfPrime.num / e.pfPrime.den));
  }
  if (phase === "aEcran2") return diagnostiquerValeur(valeurs[0] ?? "", e.cosAngle.num / e.cosAngle.den);
  return diagnostiquerValeur(valeurs[0] ?? "", e.aire);
}

// ============================================================================
// Famille B — équivalence par échantillonnage numérique (écran 1) + valeur (écran 2).
// ============================================================================

type CibleRelation = (v: Record<string, number>) => number;

/** Décalages génériques (non ronds, non spéciaux) pour a,b,c,e — mirroir `DECALAGES_ECHANTILLONS`
 * de `expressionQuadratiqueXY.ts`, généralisé à 4 variables. `k` est fusionné séparément (fixe pour
 * un exercice donné, voir `echantillonsAvecK`). */
const ECHANTILLONS_BASE: { a: number; b: number; c: number; e: number }[] = [
  { a: 4.7, b: 1.3, c: 2.9, e: 0.37 },
  { a: 2.1, b: 3.6, c: 0.8, e: 0.81 },
  { a: 6.3, b: 0.4, c: 4.1, e: 0.15 },
  { a: 1.9, b: 5.2, c: 3.3, e: 0.63 },
  { a: 3.4, b: 2.2, c: 1.1, e: 0.92 },
  { a: 5.8, b: 4.4, c: 2.6, e: 0.28 },
  { a: 0.9, b: 1.7, c: 6.2, e: 0.55 },
  { a: 7.1, b: 3.9, c: 0.6, e: 0.44 },
];

function echantillonsAvecK(k: number): Record<string, number>[] {
  return ECHANTILLONS_BASE.map((s) => ({ ...s, k }));
}

const TOLERANCE = 1e-6;
const NOMBRE_MIN_POINTS_COMPARABLES = 6;

/** Vrai si `gauche−droite` (texte) est un multiple scalaire non nul de `cible`, échantillonné sur
 * `echantillons` — voir en-tête de fichier. */
function estEquationProportionnelle(gauche: string, droite: string, echantillons: Record<string, number>[], cible: CibleRelation): boolean {
  const points: { soumis: number; cible: number }[] = [];
  for (const vals of echantillons) {
    let g: number;
    let d: number;
    try {
      g = evaluerExpressionExponentielle(gauche, vals);
      d = evaluerExpressionExponentielle(droite, vals);
    } catch {
      return false;
    }
    if (!Number.isFinite(g) || !Number.isFinite(d)) continue;
    const valeurCible = cible(vals);
    if (Math.abs(valeurCible) < TOLERANCE) continue;
    points.push({ soumis: g - d, cible: valeurCible });
  }
  if (points.length < NOMBRE_MIN_POINTS_COMPARABLES) return false;
  const ratio = points[0]!.soumis / points[0]!.cible;
  if (!Number.isFinite(ratio) || Math.abs(ratio) < TOLERANCE) return false;
  return points.every(({ soumis, cible: valeurCible }) => Math.abs(soumis - ratio * valeurCible) <= TOLERANCE * Math.max(1, Math.abs(valeurCible)));
}

/** `texte` doit être une ÉQUATION ("gauche=droite", un seul "=") — sinon `parse_error`. Accepté ssi
 * proportionnel à L'UNE (au moins) des `cibles` candidates. */
function diagnostiquerEquationRelation(texte: string, echantillons: Record<string, number>[], cibles: CibleRelation[]): StatutVerification {
  const morceaux = texte.split("=");
  if (morceaux.length !== 2) return "parse_error";
  const [gauche, droite] = [morceaux[0] ?? "", morceaux[1] ?? ""];

  const parseable = echantillons.some((vals) => {
    try {
      evaluerExpressionExponentielle(gauche, vals);
      evaluerExpressionExponentielle(droite, vals);
      return true;
    } catch {
      return false;
    }
  });
  if (!parseable) return "parse_error";

  return cibles.some((cible) => estEquationProportionnelle(gauche, droite, echantillons, cible)) ? "correct" : "not_equivalent";
}

const CIBLES_ABSCISSE_FOYER_PARALLELE: CibleRelation[] = [(v) => v.b - v.c];
const CIBLES_ANGLE_DROIT: CibleRelation[] = [(v) => v.a * v.a - 2 * v.c * v.c];

function ciblesDistanceDirectrices(): CibleRelation[] {
  return [
    (v) => (2 * v.a) / v.e - v.k * (2 * v.a * v.e), // forme brute, "a" présent des 2 côtés.
    (v) => 1 - v.k * v.e * v.e, // forme réduite (÷2a), en e seul.
    (v) => 2 / v.e - 2 * v.k * v.e, // forme intermédiaire (÷a, non multipliée par e).
  ];
}

function diagnostiquerB(e: ExerciceFamilleB, phase: PhaseAireExcentriciteConique, valeurs: string[]): StatutVerification {
  if (phase === "bEcran2") return diagnostiquerValeur(valeurs[0] ?? "", e.excentricite);

  const echantillons = echantillonsAvecK(e.k ?? 1);
  if (e.sousType === "abscisseFoyerParallele") return diagnostiquerEquationRelation(valeurs[0] ?? "", echantillons, CIBLES_ABSCISSE_FOYER_PARALLELE);
  if (e.sousType === "angleDroitSommetSecondaire") return diagnostiquerEquationRelation(valeurs[0] ?? "", echantillons, CIBLES_ANGLE_DROIT);
  return diagnostiquerEquationRelation(valeurs[0] ?? "", echantillons, ciblesDistanceDirectrices());
}

// ============================================================================
// Dispatcher générique.
// ============================================================================

export function diagnostiquerEcran(exercice: ExerciceAireExcentriciteConique, phase: PhaseAireExcentriciteConique, valeurs: string[]): StatutVerification {
  return exercice.famille === "A" ? diagnostiquerA(exercice, phase, valeurs) : diagnostiquerB(exercice, phase, valeurs);
}

export function verifierEcran(exercice: ExerciceAireExcentriciteConique, phase: PhaseAireExcentriciteConique, valeurs: string[]): boolean {
  return diagnostiquerEcran(exercice, phase, valeurs) === "correct";
}
