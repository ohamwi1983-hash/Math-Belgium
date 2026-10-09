import type { ExerciceFamilleB_Problemes, SousTypeB_Problemes } from "../../core6e/integralesProblemes.types";

/**
 * Couche A (6e) — famille B de `6gen29` : cinématique a(t)→v(t)→x(t), DEUX conditions initiales
 * SÉPARÉES (piège explicite de la spec — v(0) résout la constante de v(t), x(0) résout CELLE de
 * x(t), jamais la même constante réutilisée par erreur).
 *
 * a(t) = k·t + p. Intégration : v(t) = k/2·t² + p·t + C1, v(0)=v0 ⇒ C1=v0.
 * x(t) = k/6·t³ + p/2·t² + v0·t + C2, x(0)=x0 ⇒ C2=x0.
 *
 * Comme k,p,v0 ∈ {ℝ≥0} par construction (spec : k∈{1,2,3}, p∈{0,1,2}, v0∈{0,3,5}), a(t)≥0 pour
 * t≥0 ⇒ v(t) est CROISSANTE sur [0;+∞[ et v(t)≥v0≥0 ⇒ v(t)>0 pour t>0 (k>0 toujours) ⇒ x(t) est
 * STRICTEMENT croissante sur ]0;+∞[ — garantit une solution UNIQUE à x(t)=cible pour t≥0 (sous-type
 * "resoudre"), jamais un solveur symbolique générique pour l'équation cubique.
 */

function entierEntre(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function choisir<T>(options: T[]): T {
  return options[Math.floor(Math.random() * options.length)];
}

function construireBase(): { k: number; p: number; v0: number; x0: number; vReference: (t: number) => number; xReference: (t: number) => number } {
  const k = choisir([1, 2, 3]);
  const p = choisir([0, 1, 2]);
  const v0 = choisir([0, 3, 5]);
  const x0 = 0;
  const vReference = (t: number) => (k / 2) * t * t + p * t + v0;
  const xReference = (t: number) => (k / 6) * t * t * t + (p / 2) * t * t + v0 * t + x0;
  return { k, p, v0, x0, vReference, xReference };
}

export function construireFamilleB_Evaluer(): ExerciceFamilleB_Problemes {
  const base = construireBase();
  const t1 = entierEntre(2, 5);
  return { famille: "B", sousType: "evaluer", ...base, t1, cible: null, tSolution: null };
}

/** Sous-type "resoudre" — `tSolution` est choisi D'ABORD (entier propre), `cible` DÉRIVÉ ensuite
 * (=x(tSolution)) — jamais l'inverse (convention du chantier, cf. `core6e/volumesRevolution.types.ts`). */
export function construireFamilleB_Resoudre(): ExerciceFamilleB_Problemes {
  const base = construireBase();
  const tSolution = entierEntre(2, 5);
  const cible = base.xReference(tSolution);
  return { famille: "B", sousType: "resoudre", ...base, t1: null, cible, tSolution };
}

const CONSTRUCTEURS_PAR_SOUS_TYPE: Record<SousTypeB_Problemes, () => ExerciceFamilleB_Problemes> = {
  evaluer: construireFamilleB_Evaluer,
  resoudre: construireFamilleB_Resoudre,
};

export function construireFamilleB(): ExerciceFamilleB_Problemes {
  const sousType: SousTypeB_Problemes = Math.random() < 0.5 ? "evaluer" : "resoudre";
  return CONSTRUCTEURS_PAR_SOUS_TYPE[sousType]();
}
