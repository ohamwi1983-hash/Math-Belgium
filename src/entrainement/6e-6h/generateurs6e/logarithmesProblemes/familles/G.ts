import type { ExerciceLogProbG, SensEcran4G } from "../../../core6e/logarithmesProblemes.types";
import { arrondir, tirerEntier, tirerParmi } from "../aleatoire";

/**
 * Famille G — équilibre offre/demande, changement de variable `u=e^(mx)`. Réutilise la TECHNIQUE
 * (changement de variable + second degré + filtrage `u>0`) déjà établie par
 * `generateurs6e/equationsExponentielles/familles/C.ts` (6gen9) — jamais le fichier lui-même
 * (aucun import Couche A↔Couche A hors même famille de ce chantier, voir CLAUDE.md). Ici
 * `A·(u²-1)=B` (pas de terme linéaire en `u` : `o(x)=d(x)` ⟺ `A(u-1)=B/(u+1)` ⟺ `A(u²-1)=B`), donc
 * une seule racine positive `u=√((A+B)/A)`, jamais besoin d'un vrai discriminant.
 */
const A_POOL = [5000, 7000, 10000] as const;
const B_POOL = [8000, 10000, 12000] as const;
const M_POOL = [4, 5, 6] as const;

export function construireG(): ExerciceLogProbG {
  const A = tirerParmi(A_POOL);
  const B = tirerParmi(B_POOL);
  const m = tirerParmi(M_POOL);

  const x0 = tirerEntier(5, 40) / 100;
  const oX0 = A * (Math.exp(m * x0) - 1);
  const dX0 = B / (Math.exp(m * x0) + 1);

  const uEquilibre = Math.sqrt((A + B) / A);
  const xEquilibre = Math.log(uEquilibre) / m;

  const sensEcran4: SensEcran4G = tirerParmi(["offre", "demande"] as const);
  const xPick = tirerEntier(5, 60) / 100;
  const cibleBrute = sensEcran4 === "offre" ? A * (Math.exp(m * xPick) - 1) : B / (Math.exp(m * xPick) + 1);
  const cibleEcran4 = arrondir(cibleBrute, 0);
  const xEcran4 = sensEcran4 === "offre" ? Math.log(cibleEcran4 / A + 1) / m : Math.log(B / cibleEcran4 - 1) / m;

  return { famille: "G", A, B, m, x0, oX0, dX0, uEquilibre, xEquilibre, sensEcran4, cibleEcran4, xEcran4 };
}
