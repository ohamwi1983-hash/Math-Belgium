import type { ExerciceCM, ModeleCM } from "../../core6e/choisirModele";
import { MODELES_CM, probabilite, RAISONS_CM } from "../../core6e/choisirModele";
import { entier, melanger, parmi } from "../../ui6e/nombresCombinatoireLotH2";

/**
 * Couche A — générateur de `6gen119` « Choisir le modèle ». `Math.random()` seul (le `?code=` rejoue
 * le tirage). Le MODÈLE est tiré EN PREMIER, au sixième ; puis le contexte (trois par modèle), les
 * nombres (λ ajusté entre 1 et 8, z à deux décimales exact pour la loi normale, bornes entières pour la
 * loi uniforme), la question, et l'ordre des raisons (« aucune »). Probabilité demandée entre 0,01 et
 * 0,99.
 */

export const CATALOGUE_VARIANTES: { id: ModeleCM; label: string }[] = [
  { id: "binomiale", label: "Loi binomiale (QCM, dé, tirs)" },
  { id: "hypergeometrique", label: "Loi hypergéométrique (urne, comité, lot)" },
  { id: "poisson", label: "Loi de Poisson (appels, fautes, pannes)" },
  { id: "normale", label: "Loi normale (masses, tailles, trajets)" },
  { id: "uniforme", label: "Loi uniforme continue (bus, train, roue)" },
  { id: "aucune", label: "Aucune de ces lois" },
];

function donnees(m: ModeleCM, ctx: number): Record<string, number> {
  switch (m) {
    case "binomiale":
      if (ctx === 0) return { n: entier(8, 12), k: entier(2, 4), q: 0 };
      if (ctx === 1) {
        const n = entier(5, 10);
        return Math.random() < 0.5 ? { n, k: 0, q: 1 } : { n, k: entier(1, 3), q: 0 };
      }
      {
        const n = entier(5, 10);
        return { n, pc: parmi([60, 70, 80]), k: n - entier(1, 3), q: 0 };
      }
    case "hypergeometrique": {
      const [N, K, n] = ctx === 0 ? [entier(10, 20), 0, entier(3, 5)] : ctx === 1 ? [entier(12, 20), entier(4, 8), entier(3, 4)] : [entier(20, 40), entier(3, 6), entier(3, 5)];
      const KK = ctx === 0 ? entier(3, Math.floor(N / 2)) : K;
      return { N, K: KK, n, k: entier(1, Math.min(n - 1, KK)) };
    }
    case "poisson": {
      if (ctx === 0) return { r: parmi([6, 9, 12, 15, 18, 24]), t: parmi([10, 15, 20, 30]), ...question() };
      if (ctx === 1) return { r: parmi([5, 8, 12, 15, 20, 25]), m: parmi([1, 2, 4]), ...question() };
      return { r: parmi([6, 8, 12, 18, 24]), mois: parmi([1, 3]), ...question() };
    }
    case "normale": {
      const [mu, sigma] = ctx === 0 ? [parmi([250, 500, 1000]), entier(4, 10)] : ctx === 1 ? [entier(165, 180), entier(5, 9)] : [entier(20, 40), entier(3, 6)];
      for (;;) {
        const zc = (Math.random() < 0.5 ? 1 : -1) * entier(15, 220);
        if ((zc * sigma) % 10 !== 0) continue;
        return { mu, sigma, zc, q: Math.random() < 0.5 ? 1 : 0 };
      }
    }
    case "uniforme": {
      const [a, b, pas] = ctx === 0 ? [0, parmi([10, 12, 15, 20, 30]), 1] : ctx === 1 ? (() => {
        const a0 = parmi([5, 10, 15, 20]);
        return [a0, a0 + parmi([10, 15, 20, 25]), 1];
      })() : [0, 360, 30];
      const q = entier(0, 2);
      const nb = (b - a) / pas;
      if (q === 0) {
        const i = entier(1, nb - 2);
        const j = entier(i + 1, nb - 1);
        return { T: b, a, b, c: a + i * pas, d: a + j * pas, q };
      }
      return { T: b, a, b, c: a + entier(1, nb - 1) * pas, d: 0, q };
    }
    case "aucune":
      if (ctx === 0) return { k: entier(2, 4) };
      if (ctx === 1) return { s: entier(4, 10) };
      return { R: entier(2, 4), B: entier(3, 6), k: entier(2, 3) };
  }
}

function question(): { k: number; q: number } {
  return Math.random() < 0.3 ? { k: 0, q: 1 } : { k: entier(0, 4), q: 0 };
}

export function construire(m: ModeleCM): ExerciceCM {
  for (;;) {
    const ctx = entier(0, 2);
    const d = donnees(m, ctx);
    const e: ExerciceCM = { variante: m, ctx, d, raisons: melanger(RAISONS_CM) };
    if (m === "poisson") {
      const l = e.ctx === 0 ? (d.r! * d.t!) / 60 : e.ctx === 1 ? (d.r! * d.m!) / 10 : (d.r! * d.mois!) / 12;
      if (l < 1 || l > 8 || Math.abs(l * 4 - Math.round(l * 4)) > 1e-9) continue;
    }
    const v = probabilite(e).valeur;
    if (v < 0.01 || v > 0.99) continue;
    return e;
  }
}

export function construireAvecVariante(id: string): ExerciceCM {
  const v = CATALOGUE_VARIANTES.find((x) => x.id === id);
  return construire(v ? v.id : parmi(MODELES_CM));
}

export function genererExerciceCM(): ExerciceCM {
  return construire(parmi(MODELES_CM));
}
