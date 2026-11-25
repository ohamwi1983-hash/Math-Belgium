import type { ExerciceDenombCombA } from "../../core6e/denombrementCombine.types";
import { combinaisonBig } from "../../moteur6e/saisieCombinatoire";
import { melanger, tirerEntier, tirerParmi } from "./aleatoire";

/**
 * Famille A de `6gen44` — répartition en groupes NOMMÉS de tailles données : n!/(n₁!·n₂!·…).
 * Audit 6e ch. 7 (G5) : n ≤ 15 et 2 ou 3 groupes — le résultat reste calculable (au plus 630 630) ;
 * avant, n allait jusqu'à 52 et la réponse comptait jusqu'à 29 chiffres.
 */

const NOMS = ["Rouge", "Bleu", "Vert", "Jaune", "Orange", "Violet"];
const OBJETS = ["élèves", "joueurs", "scouts", "bénévoles"];

export function multinomial(n: number, tailles: number[]): number {
  let reste = n;
  let r = 1n;
  for (const t of tailles) {
    r *= combinaisonBig(reste, t);
    reste -= t;
  }
  return Number(r);
}

/** Tailles toutes différentes, chacune ≥ 2, de somme n. */
function tirerTailles(n: number, k: number): number[] {
  for (;;) {
    const t = Array.from({ length: k - 1 }, () => tirerEntier(2, n - 2));
    const derniere = n - t.reduce((a, b) => a + b, 0);
    const tailles = [...t, derniere];
    if (derniere >= 2 && new Set(tailles).size === k) return tailles;
  }
}

export function construireFamilleA(): ExerciceDenombCombA {
  const k = tirerParmi([2, 3] as const);
  const n = k === 2 ? tirerEntier(8, 15) : tirerEntier(9, 15);
  const tailles = tirerTailles(n, k);
  const noms = melanger(NOMS).slice(0, k);
  return { famille: "A", n, k, noms, tailles, objets: tirerParmi(OBJETS), resultat: multinomial(n, tailles) };
}
