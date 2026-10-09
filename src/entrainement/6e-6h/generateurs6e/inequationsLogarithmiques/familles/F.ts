import type { ExerciceLogF } from "../../../core6e/inequationsLogarithmiques.types";
import { ensembleUnMorceau, versLeHautDepuis } from "../../ensembleReel";
import { tirerEntier, tirerEntierNonNul, tirerParmi } from "../aleatoire";

/**
 * Famille F — `log_a(g(x)) [comparateur] log_a(f(x))`, `g(x)=x-p`, `f(x)=g(x)+(x-r)²`, `r>p`
 * (garanti par construction — `r` toujours strictement à l'intérieur du domaine `x>p`).
 *
 * `comparateur` restreint à `{"<",">"}` (voir en-tête de `core6e/inequationsLogarithmiques.types.ts`
 * pour la preuve) : comme `f(x)-g(x)=(x-r)²≥0` toujours (égalité seulement en `x=r`),
 * - `a>1` (sens préservé) : `log_a(g) [comparateur] log_a(f)` équivaut à `g [comparateur] f`.
 *   - `comparateur="<"` : `g<f` vrai partout SAUF en `x=r` (où `g=f`) → domaine privé de `x=r`.
 *   - `comparateur=">"` : `g>f` jamais vrai (`g≤f` toujours) → ∅.
 * - `0<a<1` (sens inversé) : `g [inverse(comparateur)] f`.
 *   - `comparateur="<"` : devient `g>f`, jamais vrai → ∅.
 *   - `comparateur=">"` : devient `g<f`, vrai sauf en `x=r` → domaine privé de `x=r`.
 *
 * Donc `casVideEstSuperieurA1 = (comparateur===">")`.
 */

const COMPARATEURS_F = ["<", ">"] as const;

export function construireF(): ExerciceLogF {
  const p = tirerEntier(-4, 4);
  const r = p + tirerEntierNonNul(1, 6);
  const comparateur = tirerParmi(COMPARATEURS_F);

  const ceMorceau = versLeHautDepuis(p, false);
  const ceEcran1 = ensembleUnMorceau(ceMorceau);
  const casVideEstSuperieurA1 = comparateur === ">";

  // Domaine (p;+∞) privé du point r (r>p garanti, donc r est TOUJOURS intérieur au domaine).
  const ensembleSansR = {
    forme: "intervalles" as const,
    points: [],
    morceaux: [
      { inf: p, sup: r, infInclus: false, supInclus: false },
      { inf: r, sup: null, infInclus: false, supInclus: false },
    ],
  };

  return { famille: "F", p, r, comparateur, ceEcran1, casVideEstSuperieurA1, ensembleSansR };
}
