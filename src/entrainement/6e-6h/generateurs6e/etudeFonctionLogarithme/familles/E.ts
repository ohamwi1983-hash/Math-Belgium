import type { ExerciceEtudeLogE } from "../../../core6e/etudeFonctionLogarithme.types";
import type { CibleLimite } from "../../../core6e/limitesExponentielles.types";
import { ensembleUnMorceau, versLeHautDepuis } from "../../ensembleReel";
import { assemblerQcm, tirerParmi } from "../aleatoire";
import { candidat } from "../graphe";

const M_VALEURS = [-2, -1, 1, 2] as const;
const C_VALEURS = [1, 2, 3, 4] as const;

/**
 * Famille E — `f(x) = m(ln(x) + c/x)`, c>0.
 * - Domaine ]0;+∞[.
 * - x→0⁺ : c/x → +∞ l'emporte sur ln(x) → −∞ (x·ln(x) → 0, donc ln(x)+c/x = (x·ln(x)+c)/x) ⟹
 *   +∞·signe(m), asymptote verticale x=0. x→+∞ : +∞·signe(m), aucune asymptote (f(x)/x → 0).
 * - f'(x) = m(x−c)/x² : extremum en x=c (minimum si m>0, maximum si m<0).
 * - f''(x) = m(2c−x)/x³ : un point d'inflexion en x=2c.
 */
export function construireE(): ExerciceEtudeLogE {
  for (;;) {
    const m = tirerParmi(M_VALEURS);
    const c = tirerParmi(C_VALEURS);
    const params = { m, c, s: 1 };
    const reel = candidat("reel", params);
    const remarquables = [m * (Math.log(c) + 1)];
    const autresC = C_VALEURS.filter((v) => Math.abs(v - c) >= 2);
    const qcm = assemblerQcm("E", reel, remarquables, [
      () => candidat("extremumDecale", { ...params, c: tirerParmi(autresC) }),
      () => candidat("typeInverse", { ...params, m: -m }),
      () => candidat("sansExtremum", { ...params, s: -1 }),
    ]);
    if (qcm === null) continue;

    const versInfini: CibleLimite = m > 0 ? { type: "plus_infini" } : { type: "moins_infini" };
    return {
      famille: "E",
      m,
      c,
      domaine: ensembleUnMorceau(versLeHautDepuis(0, false)),
      limites: [versInfini, versInfini],
      asymptotes: [{ type: "verticale", p: 0 }, { type: "aucune" }],
      croissance: { type: m > 0 ? "minimum" : "maximum", position: c },
      croissanceLatex: String(c),
      concavite: { type: "inflexions", positions: [2 * c], positionsLatex: [String(2 * c)] },
      valeursRemarquables: remarquables,
      candidats: qcm.candidats,
      indexCorrect: qcm.indexCorrect,
    };
  }
}
