/**
 * Couche A (5e) — génération pour 5gen26 ("Calculer f'(a) par la définition"). 4 familles
 * STRUCTURELLEMENT DISJOINTES tirées à fréquence comparable — voir `core5e/definitionDerivee.types.ts`
 * pour le contrat complet. N'importe jamais rien de `moteur5e/`.
 *
 * Réutilise DIRECTEMENT `entierAleatoire`/`entierNonNul`/`reduireFraction` (`generateurs5e/limites/
 * fraction.ts`, Couche A ↔ Couche A autorisé) pour tout tirage entier et toute fraction exacte.
 *
 * `valeurFonction` (évaluation numérique pure de f) est volontairement RÉPLIQUÉE (jamais importée)
 * dans `moteur5e/verificationDefinitionDerivee.ts` — règle non négociable CLAUDE.md, `moteur5e/`
 * n'importe jamais `generateurs5e/`.
 */
import type {
  ExerciceDefinitionDerivee,
  ExerciceDefinitionDeriveeAffine,
  ExerciceDefinitionDeriveeQuadratique,
  ExerciceDefinitionDeriveeQuadratiqueComplete,
  ExerciceDefinitionDeriveeRacine,
  ExerciceDefinitionDeriveeRationnelleLineaire,
  ExerciceDefinitionDeriveeRationnelleSimple,
} from "../../core5e/definitionDerivee.types";
import type { FractionExacte } from "../../core5e/limites.types";
import { entierAleatoire, entierNonNul, reduireFraction } from "../limites/fraction";

function tirerUn(candidats: number[]): number {
  return candidats[entierAleatoire(0, candidats.length - 1)];
}

function plage(min: number, max: number): number[] {
  const out: number[] = [];
  for (let i = min; i <= max; i++) out.push(i);
  return out;
}

// ============================================================================
// Famille 1 — affine : f(x)=mx+p.
// ============================================================================

export function genererAffine(): ExerciceDefinitionDeriveeAffine {
  const m = entierNonNul(4);
  const p = entierAleatoire(-5, 5);
  // a = 0 exclu (audit 5c5a, point 17) : « f(0 + h) » n'exerce pas la substitution.
  const a = tirerUn(plage(-5, 5).filter((v) => v !== 0));
  return { famille: "affine", m, p, a };
}

// ============================================================================
// Famille 2 — quadratique : f(x)=mx²+p.
// ============================================================================

export function genererQuadratique(): ExerciceDefinitionDeriveeQuadratique {
  const m = entierNonNul(3);
  const p = entierAleatoire(-5, 5);
  // a = 0 exclu : f'(0) = 0 sans aucun calcul (audit 5c5a, point 17).
  const a = tirerUn(plage(-4, 4).filter((v) => v !== 0));
  return { famille: "quadratique", m, p, a };
}

// ============================================================================
// Famille 3 — rationnelle simple : f(x)=k/x ou k/x².
// ============================================================================

const CANDIDATS_A_RATIONNELLE_SIMPLE = [-3, -2, -1, 1, 2, 3];

export function genererRationnelleSimple(): ExerciceDefinitionDeriveeRationnelleSimple {
  const k = entierNonNul(6);
  const expo: 1 | 2 = entierAleatoire(1, 2) as 1 | 2;
  const a = tirerUn(CANDIDATS_A_RATIONNELLE_SIMPLE);
  return { famille: "rationnelleSimple", k, expo, a };
}

// ============================================================================
// Famille 4 — rationnelle linéaire : f(x)=(mx+p)/(x-q).
// ============================================================================

export function genererRationnelleLineaire(): ExerciceDefinitionDeriveeRationnelleLineaire {
  const m = entierNonNul(4);
  const q = entierAleatoire(-4, 4);
  // mq + p ≠ 0 : sinon f(x) = (mx + p)/(x − q) vaut m partout (fonction constante, f' = 0 —
  // audit 5c5a, point 8).
  let p = entierAleatoire(-5, 5);
  while (m * q + p === 0) p = entierAleatoire(-5, 5);
  const candidatsA = [q - 3, q - 2, q - 1, q + 1, q + 2, q + 3].filter((v) => v !== 0);
  const a = tirerUn(candidatsA);
  return { famille: "rationnelleLineaire", m, p, q, a };
}

// ============================================================================
// Famille 5 (lot C, fin de catalogue) — quadratique complète : f(x)=mx²+nx+p.
// ============================================================================

export function genererQuadratiqueComplete(): ExerciceDefinitionDeriveeQuadratiqueComplete {
  const m = entierNonNul(3);
  const n = entierNonNul(5);
  const p = entierAleatoire(-5, 5);
  // f'(a) = 2ma + n ≠ 0 : un nombre dérivé nul ne se distinguerait pas d'un oubli.
  const a = tirerUn(plage(-4, 4).filter((v) => v !== 0 && 2 * m * v + n !== 0));
  return { famille: "quadratiqueComplete", m, n, p, a };
}

// ============================================================================
// Famille 6 (lot C, fin de catalogue) — racine : f(x)=k√(x+c), a + c carré parfait.
// ============================================================================

export function genererRacine(): ExerciceDefinitionDeriveeRacine {
  const k = tirerUn([1, 1, 2, 3]);
  for (let essai = 0; essai < 200; essai++) {
    const s = entierAleatoire(1, 4);
    const c = entierAleatoire(-5, 5);
    const a = s * s - c;
    // a ≠ 0, c ≠ 0 (√x : déjà démontrée au cours) et a modeste.
    if (a === 0 || c === 0 || Math.abs(a) > 12) continue;
    return { famille: "racine", k, c, a };
  }
  return { famille: "racine", k, c: 3, a: 6 };
}

