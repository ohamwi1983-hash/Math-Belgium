import type { ContextePoissonA, ExerciceLoiPoissonA } from "../../core6e/loiPoisson.types";
import { tirerEntier, tirerParmi } from "./aleatoire";
import { CONTEXTES_A } from "./contextes";
import { probabilitePoisson } from "./poisson";

/**
 * Couche A (6e) — génération famille A ("Approximation binomiale → Poisson") pour `6gen53`.
 * `n`/`p` sont des DONNÉES (jamais à identifier, contrairement à `6gen50` famille A) — seules les 3
 * conditions d'approximation (n≥30 ; p≤0,1 ; n·p≤15) restent à VÉRIFIER par l'élève, à l'écran 1.
 * `CANDIDATS_A` les respecte TOUJOURS par construction (spec : "garantis par construction").
 */

export const CANDIDATS_A: readonly { n: number; p: number }[] = [
  { n: 30, p: 0.1 },
  { n: 40, p: 0.1 },
  { n: 50, p: 0.08 },
  { n: 60, p: 0.05 },
  { n: 80, p: 0.1 },
  { n: 90, p: 0.05 },
  { n: 100, p: 0.05 },
  { n: 120, p: 0.1 },
  { n: 150, p: 0.08 },
  { n: 200, p: 0.05 },
];

/** k par défaut proche de λ (mode de la loi de Poisson) — une valeur "loin" de λ donnerait une
 * probabilité dégénérée (quasi nulle), peu intéressante pédagogiquement. */
function kParDefaut(lambda: number): number {
  const centre = Math.round(lambda);
  return Math.max(0, centre + tirerEntier(-2, 2));
}

/** Construction déterministe (`n`/`p` fixés, `k`/`contexte` optionnels) — utilisée par
 * `CATALOGUE_VARIANTES`/`construireAvecVarianteId`. */
export function construireFamilleA(n: number, p: number, k?: number, contexte?: ContextePoissonA): ExerciceLoiPoissonA {
  const lambda = n * p;
  const kFinal = k ?? kParDefaut(lambda);
  return { famille: "A", contexte: contexte ?? tirerParmi(CONTEXTES_A), n, p, lambda, k: kFinal, probabilite: probabilitePoisson(lambda, kFinal) };
}

export function genererFamilleA(): ExerciceLoiPoissonA {
  const { n, p } = tirerParmi(CANDIDATS_A);
  return construireFamilleA(n, p);
}
