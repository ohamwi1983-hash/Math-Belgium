/**
 * Couche A (5e) — briques PARTAGÉES par les 3 types de Phase 2 de 5gen13 (résoudre/extremum
 * réutilisent directement `resoudreDansFenetre`, l'inéquation réutilise `construireBrancheT` pour
 * ses propres bornes). Généralise le "balayage + filtrage" déjà éprouvé sur 5gen10/5gen11 — jamais
 * de réduction modulo (une période ne divise pas toujours exactement la fenêtre), seulement un
 * filtrage des valeurs BRUTES qui tombent directement dans [0;fenêtre].
 */
import type { BrancheModelisation } from "../../core5e/modelisationSinusoide.types";

/** u=ω·t+φ ⟺ t=(u-φ)/ω — transforme une branche en u en la branche en t correspondante. */
export function construireBrancheT(brancheU: BrancheModelisation, omega: number, phi: number): BrancheModelisation {
  return { constante: (brancheU.constante - phi) / omega, periode: brancheU.periode / omega };
}

const N_MIN = -100;
const N_MAX = 100;
const TOLERANCE = 1e-6;

/** Balaie n sur CHAQUE branche fournie, filtre les valeurs qui tombent dans [0;fenêtre], fusionne
 * et déduplique (tolérance), trie par ordre croissant. */
export function resoudreDansFenetre(branches: BrancheModelisation[], fenetre: number): number[] {
  const brut: number[] = [];
  for (const branche of branches) {
    for (let n = N_MIN; n <= N_MAX; n++) {
      const v = branche.constante + n * branche.periode;
      if (v >= -TOLERANCE && v <= fenetre + TOLERANCE) brut.push(v);
    }
  }
  const triees = [...brut].sort((a, b) => a - b);
  const resultat: number[] = [];
  for (const v of triees) {
    if (resultat.length === 0 || v - resultat[resultat.length - 1] > TOLERANCE) resultat.push(v);
  }
  return resultat;
}
