import type { DonneeNP, ExerciceNP, VarianteNP } from "../../core6e/normaleParametres";
import { caseLaPlusProche, phiTable } from "../../core6e/tablePhi";
import { entier, parmi } from "../../ui6e/nombresCombinatoireLotH2";

/**
 * Couche A — générateur de `6gen120` « Loi normale : retrouver μ ou σ ». `Math.random()` seul (le
 * `?code=` rejoue le tirage). μ et σ entiers (σ multiple de 10 pour les durées de vie), z au centième
 * (0,25 ≤ |z| ≤ 2,33) tel que x = μ + zσ ait au plus une décimale et que la case de la table soit
 * UNIQUE (aucune case voisine de même valeur) ; signe de z et sens de la proportion tirés à parts
 * égales, indépendamment.
 */

export const CATALOGUE_VARIANTES: { id: VarianteNP; label: string }[] = [
  { id: "sigma", label: "Retrouver σ (μ connu, une proportion)" },
  { id: "mu", label: "Retrouver μ (σ connu, une proportion)" },
  { id: "systeme", label: "Retrouver μ et σ (deux proportions)" },
];

const MU_SIGMA: (() => { mu: number; sigma: number })[] = [
  () => ({ mu: entier(160, 180), sigma: entier(5, 10) }),
  () => ({ mu: parmi([250, 500, 1000]), sigma: entier(4, 12) }),
  () => ({ mu: entier(16, 30) * 50, sigma: entier(4, 12) * 10 }),
];

function zValide(zc: number, sigma: number): boolean {
  if ((zc * sigma) % 10 !== 0) return false;
  const v = phiTable(Math.abs(zc) / 100);
  const c = caseLaPlusProche(v);
  return c.unique && Math.round(c.z * 100) === Math.abs(zc) && phiTable((Math.abs(zc) - 1) / 100) !== v && phiTable((Math.abs(zc) + 1) / 100) !== v;
}

function donnee(sigma: number, signe?: 1 | -1, sens?: "inf" | "sup"): DonneeNP {
  const s = signe ?? (Math.random() < 0.5 ? 1 : -1);
  const se = sens ?? (Math.random() < 0.5 ? "inf" : "sup");
  for (;;) {
    const zc = s * entier(25, 233);
    if (zValide(zc, sigma)) return { zc, sens: se };
  }
}

export function construire(v: VarianteNP): ExerciceNP {
  const ctx = entier(0, MU_SIGMA.length - 1);
  const { mu, sigma } = MU_SIGMA[ctx]!();
  if (v !== "systeme") return { variante: v, ctx, mu, sigma, donnees: [donnee(sigma)] };
  for (;;) {
    const d1 = donnee(sigma, -1, "inf");
    const d2 = donnee(sigma, 1, "sup");
    if (d2.zc - d1.zc >= 60) return { variante: v, ctx, mu, sigma, donnees: [d1, d2] };
  }
}

export function construireAvecVariante(id: string): ExerciceNP {
  const v = CATALOGUE_VARIANTES.find((x) => x.id === id);
  return construire(v ? v.id : parmi(CATALOGUE_VARIANTES).id);
}

export function genererExerciceNP(): ExerciceNP {
  return construire(parmi(CATALOGUE_VARIANTES).id);
}
