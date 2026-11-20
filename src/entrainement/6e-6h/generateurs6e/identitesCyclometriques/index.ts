import type { CoupleIdentite, ExerciceIdentites, Trig, VarianteIdentites } from "../../core6e/identitesCyclometriques.types";
import { DOMAINES, dansImage, domaineCorrect, toujoursPositif } from "../../moteur6e/modeleIdentitesCyclometriques";
import { melanger, parmi, q } from "../../ui6e/nombresExp";

/**
 * Couche A — générateur de `6gen153` « Identités trig∘arc et arc∘trig ». `Math.random()` seul (le
 * `?code=` rejoue le tirage). Verdicts tirés AVANT les nombres : θ dans / hors de l'image (50/50),
 * signe positif / négatif (50/50) — aucun nom de variante ne donne la réponse d'un écran.
 */

export const CATALOGUE_VARIANTES: { id: VarianteIdentites; label: string }[] = [
  { id: "arcTrig", label: "arcf(f(θ)) : θ ramené dans l'image" },
  { id: "trigArc", label: "g(arcf(a)) : identité et signe" },
  { id: "litteral", label: "g(arcf(kx)) : domaine et forme simplifiée" },
];

const TRIG: Trig[] = ["sin", "cos", "tan"];
const COUPLES: CoupleIdentite[] = ["cos_arcsin", "sin_arccos", "tan_arcsin", "tan_arccos", "sin_arctan", "cos_arctan"];
const SIGNE_DE_A: CoupleIdentite[] = ["tan_arcsin", "tan_arccos", "sin_arctan"];

/** a = p/q pour arcsin / arccos (|a| < 1, a ≠ 0) et pour arctan. */
const A_SIN_COS: [number, number][] = [
  [1, 2],
  [1, 3],
  [2, 3],
  [3, 5],
  [4, 5],
  [5, 13],
  [12, 13],
  [3, 4],
  [1, 4],
];
const A_TAN: [number, number][] = [
  [1, 2],
  [2, 1],
  [3, 4],
  [4, 3],
  [1, 1],
  [3, 1],
  [5, 12],
  [12, 5],
  [1, 3],
];

/** Angles candidats en douzièmes de π : multiples de π/6 et de π/4 dans [−2π ; 2π], θ ≠ 0. */
function anglesCandidats(fn: Trig): number[] {
  const out: number[] = [];
  for (let k = -24; k <= 24; k++) {
    if (k === 0 || (k % 2 !== 0 && k % 3 !== 0)) continue;
    if (fn === "tan" && Math.abs(Math.cos((k * Math.PI) / 12)) < 1e-9) continue;
    out.push(k);
  }
  return out;
}

export function construireAvecVariante(id: string): ExerciceIdentites {
  const variante = (CATALOGUE_VARIANTES.some((v) => v.id === id) ? id : "arcTrig") as VarianteIdentites;
  if (variante === "arcTrig") {
    const fn = parmi(TRIG);
    const dedans = Math.random() < 0.5;
    const k = parmi(anglesCandidats(fn).filter((x) => dansImage(fn, x) === dedans));
    const r = q(k, 12);
    return { variante, fn, n: r.n, d: r.d };
  }
  if (variante === "trigArc") {
    const negatif = Math.random() < 0.5;
    const couple = negatif ? parmi(SIGNE_DE_A) : parmi(COUPLES);
    const arctan = couple.endsWith("arctan");
    const [p, d] = parmi(arctan ? A_TAN : A_SIN_COS);
    // signe de a : imposé par le verdict pour les couples « signe de a », libre sinon (piège)
    const aNeg = negatif ? true : toujoursPositif(couple) ? Math.random() < 0.5 : false;
    return { variante, couple, a: q(aNeg ? -p : p, d) };
  }
  const couple = parmi(COUPLES);
  const k = parmi([2, 3, 4, 5]);
  const bon = domaineCorrect(couple);
  const autres = melanger(DOMAINES.filter((x) => x !== bon)).slice(0, 3);
  return { variante, couple, k, options: melanger([bon, ...autres]) };
}

export function genererExerciceIdentites(): ExerciceIdentites {
  return construireAvecVariante(parmi(CATALOGUE_VARIANTES).id);
}