/** √(a + c), entier par construction. */
export function racineEnA(e: ExerciceDefinitionDeriveeRacine): number {
  return Math.round(Math.sqrt(e.a + e.c));
}

// ============================================================================
// Évaluation numérique pure de f (nécessaire à la génération ET, RÉPLIQUÉE, à la vérification).
// ============================================================================

export function valeurFonction(exercice: ExerciceDefinitionDerivee, x: number): number {
  switch (exercice.famille) {
    case "affine":
      return exercice.m * x + exercice.p;
    case "quadratique":
      return exercice.m * x * x + exercice.p;
    case "rationnelleSimple":
      return exercice.expo === 1 ? exercice.k / x : exercice.k / (x * x);
    case "rationnelleLineaire":
      return (exercice.m * x + exercice.p) / (x - exercice.q);
    case "quadratiqueComplete":
      return exercice.m * x * x + exercice.n * x + exercice.p;
    case "racine":
      return exercice.k * Math.sqrt(x + exercice.c);
  }
}

/** f(a), en fraction EXACTE irréductible — jamais un flottant reconstruit après coup. */
export function valeurExacte(exercice: ExerciceDefinitionDerivee, a: number): FractionExacte {
  switch (exercice.famille) {
    case "affine":
      return reduireFraction(exercice.m * a + exercice.p, 1);
    case "quadratique":
      return reduireFraction(exercice.m * a * a + exercice.p, 1);
    case "rationnelleSimple":
      return exercice.expo === 1 ? reduireFraction(exercice.k, a) : reduireFraction(exercice.k, a * a);
    case "rationnelleLineaire":
      return reduireFraction(exercice.m * a + exercice.p, a - exercice.q);
    case "quadratiqueComplete":
      return reduireFraction(exercice.m * a * a + exercice.n * a + exercice.p, 1);
    case "racine":
      return reduireFraction(exercice.k * racineEnA(exercice), 1);
  }
}

/** f'(a), en fraction EXACTE irréductible — formule fermée par famille (jamais recalculée par
 * différence finie) :
 * - affine : f'(a)=m
 * - quadratique : f'(a)=2ma
 * - rationnelleSimple : f'(a)=-k/a² (expo=1) ou -2k/a³ (expo=2)
 * - rationnelleLineaire : f'(a)=-(mq+p)/(a-q)²
 */
export function deriveeExacte(exercice: ExerciceDefinitionDerivee, a: number): FractionExacte {
  switch (exercice.famille) {
    case "affine":
      return reduireFraction(exercice.m, 1);
    case "quadratique":
      return reduireFraction(2 * exercice.m * a, 1);
    case "rationnelleSimple":
      return exercice.expo === 1 ? reduireFraction(-exercice.k, a * a) : reduireFraction(-2 * exercice.k, a * a * a);
    case "rationnelleLineaire": {
      const numerateur = -(exercice.m * exercice.q + exercice.p);
      const denominateur = (a - exercice.q) * (a - exercice.q);
      return reduireFraction(numerateur, denominateur);
    }
    case "quadratiqueComplete":
      return reduireFraction(2 * exercice.m * a + exercice.n, 1);
    case "racine":
      return reduireFraction(exercice.k, 2 * racineEnA(exercice));
  }
}

// ============================================================================
// Dispatch + panneau dev.
// ============================================================================

const FAMILLES: ExerciceDefinitionDerivee["famille"][] = ["affine", "quadratique", "rationnelleSimple", "rationnelleLineaire"];

export function genererExerciceDefinitionDerivee(familleForcee?: ExerciceDefinitionDerivee["famille"]): ExerciceDefinitionDerivee {
  const famille = familleForcee ?? FAMILLES[entierAleatoire(0, FAMILLES.length - 1)];
  switch (famille) {
    case "affine":
      return genererAffine();
    case "quadratique":
      return genererQuadratique();
    case "rationnelleSimple":
      return genererRationnelleSimple();
    case "rationnelleLineaire":
      return genererRationnelleLineaire();
    case "quadratiqueComplete":
      return genererQuadratiqueComplete();
    case "racine":
      return genererRacine();
  }
}

/** Tirage libre de l'APPLI (lot C) : les deux familles de fin de catalogue (quadratique complète,
 * racine) une fois sur trois ; l'adaptateur et les `?code=` gardent `genererExerciceDefinitionDerivee`
 * (codes imprimés inchangés). */
export function genererExerciceDefinitionDeriveeLibre(): ExerciceDefinitionDerivee {
  if (Math.random() < 1 / 3) return Math.random() < 0.5 ? genererQuadratiqueComplete() : genererRacine();
  return genererExerciceDefinitionDerivee();
}

export const CATALOGUE_FAMILLES: { id: string; label: string }[] = [
  { id: "affine", label: "1. Affine — f(x) = mx + p" },
  { id: "quadratique", label: "2. Quadratique — f(x) = mx² + p" },
  { id: "rationnelleSimple", label: "3. Rationnelle simple — f(x) = k/x ou k/x²" },
  { id: "rationnelleLineaire", label: "4. Rationnelle linéaire — f(x) = (mx + p)/(x − q)" },
  { id: "quadratiqueComplete", label: "5. Quadratique complète — f(x) = mx² + nx + p" },
  { id: "racine", label: "6. Racine — f(x) = k√(x + c)" },
];

export function construireAvecFamilleId(id: string): ExerciceDefinitionDerivee {
  if (id === "affine" || id === "quadratique" || id === "rationnelleSimple" || id === "rationnelleLineaire" || id === "quadratiqueComplete" || id === "racine") {
    return genererExerciceDefinitionDerivee(id);
  }
  throw new Error(`construireAvecFamilleId : id inconnu "${id}"`);
}
