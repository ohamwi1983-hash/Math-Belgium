import type { ExerciceEtudeLogC, SigneCroissance } from "../../../core6e/etudeFonctionLogarithme.types";
import type { CibleLimite } from "../../../core6e/limitesExponentielles.types";
import { ensemblePrivePoints } from "../../ensembleReel";
import { assemblerQcm, tirerParmi } from "../aleatoire";
import { candidat } from "../graphe";

const M_VALEURS = [-2, -1, 1, 2] as const;
const P_VALEURS = [-2, -1, 0, 1, 2] as const;
const Q_VALEURS = [1, 2, 3] as const;

/**
 * Famille C — `f(x) = m·ln|x² − 2px + p² − q²|` = m·ln|(x−p)² − q²|, racines entières r₁=p−q et
 * r₂=p+q (l'élève les trouve en factorisant le trinôme).
 * - Domaine ℝ∖{r₁ ; r₂} — ÉLARGI par la valeur absolue (piège : pas seulement là où le trinôme
 *   est positif).
 * - Aux racines, |…| → 0⁺ ⟹ m·ln(0⁺) = −∞·signe(m) des deux côtés ; aux infinis, +∞·signe(m).
 * - f'(x) = 2m(x−p)/((x−p)²−q²) : tableau de signe sur ]−∞;r₁[, ]r₁;p[, ]p;r₂[, ]r₂;+∞[, extremum
 *   local en x=p (maximum si m>0, minimum si m<0), de valeur f(p) = m·ln(q²) = 2m·ln(q).
 * - f''(x) = −2m((x−p)²+q²)/((x−p)²−q²)² : signe constant −signe(m) — concave (m>0) ou convexe
 *   (m<0) partout, jamais d'inflexion.
 */
export function construireC(): ExerciceEtudeLogC {
  for (;;) {
    const m = tirerParmi(M_VALEURS);
    const p = tirerParmi(P_VALEURS);
    const q = tirerParmi(Q_VALEURS);
    const r1 = p - q;
    const r2 = p + q;
    const params = { m, p, q };
    const reel = candidat("reel", params);
    const remarquables = [m * Math.log(q * q)];
    const qcm = assemblerQcm("C", reel, remarquables, [
      () => candidat("domaineRestreint", params, { domaineRestreint: true }),
      () => candidat("axeDecale", { ...params, p: p + tirerParmi([-1, 1]) }),
      () => candidat("typeInverse", { ...params, m: -m }),
    ]);
    if (qcm === null) continue;

    const versInfini: CibleLimite = m > 0 ? { type: "plus_infini" } : { type: "moins_infini" };
    const versRacine: CibleLimite = m > 0 ? { type: "moins_infini" } : { type: "plus_infini" };
    const signes: [SigneCroissance, SigneCroissance, SigneCroissance, SigneCroissance] =
      m > 0 ? ["decroissante", "croissante", "decroissante", "croissante"] : ["croissante", "decroissante", "croissante", "decroissante"];
    return {
      famille: "C",
      m,
      p,
      q,
      domaine: ensemblePrivePoints([r1, r2]),
      limites: [versInfini, versRacine, versRacine, versRacine, versRacine, versInfini],
      asymptotes: [
        { type: "verticale", p: r1 },
        { type: "verticale", p: r2 },
      ],
      croissance: {
        signes,
        extremum: m > 0 ? "maximum" : "minimum",
        positionExtremum: p,
        valeurExtremum: m * Math.log(q * q),
        valeurExtremumLatex: q === 1 ? "0" : `${2 * m}\\ln(${q})`,
      },
      concavite: m > 0 ? { type: "concave_partout", positions: [], positionsLatex: [] } : { type: "convexe_partout", positions: [], positionsLatex: [] },
      valeursRemarquables: remarquables,
      candidats: qcm.candidats,
      indexCorrect: qcm.indexCorrect,
    };
  }
}
