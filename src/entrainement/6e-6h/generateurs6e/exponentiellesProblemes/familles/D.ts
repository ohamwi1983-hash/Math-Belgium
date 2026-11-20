import type { ExerciceExpoProbD } from "../../../core6e/exponentiellesProblemes.types";
import { CONTEXTES_D } from "../contextes";
import { tirerParmi } from "../aleatoire";

/**
 * Famille D — modèle à asymptote non nulle `T(t) = L + C·r^t`, trois mesures à t = 0, d, 2d.
 *
 * **Données ENTIÈRES et EXACTES** (décision de l'utilisateur, audit 6e ch. 2, E1) : le rapport
 * ρ = r^d est tiré parmi des fractions à écriture décimale finie (1/2, 3/4, 4/5, 3/5, 2/5) et |C| est
 * un multiple du carré du dénominateur de ρ, de sorte que a = L + C, b = L + C·ρ et c = L + C·ρ²
 * sont des entiers. Calculés sur ces données imprimées, le rapport (b − c)/(a − b) redonne
 * EXACTEMENT ρ et L = a − (a − b)²/((a − b) − (b − c)) EXACTEMENT L — jamais de tirage dégénéré
 * (a − b = C(1 − ρ) ≠ C·ρ(1 − ρ) = b − c, puisque 0 < ρ < 1). Seul r = ρ^{1/d} est irrationnel
 * pour d ≥ 2 (écrit au millième dans le modèle) ; la prévision T(3d) = L + C·ρ³ est rationnelle.
 * « bas » (approche par en dessous, C < 0) : a = L − |C| ≥ 0 (pas de vitesse ni de score négatifs).
 */

/** ρ = num/den, à écriture décimale finie. */
const RAPPORTS: readonly { num: number; den: number }[] = [
  { num: 1, den: 2 },
  { num: 3, den: 4 },
  { num: 4, den: 5 },
  { num: 3, den: 5 },
  { num: 2, den: 5 },
];
const L_POOL = [10, 15, 20, 25] as const;
const D_POOL = [1, 2, 3] as const;
const C_MIN = 8;
const C_MAX = 40;

export function construireD(): ExerciceExpoProbD {
  const positif = tirerParmi([true, false]);
  const contexte = tirerParmi(CONTEXTES_D.filter((ctx) => ctx.signe === (positif ? "haut" : "bas")));
  const d = tirerParmi(D_POOL);
  for (;;) {
    const rho = tirerParmi(RAPPORTS);
    const L = tirerParmi(L_POOL);
    const pas = rho.den * rho.den;
    const magnitudes: number[] = [];
    for (let m = pas; m <= C_MAX; m += pas) if (m >= C_MIN && (positif || m <= L)) magnitudes.push(m);
    if (magnitudes.length === 0) continue;
    const magnitude = tirerParmi(magnitudes);
    const C = positif ? magnitude : -magnitude;
    // Valeurs exactes en entiers : C·ρ = C·num/den, C·ρ² = C·num²/den² (C multiple de den²).
    const a = L + C;
    const b = L + (C * rho.num) / rho.den;
    const c = L + (C * rho.num * rho.num) / (rho.den * rho.den);
    const rapport = rho.num / rho.den;
    const r = Math.pow(rapport, 1 / d);
    const tSuppl = 3 * d;
    const valeurSuppl = L + C * Math.pow(rapport, 3);
    return { famille: "D", contexteId: contexte.id, L, C, r, d, a, b, c, aAffiche: a, bAffiche: b, cAffiche: c, rapport, tSuppl, valeurSuppl };
  }
}
