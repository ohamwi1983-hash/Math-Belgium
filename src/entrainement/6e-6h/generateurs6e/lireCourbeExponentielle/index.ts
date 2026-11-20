import type { ExerciceLireCourbeExpo, VarianteLireCourbeExpo } from "../../core6e/lireCourbeExponentielle";
import type { Rat } from "../../ui6e/nombresExpoLotG";
import { rat } from "../../ui6e/nombresExpoLotG";

/**
 * Couche A — générateur de `6gen148` « Lire une courbe exponentielle y = k·aˣ + c ». `Math.random()`
 * seul : le `?code=` rejoue le même tirage dans l'appli et dans l'adaptateur papier.
 *
 * Base tirée uniformément dans {2, 3, 4, 1/2, 1/3, 1/4} (sens de variation de aˣ : 50/50), puis k
 * parmi les entiers ±1…±4 qui rendent ENTIÈRE l'ordonnée du second point (k·a entier en `droite`,
 * k/a entier en `gauche`), écart à l'asymptote au plus 8 (figure lisible), signe de k 50/50 ; c
 * uniforme dans {−3, …, 3} (c = 0 : cas particulier « asymptote confondue avec l'axe »).
 */

const BASES: Rat[] = [rat(2), rat(3), rat(4), rat(1, 2), rat(1, 3), rat(1, 4)];

function parmi<T>(t: readonly T[]): T {
  return t[Math.floor(Math.random() * t.length)];
}

function kAdmissibles(base: Rat, xAutre: 1 | -1): number[] {
  const r: number[] = [];
  for (let k = 1; k <= 4; k++) {
    const ecart = xAutre === 1 ? (k * base.num) / base.den : (k * base.den) / base.num;
    if (Number.isInteger(ecart) && ecart <= 8) r.push(k);
  }
  return r;
}

export function construire(variante: VarianteLireCourbeExpo): ExerciceLireCourbeExpo {
  const xAutre: 1 | -1 = variante === "droite" ? 1 : -1;
  const base = parmi(BASES);
  const k = parmi(kAdmissibles(base, xAutre)) * (Math.random() < 0.5 ? 1 : -1);
  const c = Math.floor(Math.random() * 7) - 3;
  const pZero = Math.random() < 0.5;
  return {
    variante,
    k,
    base,
    c,
    xAutre,
    lettreZero: pZero ? "P" : "Q",
    lettreAutre: pZero ? "Q" : "P",
    cleCollecteur: `${variante}/a${base.num}_${base.den}/k${k > 0 ? "+" : "-"}/c${c === 0 ? 0 : 1}`,
  };
}

/** Catalogue dev (`SelecteurVarianteDev`) — libellés neutres (ce que l'écran montre), jamais la réponse. */
export const CATALOGUE_VARIANTES: { id: VarianteLireCourbeExpo; label: string }[] = [
  { id: "droite", label: "Points marqués d'abscisses 0 et 1" },
  { id: "gauche", label: "Points marqués d'abscisses −1 et 0" },
];

export function construireAvecVarianteId(id: VarianteLireCourbeExpo): ExerciceLireCourbeExpo {
  return construire(id);
}

export function genererExerciceLireCourbeExpo(): ExerciceLireCourbeExpo {
  return construire(parmi(CATALOGUE_VARIANTES).id);
}
