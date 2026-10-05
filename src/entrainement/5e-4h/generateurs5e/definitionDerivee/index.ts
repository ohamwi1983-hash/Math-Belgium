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
  const a = tirerUn(plage(-5, 5));
  return { famille: "affine", m, p, a };
}

// ============================================================================
// Famille 2 — quadratique : f(x)=mx²+p.
// ============================================================================

export function genererQuadratique(): ExerciceDefinitionDeriveeQuadratique {
  const m = entierNonNul(3);
  const p = entierAleatoire(-5, 5);
  const a = tirerUn(plage(-4, 4));
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
  const p = entierAleatoire(-5, 5);
  const q = entierAleatoire(-4, 4);
  const candidatsA = [q - 3, q - 2, q - 1, q + 1, q + 2, q + 3];
  const a = tirerUn(candidatsA);
  return { famille: "rationnelleLineaire", m, p, q, a };
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
  }
}

export const CATALOGUE_FAMILLES: { id: string; label: string }[] = [
  { id: "affine", label: "1. Affine — f(x)=mx+p" },
  { id: "quadratique", label: "2. Quadratique — f(x)=mx²+p" },
  { id: "rationnelleSimple", label: "3. Rationnelle simple — f(x)=k/x ou k/x²" },
  { id: "rationnelleLineaire", label: "4. Rationnelle linéaire — f(x)=(mx+p)/(x-q)" },
];

export function construireAvecFamilleId(id: string): ExerciceDefinitionDerivee {
  if (id === "affine" || id === "quadratique" || id === "rationnelleSimple" || id === "rationnelleLineaire") {
    return genererExerciceDefinitionDerivee(id);
  }
  throw new Error(`construireAvecFamilleId : id inconnu "${id}"`);
}
