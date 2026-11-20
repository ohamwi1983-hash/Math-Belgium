import type { Exterieure, Interieure } from "../../core5e/domaineParImage";
import { fini, intersection, MOINS_INF, normaliser, PLUS_INF, REELS, reelsPrives } from "../../moteur5e/ensembleSaisi";
import type { Borne, Ensemble, Intervalle } from "../../moteur5e/ensembleSaisi";
import { q, qDiv, qMul, qSub } from "../../ui5e/nombresTrigo";
import type { Q } from "../../ui5e/nombresTrigo";

/**
 * Ensembles exacts de `5gen62` : dom g, Im g, dom f, et l'image réciproque g⁻¹(T) d'une réunion
 * d'intervalles T (bornes rationnelles ; une racine carrée n'est prise que d'un carré parfait —
 * sinon `PasRationnel`, et le générateur refait le tirage).
 */

export class PasRationnel extends Error {}

const racineEntiere = (n: number): number | null => {
  if (n < 0) return null;
  const r = Math.round(Math.sqrt(n));
  return r * r === n ? r : null;
};
function racineQ(x: Q): Q {
  const a = racineEntiere(x.n);
  const b = racineEntiere(x.d);
  if (a === null || b === null) throw new PasRationnel();
  return q(a, b);
}

const iv = (g: Borne, gf: boolean, d: Borne, df: boolean): Intervalle => ({ g, gf, d, df });

export function domaineInterieure(g: Interieure): Ensemble {
  if (g.famille === "racine") return [iv(fini(q(0)), true, PLUS_INF, false)];
  if (g.famille === "inverse") return reelsPrives([q(0)]);
  return REELS;
}

export function imageInterieure(g: Interieure): Ensemble {
  const k = fini(q(g.k));
  switch (g.famille) {
    case "carre":
    case "absolue":
    case "racine":
      return [iv(k, true, PLUS_INF, false)];
    case "oppCarre":
      return [iv(MOINS_INF, false, k, true)];
    case "affine":
      return REELS;
    case "inverse":
      return reelsPrives([q(g.k)]);
  }
}

export function domaineExterieure(f: Exterieure): Ensemble {
  const c = fini(q(f.c));
  switch (f.famille) {
    case "racine":
      return [iv(c, true, PLUS_INF, false)];
    case "racineMoins":
      return [iv(MOINS_INF, false, c, true)];
    case "inverse":
      return reelsPrives([q(f.c)]);
    case "inverseRacine":
      return [iv(c, false, PLUS_INF, false)];
    case "inverseRacineMoins":
      return [iv(MOINS_INF, false, c, false)];
  }
}

/** Transformation d'une borne finie (les infinis passent par `infini`). */
type Map = { fn: (x: Q) => Q; croissant: boolean; infini: (s: -1 | 1) => Borne };

function imageIntervalle(i: Intervalle, m: Map): Intervalle {
  const tb = (b: Borne): Borne => (b.inf === 0 ? fini(m.fn(b.q)) : m.infini(b.inf));
  const g = tb(i.g);
  const d = tb(i.d);
  // Une borne infinie ou rejetée à l'infini n'est jamais comprise.
  const ferme = (b: Borne, f: boolean) => f && b.inf === 0;
  return m.croissant ? iv(g, ferme(g, i.gf && i.g.inf === 0), d, ferme(d, i.df && i.d.inf === 0)) : iv(d, ferme(d, i.df && i.d.inf === 0), g, ferme(g, i.gf && i.g.inf === 0));
}

const versInf = (s: -1 | 1): Borne => (s === 1 ? PLUS_INF : MOINS_INF);

/** |x| ∈ U (U ⊂ [0 ; +∞[) → réunion symétrique. */
function symetrique(u: Ensemble): Ensemble {
  const r: Intervalle[] = [];
  for (const i of u) {
    r.push(i);
    r.push(imageIntervalle(i, { fn: (x) => q(-x.n, x.d), croissant: false, infini: (s) => versInf(s === 1 ? -1 : 1) }));
  }
  return normaliser(r);
}

/** Image réciproque g⁻¹(T), T ⊂ Im g. */
export function preimage(g: Interieure, t: Ensemble): Ensemble {
  const T = intersection(t, imageInterieure(g));
  const k = q(g.k);
  const moinsK: Map = { fn: (x) => qSub(x, k), croissant: true, infini: versInf };
  switch (g.famille) {
    case "carre":
    case "oppCarre": {
      // u = x² ≥ 0 : u = y − k (carré) ou u = k − y (opposé du carré).
      const u = T.map((i) => (g.famille === "carre" ? imageIntervalle(i, moinsK) : imageIntervalle(i, { fn: (x) => qSub(k, x), croissant: false, infini: (s) => versInf(s === 1 ? -1 : 1) })));
      const abs = u.map((i) => imageIntervalle(i, { fn: racineQ, croissant: true, infini: versInf }));
      return symetrique(normaliser(abs));
    }
    case "absolue":
      return symetrique(normaliser(T.map((i) => imageIntervalle(i, moinsK))));
    case "affine": {
      const m = q(g.m);
      return normaliser(T.map((i) => imageIntervalle(i, { fn: (y) => qDiv(qSub(y, q(g.k)), m), croissant: g.m > 0, infini: (s) => versInf((g.m > 0 ? s : -s) as -1 | 1) })));
    }
    case "racine":
      // √x = y − k ≥ 0, x = (y − k)².
      return normaliser(T.map((i) => imageIntervalle(imageIntervalle(i, moinsK), { fn: (x) => qMul(x, x), croissant: true, infini: versInf })));
    case "inverse": {
      // 1/x = u = y − k ≠ 0 ; x = 1/u, décroissante sur chaque demi-droite (u → 0 : x → ±∞).
      const u = normaliser(T.map((i) => imageIntervalle(i, moinsK)));
      const r: Intervalle[] = [];
      const zero = fini(q(0));
      for (const i of u) {
        for (const morceau of [intersection([i], [iv(zero, false, PLUS_INF, false)]), intersection([i], [iv(MOINS_INF, false, zero, false)])]) {
          for (const j of morceau) {
            const positif = j.g.inf === 1 || (j.g.inf === 0 && j.g.q.n >= 0);
            const inv = (b: Borne): Borne => fini(qDiv(q(1), b.q));
            if (positif) {
              const g2 = j.d.inf === 1 ? zero : inv(j.d);
              const d2 = j.g.inf === 0 && j.g.q.n === 0 ? PLUS_INF : inv(j.g);
              r.push(iv(g2, j.d.inf === 0 && j.df, d2, d2.inf === 0 && j.gf));
            } else {
              const g2 = j.d.inf === 0 && j.d.q.n === 0 ? MOINS_INF : inv(j.d);
              const d2 = j.g.inf === -1 ? zero : inv(j.g);
              r.push(iv(g2, g2.inf === 0 && j.df, d2, j.g.inf === 0 && j.gf));
            }
          }
        }
      }
      return normaliser(r);
    }
  }
}
