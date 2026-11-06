/**
 * Couche A (5e) — famille "coherence" de 5gen14 (variante bonus 1) : r ET u_p (p!=1) TOUJOURS
 * donnés directement — structurellement le combo "r_up" du pipeline principal — PLUS une donnée
 * REDONDANTE u_q, parfois cohérente avec r/u_p, parfois délibérément perturbée d'un écart non nul.
 */
import type { ExerciceCoherenceSuiteArithmetique } from "../../core5e/suitesArithmetiques.types";
import { termeArithmetique, tirerU1EtR } from "./parametres";
import { tirerIndiceSn, tirerIndiceTermeEloigne } from "./principal";

const PROBABILITE_COHERENT = 0.5;

function entierAleatoire(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function tirerEcartNonNul(): number {
  const magnitude = entierAleatoire(1, 5);
  return Math.random() < 0.5 ? magnitude : -magnitude;
}

export function genererExerciceCoherence(): ExerciceCoherenceSuiteArithmetique {
  const { u1, r } = tirerU1EtR();
  const p = entierAleatoire(2, 14);
  let q = entierAleatoire(1, 15);
  while (q === p) q = entierAleatoire(1, 15);

  const coherent = Math.random() < PROBABILITE_COHERENT;
  const uqReel = termeArithmetique(u1, r, q);
  const uqValeur = coherent ? uqReel : uqReel + tirerEcartNonNul();

  const base = { u1, r };
  const bonus = coherent
    ? {
        indicesTermesProches: (() => {
          const n0 = entierAleatoire(2, 10);
          return [n0, n0 + 1, n0 + 2, n0 + 3] as [number, number, number, number];
        })(),
        indiceTermeEloigne: tirerIndiceTermeEloigne(u1, r),
        indiceSn: tirerIndiceSn(u1, r),
      }
    : {};

  return {
    famille: "coherence",
    base,
    r,
    p: { indice: p, valeur: termeArithmetique(u1, r, p) },
    q: { indice: q, valeur: uqValeur },
    coherent,
    ...bonus,
  };
}
