import type { ExerciceEtudeLogD } from "../../../core6e/etudeFonctionLogarithme.types";
import type { CibleLimite } from "../../../core6e/limitesExponentielles.types";
import { ensembleReel } from "../../ensembleReel";
import { assemblerQcm, tirerParmi } from "../aleatoire";
import { candidat } from "../graphe";

const M_VALEURS = [-2, -1, 1, 2] as const;
const P_VALEURS = [-2, -1, 0, 1, 2] as const;
const A_VALEURS = [1, 2, 3] as const;

/**
 * Famille D — `f(x) = m·ln(x² − 2px + p² + a²)` = m·ln((x−p)² + a²), trinôme sans racine (Δ<0).
 * - Domaine ℝ (le trinôme est toujours strictement positif — piège : vérifier son signe).
 * - Aux deux infinis : +∞·signe(m) ; aucune asymptote (f(x)/x → 0, ni horizontale ni oblique).
 * - f'(x) = 2m(x−p)/((x−p)²+a²) : extremum en x=p (minimum si m>0, maximum si m<0).
 * - f''(x) = 2m(a²−(x−p)²)/((x−p)²+a²)² : change de signe en x = p ± a — 2 points d'inflexion.
 */
export function construireD(): ExerciceEtudeLogD {
  for (;;) {
    const m = tirerParmi(M_VALEURS);
    const p = tirerParmi(P_VALEURS);
    const a = tirerParmi(A_VALEURS);
    const params = { m, p, a };
    const reel = candidat("reel", params);
    const remarquables = [m * Math.log(a * a)];
    const autresA = A_VALEURS.filter((v) => v !== a);
    const qcm = assemblerQcm("D", reel, remarquables, [
      () => candidat("extremumDecale", { ...params, p: p + tirerParmi([-1, 1]) * (a + 1) }),
      () => candidat("largeurDifferente", { ...params, a: tirerParmi(autresA) }),
      () => candidat("typeInverse", { ...params, m: -m }),
    ]);
    if (qcm === null) continue;

    const versInfini: CibleLimite = m > 0 ? { type: "plus_infini" } : { type: "moins_infini" };
    return {
      famille: "D",
      m,
      p,
      a,
      domaine: ensembleReel(),
      limites: [versInfini, versInfini],
      asymptotes: [{ type: "aucune" }, { type: "aucune" }],
      croissance: { type: m > 0 ? "minimum" : "maximum", position: p },
      croissanceLatex: String(p),
      concavite: { type: "inflexions", positions: [p - a, p + a], positionsLatex: [String(p - a), String(p + a)] },
      valeursRemarquables: remarquables,
      candidats: qcm.candidats,
      indexCorrect: qcm.indexCorrect,
    };
  }
}
