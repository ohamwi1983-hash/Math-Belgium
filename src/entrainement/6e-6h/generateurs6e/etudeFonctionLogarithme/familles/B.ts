import type { ExerciceEtudeLogB } from "../../../core6e/etudeFonctionLogarithme.types";
import type { CibleLimite } from "../../../core6e/limitesExponentielles.types";
import { ensembleUnMorceau, versLeHautDepuis } from "../../ensembleReel";
import { assemblerQcm, tirerParmi } from "../aleatoire";
import { candidat } from "../graphe";

const A_VALEURS = [1, 2] as const;
/** Coefficient b de la base (bx), en fraction num/den. */
const B_VALEURS = [
  { num: 1, den: 2 },
  { num: 1, den: 1 },
  { num: 2, den: 1 },
  { num: 3, den: 1 },
] as const;
const C_VALEURS = [-2, -1, 0, 1, 2] as const;

/** Forme exacte de 1/(be). */
export function positionMinimumBLatex(bNum: number, bDen: number): string {
  // 1/(b·e) = den/(num·e)
  const numerateur = bDen;
  const denominateur = bNum === 1 ? "e" : `${bNum}e`;
  return `\\dfrac{${numerateur}}{${denominateur}}`;
}

/**
 * Famille B — `f(x) = (bx)^{ax} + c` (dérivation logarithmique, x>0).
 * - Domaine ]0;+∞[ (base d'une puissance à exposant variable STRICTEMENT positive).
 * - x→0⁺ : (bx)^{ax} = e^{ax·ln(bx)} et ax·ln(bx) → 0 (croissances comparées) ⟹ limite 1+c.
 *   PIÈGE : limite FINIE en une borne FINIE du domaine — ce n'est PAS une asymptote.
 *   x→+∞ : +∞, aucune asymptote (croissance plus rapide que toute droite).
 * - ln(f−c) = ax·ln(bx) ⟹ (f−c)'/(f−c) = a(ln(bx)+1), nul en x = 1/(be) : minimum.
 * - f'' = (f−c)·[a²(ln(bx)+1)² + a/x] > 0 : convexe partout.
 * 4 valeurs de b × 5 valeurs de c : 20 jeux de réponses distincts (a ne change que la courbe).
 */
export function construireB(): ExerciceEtudeLogB {
  for (;;) {
    const a = tirerParmi(A_VALEURS);
    const b = tirerParmi(B_VALEURS);
    const c = tirerParmi(C_VALEURS);
    const xMinimum = 1 / ((b.num / b.den) * Math.E);
    const valeurMinimum = Math.pow((b.num / b.den) * xMinimum, a * xMinimum) + c;

    const params = { a, bNum: b.num, bDen: b.den, c, s: 1 };
    const reel = candidat("reel", params);
    const remarquables = [1 + c, valeurMinimum];
    const autresB = B_VALEURS.filter((v) => v.num !== b.num || v.den !== b.den);
    const qcm = assemblerQcm("B", reel, remarquables, [
      () => {
        const b2 = tirerParmi(autresB);
        return candidat("minimumDecale", { ...params, bNum: b2.num, bDen: b2.den });
      },
      () => candidat("limiteZeroDecalee", { ...params, c: c + tirerParmi([-2, 2]) }),
      () => candidat("typeInverse", { ...params, s: -1 }),
    ]);
    if (qcm === null) continue;

    const limiteZero: CibleLimite = 1 + c === 0 ? { type: "zero" } : { type: "valeur", valeur: 1 + c };
    return {
      famille: "B",
      a,
      bNum: b.num,
      bDen: b.den,
      c,
      domaine: ensembleUnMorceau(versLeHautDepuis(0, false)),
      limites: [limiteZero, { type: "plus_infini" }],
      asymptotes: [{ type: "aucune" }, { type: "aucune" }],
      croissance: { type: "minimum", position: xMinimum },
      croissanceLatex: positionMinimumBLatex(b.num, b.den),
      concavite: { type: "convexe_partout", positions: [], positionsLatex: [] },
      valeursRemarquables: remarquables,
      candidats: qcm.candidats,
      indexCorrect: qcm.indexCorrect,
    };
  }
}
