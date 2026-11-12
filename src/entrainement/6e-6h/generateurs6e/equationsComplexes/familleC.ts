import type { ExerciceFamilleC, ValeurComplexe } from "../../core6e/equationsComplexes.types";
import { tirerEntier, tirerEntierNonNul, tirerParmi } from "../calculPrimitives/aleatoire";
import { dansLaBorne } from "./bornes";

/**
 * Couche A (6e) — famille C (« Équation du second degré, Δ réel négatif ») de `6gen36`, l'une des 2
 * familles du TIRAGE LIBRE (audit 6e ch. 5, point 25). Construite à l'envers depuis les racines
 * p ± qi : az² − 2apz + a(p²+q²) = 0, Δ = −4a²q².
 * - a ∈ {±1, ±2, ±3}, p ∈ [-5 ; 5], q ∈ [1 ; 5] ;
 * - |b|, |c| ≤ 100 et |Δ| ≤ 400 ;
 * - cas particulier (~10 %) : p = 0, soit b = 0 et des racines imaginaires pures ±qi.
 */

const A_VALEURS = [1, 1, -1, 2, -2, 3, -3] as const;
const P_MAX = 5;
const Q_MAX = 5;
const PROBABILITE_CAS_PARTICULIER = 0.1;
const BORNE_DELTA = 400;

export function construireFamilleC(): ExerciceFamilleC {
  const casParticulier = Math.random() < PROBABILITE_CAS_PARTICULIER;
  for (;;) {
    const a = tirerParmi(A_VALEURS);
    const p = casParticulier ? 0 : tirerEntierNonNul(-P_MAX, P_MAX);
    const q = tirerEntier(1, Q_MAX);
    const b = -2 * a * p;
    const c = a * (p * p + q * q);
    const delta = b * b - 4 * a * c;
    if (!dansLaBorne([b, c]) || Math.abs(delta) > BORNE_DELTA) continue;
    const r1: ValeurComplexe = { re: p, im: q };
    const r2: ValeurComplexe = { re: p, im: -q };
    return { famille: "C", a, b, c, delta, racines: [r1, r2] };
  }
}
