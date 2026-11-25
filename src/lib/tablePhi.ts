/**
 * Table de la loi normale centrée réduite Φ(z) = P(Z ≤ z) — SOURCE UNIQUE des valeurs lues dans la
 * table (décision de l'utilisateur, 18/11/2026 : une table complète dans le cours, une table
 * consultable à l'écran — 6gen51 et tout générateur qui en a besoin —, une table en annexe papier).
 * Le composant d'affichage est `entrainement/components/TablePhi.tsx` ; l'annexe papier (lot E) devra
 * lire les MÊMES valeurs ici.
 *
 * Table : z de 0,00 à 3,49 (lignes 0,0 … 3,4, colonnes 0,00 … 0,09), Φ arrondie à 4 décimales.
 * Φ est calculée par la série entière de erf (|z| ≤ 4 : erreur < 10⁻¹³), donc chaque case est l'arrondi
 * correct de la vraie valeur, comme dans une table imprimée.
 */

export const Z_MAX_TABLE = 3.49;

/** erf par sa série entière (précise à 10⁻¹³ pour |x| ≤ 3). */
function erf(x: number): number {
  const ax = Math.abs(x);
  if (ax > 4.5) return Math.sign(x);
  let somme = 0;
  let terme = ax; // (−1)^k x^(2k+1) / k!
  for (let k = 0; k < 200; k++) {
    const ajout = terme / (2 * k + 1);
    somme += ajout;
    if (Math.abs(ajout) < 1e-17) break;
    terme *= (-ax * ax) / (k + 1);
  }
  return Math.sign(x) * ((2 / Math.sqrt(Math.PI)) * somme);
}

/** Φ(z) exacte (à 10⁻¹³ près). */
export function phiExacte(z: number): number {
  return 0.5 * (1 + erf(z / Math.SQRT2));
}

/** Inverse de Φ par dichotomie (p dans ]0 ; 1[). */
export function phiInverse(p: number): number {
  let lo = -8;
  let hi = 8;
  for (let i = 0; i < 80; i++) {
    const mid = (lo + hi) / 2;
    if (phiExacte(mid) < p) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

function arrondir(x: number, d: number): number {
  const f = 10 ** d;
  return Math.round(x * f + 1e-9) / f;
}

/** Case de la table pour z ≥ 0 arrondi au centième (au-delà de 3,49 : 0,9998 → 1 n'est pas lu). */
export function valeurTablePhi(z: number): number {
  const zc = arrondir(Math.abs(z), 2);
  return arrondir(phiExacte(Math.min(zc, Z_MAX_TABLE)), 4);
}

/** Lignes de la table (z de 0,0 à 3,4) : 10 valeurs par ligne. */
export function lignesTablePhi(): { z: number; valeurs: number[] }[] {
  const lignes: { z: number; valeurs: number[] }[] = [];
  for (let i = 0; i <= 34; i++) {
    const z = i / 10;
    lignes.push({ z, valeurs: Array.from({ length: 10 }, (_, j) => valeurTablePhi(arrondir(z + j / 100, 2))) });
  }
  return lignes;
}

/**
 * Lecture INVERSE de la table : les z ≥ 0 (au centième) dont la case est la plus proche de `p`
 * (p ≥ 0,5). Si p tombe entre deux cases, les DEUX voisines sont rendues (décision de l'audit :
 * « deux valeurs voisines acceptées ») ; si plusieurs z ont la même case (queue de table), tous.
 */
export function lectureInverseTable(p: number): number[] {
  const candidats: { z: number; v: number }[] = [];
  for (let i = 0; i <= Math.round(Z_MAX_TABLE * 100); i++) candidats.push({ z: i / 100, v: valeurTablePhi(i / 100) });
  let dessous: { z: number; v: number } | null = null;
  let dessus: { z: number; v: number } | null = null;
  for (const c of candidats) {
    if (c.v <= p + 1e-12) dessous = c;
    if (c.v >= p - 1e-12 && !dessus) dessus = c;
  }
  const r = new Set<number>();
  const exacts = candidats.filter((c) => Math.abs(c.v - p) < 1e-12);
  if (exacts.length > 0) exacts.forEach((c) => r.add(c.z));
  else {
    if (dessous) candidats.filter((c) => Math.abs(c.v - dessous!.v) < 1e-12).forEach((c) => r.add(c.z));
    if (dessus) candidats.filter((c) => Math.abs(c.v - dessus!.v) < 1e-12).forEach((c) => r.add(c.z));
  }
  return [...r].sort((a, b) => a - b);
}
