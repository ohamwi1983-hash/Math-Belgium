import type { ExerciceDeuxDenominateurs } from "../../core/equationRationnelle.types";
import { randomInt } from "../secondDegre/aleatoire";
import { construireExerciceClassifie } from "./construireExerciceClassifie";

interface Parametres {
  p: number;
  s: number;
  t: number;
  A: number;
  k: number;
  racineValide: number;
}

/**
 * Tire p,s,t,A,k dans [-plage,plage] (spec section "Nouvelle construction") et vérifie que la
 * racine valide (As-kt)/(A-k) tombe sur un entier différent de p — sinon null, à réessayer.
 * `t` (racine du numérateur linéaire N(x)=k(x-t)) est exclu de `p` (correctif
 * prompt-1-renommage-et-correctifs-cas2.md) : si t=p, le facteur commun (x-p) apparaîtrait aussi
 * au numérateur, trahissant la réponse (la CE) avant toute factorisation par l'élève. `t` est
 * aussi exclu de `s` (prompt-3-simplifier-et-isolement-flexible.md) : si t=s, N(x) et D(x)
 * partageraient le facteur (x-s), donc N(x)/D(x) se réduirait à k/(x-p) — l'équation entière
 * s'effondrerait alors en un simple test numérique A=k (plus aucun x), un cas dégénéré que rien
 * dans le reste de l'architecture (bâtie sur une équation quadratique) ne sait traiter.
 */
function tirerParametres(plage: number): Parametres | null {
  const p = randomInt(-plage, plage);
  let s = randomInt(-plage, plage);
  while (s === p) s = randomInt(-plage, plage);
  let t = randomInt(-plage, plage);
  while (t === p || t === s) t = randomInt(-plage, plage);

  let A = randomInt(-plage, plage);
  while (A === 0) A = randomInt(-plage, plage);
  let k = randomInt(-plage, plage);
  while (k === 0 || k === A) k = randomInt(-plage, plage);

  const numerateur = A * s - k * t;
  const denominateur = A - k;
  if (numerateur % denominateur !== 0) return null;

  const racineValide = numerateur / denominateur;
  if (racineValide === p) return null;

  return { p, s, t, A, k, racineValide };
}

const TENTATIVES_PAR_PLAGE = 200;
/** Plages croissantes essayées successivement (spec : "élargir légèrement la plage de recherche"). */
const PLAGES = [6, 10, 15];

/**
 * Construction "deux dénominateurs partageant un facteur commun" (prompt-deux-denominateurs-
 * racine-etrangere.md) : A/(x-p) = N(x)/D(x), D(x)=(x-p)(x-s), N(x)=k(x-t). En croisant les
 * dénominateurs, A(x-p)(x-s) = k(x-t)(x-p), soit (x-p)·[(A-k)x + (kt-As)] = 0 — le facteur (x-p)
 * garantit toujours x=p comme racine (racine étrangère systématique), l'autre racine valant
 * (As-kt)/(A-k). Cherche des petits entiers p,s,t,A,k donnant une racine valide entière,
 * jamais tirés puis reclassés indépendamment du résultat : la classification de l'équation isolée
 * est une propriété émergente de ces paramètres (voir construireExerciceClassifie.ts), pas un
 * choix a priori comme dans secondDegre/index.ts.
 */
export function construireDeuxDenominateurs(): ExerciceDeuxDenominateurs {
  for (const plage of PLAGES) {
    for (let i = 0; i < TENTATIVES_PAR_PLAGE; i++) {
      const resultat = tirerParametres(plage);
      if (!resultat) continue;

      const { p, s, t, A, k, racineValide } = resultat;
      const equationIsolee = construireExerciceClassifie(A - k, p, racineValide);
      const ce = ([p, s] as [number, number]).sort((x, y) => x - y);

      // Jamais réductible : A/(x-p) est une constante sur un dénominateur monique (rien à
      // réduire) ; N(x)/D(x) a un dénominateur toujours monique (jamais de facteur numérique
      // commun avec N(x)) et t≠p, t≠s garantissent l'absence de racine partagée.
      return { construction: "deux_denominateurs", p, s, t, A, k, ce, equationIsolee, fractionsSimplifiables: [] };
    }
  }

  throw new Error("construireDeuxDenominateurs : aucune combinaison valide trouvée");
}
