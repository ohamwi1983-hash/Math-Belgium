import { ent, parmi, q } from "../communReels/outilsReels";
import type { Q } from "../communReels/outilsReels";
import type { ExerciceSansAbs, TermeAbs, VarianteSansAbs } from "./core/types";

/**
 * Couche A — générateur de `56gen19`. `Math.random()` seul (le `?code=` rejoue le tirage).
 * somme : |x − p| + |bx + c| ; difference : |x − p| − |bx + c| ; coefficient : α|x − p| + |bx + c| + k
 * (α ∈ {2, 3}, k ≠ 0). p ∈ {−6 … 6}, b ∈ {±1, ±2, ±3}, c ∈ {−9 … 9} ; zéros distincts, l'un des deux
 * fractionnaire une fois sur trois environ (b = ±2 ou ±3).
 */

export type IdVarianteSansAbs = VarianteSansAbs;

export const CATALOGUE_VARIANTES: { id: IdVarianteSansAbs; label: string }[] = [
  { id: "somme", label: "|x − a| + |bx + c|" },
  { id: "difference", label: "|x − a| − |bx + c|" },
  { id: "coefficient", label: "k|x − a| + |bx + c| + d" },
];

const valQ = (x: Q) => x.n / x.d;

/** Signe de a x + b sur l'intervalle repéré par un point x0 (jamais un zéro). */
const signeEn = (t: TermeAbs, x0: number) => Math.sign(t.a * x0 + t.b);

function construire(variante: VarianteSansAbs): ExerciceSansAbs {
  for (;;) {
    const p = ent(-6, 6);
    const b = parmi([-3, -2, -1, 1, 2, 3]);
    const c = ent(-9, 9);
    if (c === 0 && Math.random() < 0.7) continue;
    const t1: TermeAbs = { alpha: variante === "coefficient" ? parmi([2, 3]) : 1, a: 1, b: -p, zero: q(p) };
    const t2: TermeAbs = { alpha: variante === "difference" ? -1 : 1, a: b, b: c, zero: q(-c, b) };
    if (valQ(t1.zero) === valQ(t2.zero)) continue;
    if (Math.abs(valQ(t1.zero) - valQ(t2.zero)) < 1) continue;
    const k = variante === "coefficient" ? parmi([-5, -4, -3, -2, -1, 1, 2, 3, 4, 5]) : 0;
    const [z1, z2] = valQ(t1.zero) < valQ(t2.zero) ? [t1.zero, t2.zero] : [t2.zero, t1.zero];
    const repres = [valQ(z1) - 1, (valQ(z1) + valQ(z2)) / 2, valQ(z2) + 1];
    const morceaux = repres.map((x0) => {
      let pente = 0;
      let ordonnee = k;
      for (const t of [t1, t2]) {
        const s = signeEn(t, x0);
        pente += t.alpha * s * t.a;
        ordonnee += t.alpha * s * t.b;
      }
      return [pente, ordonnee] as [number, number];
    });
    // Deux morceaux voisins identiques : le découpage ne servirait à rien (rare, ex. pentes égales).
    if (morceaux[0][0] === morceaux[1][0] && morceaux[0][1] === morceaux[1][1]) continue;
    if (morceaux[1][0] === morceaux[2][0] && morceaux[1][1] === morceaux[2][1]) continue;
    return { variante, termes: [t1, t2], k, z1, z2, morceaux };
  }
}

export function construireAvecVarianteId(id: IdVarianteSansAbs): ExerciceSansAbs {
  return construire(id);
}

export function genererExerciceSansAbs(): ExerciceSansAbs {
  return construire(parmi(CATALOGUE_VARIANTES).id);
}
