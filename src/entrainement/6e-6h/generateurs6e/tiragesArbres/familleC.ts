import type { ExerciceFamilleC, ExerciceFamilleCParite, ExerciceFamilleCSpecial, FractionExacte } from "../../core6e/tiragesArbres.types";

/**
 * Couche A (6e) — génération famille C ("Distributions non uniformes, dé truqué") pour `6gen31`.
 * 2 sous-types (spec) :
 *
 * **`"special"`** — une face `faceSpeciale` a une probabilité FIXÉE `p0`, les 5 autres équiprobables
 * (`p` chacune, INCONNUE). Construction qui GARANTIT `p0 + 5·p = 1` exactement, en fractions
 * EXACTES : on tire d'abord `p = k/(5m)` (k∈{1,2,3}, m∈{4,5,6,7,8}, k<m ⟹ p<1/5), PUIS on en
 * DÉDUIT `p0 = 1 - 5p = (m-k)/m` — jamais l'inverse (tirer p0 puis en déduire p produirait un
 * dénominateur `5m` arbitraire, potentiellement peu lisible ; partir de `p` garantit que `p0`
 * retombe sur un dénominateur `m` simple). Preuve : `p0+5p = (m-k)/m + 5·k/(5m) = (m-k)/m + k/m =
 * m/m = 1`. ✓
 *
 * **`"parite"`** — faces paires ≡ `p` chacune, faces impaires ≡ `q` chacune, `p = r·q` (r∈{2,3},
 * DONNÉ). Système `3p+3q=1` ∧ `p=r·q` ⟹ `q=1/(3(r+1))`, `p=r/(3(r+1))` — CALCULÉ ici en fractions
 * exactes (jamais de flottant intermédiaire), résultat toujours "propre" pour r∈{2,3} (r=2 ⟹
 * p=2/9,q=1/9 ; r=3 ⟹ p=1/4,q=1/12).
 */

const M_SPECIAL: readonly number[] = [4, 5, 6, 7, 8];
const K_SPECIAL: readonly number[] = [1, 2, 3];
const R_PARITE: readonly (2 | 3)[] = [2, 3];
const FACES_PAIRES: readonly number[] = [2, 4, 6];
const FACES_IMPAIRES: readonly number[] = [1, 3, 5];
const CIBLES_ECRAN3_PARITE: readonly ("pair" | "impair" | "sousEnsemble")[] = ["pair", "impair", "sousEnsemble"];

function tirerEntier(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function tirerParmi<T>(candidats: readonly T[]): T {
  return candidats[Math.floor(Math.random() * candidats.length)];
}

function tirerFacesDistinctes(count: number): number[] {
  const faces: number[] = [];
  while (faces.length < count) {
    const f = tirerEntier(1, 6);
    if (!faces.includes(f)) faces.push(f);
  }
  return faces;
}

/** Construction déterministe (`m`/`k` fixés) pour le sous-type "special". */
export function construireFamilleCSpecial(m: number, k: number): ExerciceFamilleCSpecial {
  const p: FractionExacte = { num: k, den: 5 * m };
  const p0: FractionExacte = { num: m - k, den: m };
  const faceSpeciale = tirerEntier(1, 6);
  let autreFace = tirerEntier(1, 6);
  while (autreFace === faceSpeciale) autreFace = tirerEntier(1, 6);
  return { famille: "C", sousType: "special", faceSpeciale, p0, p, autreFace };
}

/** Construction déterministe (`r` fixé) pour le sous-type "parite". */
export function construireFamilleCParite(r: 2 | 3, ecran3Cible: "pair" | "impair" | "sousEnsemble" = tirerParmi(CIBLES_ECRAN3_PARITE)): ExerciceFamilleCParite {
  // q = 1/(3(r+1)), p = r/(3(r+1)) — voir en-tête de fichier.
  const den = 3 * (r + 1);
  const q: FractionExacte = { num: 1, den };
  const p: FractionExacte = { num: r, den };
  const sousEnsemble = ecran3Cible === "sousEnsemble" ? tirerFacesDistinctes(tirerEntier(2, 3)) : undefined;
  return { famille: "C", sousType: "parite", r, p, q, ecran3Cible, sousEnsemble };
}

/** Tirage ÉQUIPROBABLE du sous-type (spec : "sous-type tiré parmi (1)/(2)"), puis des paramètres
 * internes de ce sous-type. */
export function genererFamilleC(): ExerciceFamilleC {
  if (Math.random() < 0.5) return construireFamilleCSpecial(tirerParmi(M_SPECIAL), tirerParmi(K_SPECIAL));
  return construireFamilleCParite(tirerParmi(R_PARITE));
}

// ============================================================================
// Calculs purs — réutilisés par les TESTS de ce fichier (voir `familleA.ts`, même principe).
// ============================================================================

export function faceEstPaire(face: number): boolean {
  return face % 2 === 0;
}

export { FACES_IMPAIRES, FACES_PAIRES };
