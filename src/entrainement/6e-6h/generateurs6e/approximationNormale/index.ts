import type { EvenementAN, ExerciceAN } from "../../core6e/approximationNormale";
import { bornesCorrigees, probaExacte, zExact } from "../../core6e/approximationNormale";
import { entier, parmi } from "../../ui6e/nombresCombinatoireLotH2";

/**
 * Couche A — générateur de `6gen118` « Approximation normale avec correction de continuité ».
 * `Math.random()` seul (le `?code=` rejoue le tirage). Le VERDICT (approximable ou non) est tiré EN
 * PREMIER à parts égales ; pour « non », la condition en défaut (n ou p) à parts égales, avec les
 * valeurs limites n = 30, p = 0,3, p = 0,7 une fois sur quatre (piège de l'inégalité stricte). Puis le
 * contexte, n, p, et k pour que |z| soit entre 0,15 et 2,4 (approximable) ou que la probabilité exacte
 * soit entre 0,02 et 0,98 (non approximable).
 */

export const CATALOGUE_VARIANTES: { id: EvenementAN; label: string }[] = [
  { id: "auPlus", label: "P(X ≤ k)" },
  { id: "moinsDe", label: "P(X < k)" },
  { id: "auMoins", label: "P(X ≥ k)" },
  { id: "exactement", label: "P(X = k)" },
  { id: "entre", label: "P(k₁ ≤ X ≤ k₂)" },
];

const P_OK = [35, 40, 45, 50, 55, 60, 65];
const P_HORS = [5, 10, 15, 20, 25, 75, 80, 85, 90];

/** Contextes compatibles avec p (0 : pièce, p = 0,5 ; 1 : sondage ; 2 : graines ; 3 : défauts, p ≤ 0,25). */
function contexte(pc: number): number {
  if (pc === 50) return parmi([0, 1, 2]);
  if (pc <= 25) return parmi([1, 3]);
  return parmi([1, 2]);
}

function kPour(e: Omit<ExerciceAN, "k" | "k2">, v: EvenementAN): { k: number; k2: number } {
  const m = (e.n * e.pc) / 100;
  const s = Math.sqrt((e.n * e.pc * (100 - e.pc)) / 10000);
  const k = Math.round(m + (Math.random() * 3.6 - 1.8) * s);
  const k2 = v === "entre" ? k + Math.max(2, Math.round((0.5 + Math.random() * 1.5) * s)) : 0;
  return { k, k2 };
}

export function construire(v: EvenementAN, approximable = Math.random() < 0.5): ExerciceAN {
  const echec: "n" | "p" | null = approximable ? null : Math.random() < 0.5 ? "n" : "p";
  const limite = !approximable && Math.random() < 0.25;
  for (;;) {
    let n: number;
    let pc: number;
    if (approximable) {
      n = 20 * entier(2, 20);
      pc = parmi(P_OK);
    } else if (echec === "n") {
      n = limite ? 30 : entier(12, 29);
      pc = parmi(P_OK);
    } else {
      n = 10 * entier(4, 20);
      pc = limite ? parmi([30, 70]) : parmi(P_HORS);
    }
    const base = { variante: v, approximable, echec, ctx: contexte(pc), n, pc };
    const { k, k2 } = kPour(base, v);
    const e: ExerciceAN = { ...base, k, k2 };
    if (k < 1 || k > n - 1 || (v === "entre" && k2 > n - 1)) continue;
    if (approximable) {
      const zs = bornesCorrigees(e).map((b) => zExact(e, b));
      if (zs.some((z) => Math.abs(z) < 0.15 || Math.abs(z) > 2.4)) continue;
      if (zs.some((z) => Math.abs(z * 100 - Math.round(z * 100) - 0.5) < 0.02 || Math.abs(z * 100 - Math.round(z * 100) + 0.5) < 0.02)) continue;
    } else {
      const pe = probaExacte(e);
      if (pe < 0.02 || pe > 0.98) continue;
    }
    return e;
  }
}

export function construireAvecVariante(id: string): ExerciceAN {
  const v = CATALOGUE_VARIANTES.find((x) => x.id === id);
  return construire(v ? v.id : parmi(CATALOGUE_VARIANTES).id);
}

export function genererExerciceAN(): ExerciceAN {
  const approximable = Math.random() < 0.5;
  return construire(parmi(CATALOGUE_VARIANTES).id, approximable);
}
