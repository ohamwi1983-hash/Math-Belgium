// Copie 5e (6h) de `5e-4h/generateurs5e/sommeInfinieSituation/index.ts` (56gen7 ← 5gen48, chantier D du 26/11/2026) — copiée pour que les deux années puissent diverger.
import { donnees, estDecimalCourt } from "./core/sommeInfinieSituation.types";
import type { ExerciceFigures, ExercicePeriodique, ExerciceRebonds, ExerciceSommeInfinie, ExerciceZenon, IdVarianteSommeInfinie } from "./core/sommeInfinieSituation.types";

export type { IdVarianteSommeInfinie };

/**
 * Couche A (5e) — générateur de `5gen48` « Somme infinie en situation ». N'utilise QUE
 * `Math.random()` : le `?code=` (`export/codeExercice.ts::avecGraine`) rejoue exactement le même
 * tirage, dans l'appli comme dans l'adaptateur de feuilles (`exportEvaluation.ts`).
 *
 * Toutes les réponses sont exactes et faisables sans calculatrice :
 * - `periodique` : période de 1 à 3 chiffres, au plus un chiffre non périodique, partie entière ≤ 3 ;
 *   période minimale (ni « 33 » ni « 00 », jamais que des 9) et pré-période minimale (le dernier
 *   chiffre non périodique diffère du dernier chiffre de la période : 0,1212… n'est jamais écrit
 *   0,1(21)) ;
 * - `rebonds` : p ∈ {20, 25, 40, 50, 60, 75, 80} %, hauteur choisie pour que u₁ ait au plus deux
 *   décimales et S∞ au plus une ;
 * - `zenon` : avance multiple de k(k − 1), donc u₁ = avance/k et S∞ = avance/(k − 1) entiers ;
 * - `figures` : aire multiple de 12 (triangle : A/4, A/3 entiers) ou de 28 (hexagones : A/4, 4A/7
 *   entiers).
 * Le sous-cas (pur/mixte, triangle/hexagones) est tiré à pile ou face : il entre dans la `forme`.
 */

function entier(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function parmi<T>(t: readonly T[]): T {
  return t[Math.floor(Math.random() * t.length)];
}

function chiffres(longueur: number): string {
  let s = "";
  for (let i = 0; i < longueur; i++) s += String(entier(0, 9));
  return s;
}

/** Bloc minimal : pas « 00 », pas « 99 », pas un bloc plus court répété (« 33 », « 444 »). */
function periodeValide(p: string): boolean {
  if (/^0+$/.test(p) || /^9+$/.test(p)) return false;
  if (p.length > 1 && new Set(p).size === 1) return false;
  return true;
}

function construirePeriodique(): ExercicePeriodique {
  const sousCas = Math.random() < 0.5 ? "pur" : "mixte";
  for (;;) {
    if (sousCas === "pur") {
      const periode = chiffres(Math.random() < 0.7 ? 2 : 3);
      if (!periodeValide(periode)) continue;
      return { variante: "periodique", sousCas, entier: parmi([0, 0, 1, 2, 3]), avant: "", periode };
    }
    const avant = String(entier(1, 9));
    const periode = chiffres(Math.random() < 0.6 ? 1 : 2);
    if (!periodeValide(periode) || periode[periode.length - 1] === avant) continue;
    return { variante: "periodique", sousCas, entier: parmi([0, 0, 1, 2]), avant, periode };
  }
}

const POURCENTS = [20, 25, 40, 50, 60, 75, 80];
const HAUTEURS_CM = [60, 80, 90, 100, 120, 150, 160, 180, 200, 240];
const HAUTEURS_M = [2, 3, 4, 5, 6, 8, 9, 10, 12];

function construireRebonds(): ExerciceRebonds {
  const enMetres = Math.random() < 0.3;
  for (;;) {
    const e: ExerciceRebonds = enMetres
      ? { variante: "rebonds", objet: "ballon", hauteur: parmi(HAUTEURS_M), unite: "m", pourcent: parmi(POURCENTS) }
      : { variante: "rebonds", objet: Math.random() < 0.5 ? "balle" : "bille", hauteur: parmi(HAUTEURS_CM), unite: "cm", pourcent: parmi(POURCENTS) };
    const d = donnees(e);
    if (!estDecimalCourt(d.u1, 2) || !estDecimalCourt(d.sInfini, 1)) continue;
    return e;
  }
}

const K_PAR_CONTEXTE: Record<ExerciceZenon["contexte"], number[]> = {
  achille: [10, 5, 4],
  chien: [2, 3, 4],
  cycliste: [3, 4, 5],
};

function construireZenon(): ExerciceZenon {
  const contexte = parmi(["achille", "chien", "cycliste"] as const);
  const k = parmi(K_PAR_CONTEXTE[contexte]);
  const candidats: number[] = [];
  for (let v = 30; v <= 300; v += 10) if (v % (k * (k - 1)) === 0) candidats.push(v);
  return { variante: "zenon", contexte, avance: parmi(candidats), k };
}

function construireFigures(): ExerciceFigures {
  if (Math.random() < 0.5) return { variante: "figures", sousCas: "triangle", aire: 12 * entier(3, 30) };
  return { variante: "figures", sousCas: "hexagones", aire: 28 * entier(2, 15) };
}

export const CATALOGUE_VARIANTES: { id: IdVarianteSommeInfinie; label: string }[] = [
  { id: "periodique", label: "Nombre décimal périodique → fraction irréductible" },
  { id: "rebonds", label: "Balle qui rebondit : distance totale parcourue" },
  { id: "zenon", label: "Zénon : Achille et la tortue (poursuite par étapes)" },
  { id: "figures", label: "Figures emboîtées : triangles ou hexagones des milieux" },
];

export function construireAvecVarianteId(id: IdVarianteSommeInfinie): ExerciceSommeInfinie {
  switch (id) {
    case "periodique":
      return construirePeriodique();
    case "rebonds":
      return construireRebonds();
    case "zenon":
      return construireZenon();
    case "figures":
      return construireFigures();
  }
}

/** Tirage libre : les quatre familles à parts égales. */
export function genererExerciceSommeInfinie(): ExerciceSommeInfinie {
  return construireAvecVarianteId(parmi(CATALOGUE_VARIANTES).id);
}
