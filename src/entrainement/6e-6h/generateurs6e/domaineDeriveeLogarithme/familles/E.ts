import type {
  ExerciceDomaineDeriveeLogE,
  ExerciceDomaineDeriveeLogECombinaison,
  ExerciceDomaineDeriveeLogEDejaSimplifie,
  ExerciceDomaineDeriveeLogEPuissanceAbs,
  ExerciceDomaineDeriveeLogEPuissanceSimple,
  ExerciceDomaineDeriveeLogEQuotientDifference,
  ExerciceDomaineDeriveeLogEValeurAbsolueQuadratique,
} from "../../../core6e/domaineDeriveeLogarithme.types";
import { ensemblePrivePoints, ensembleUnMorceau, versLeHautDepuis } from "../../ensembleReel";
import { tirerEntier, tirerParmi } from "../aleatoire";

/**
 * Famille E — simplifier via les propriétés du log avant de dériver (3 écrans : domaine,
 * simplifier, dérivée) — piège central du générateur. 6 sous-types, domaine calculé sur
 * l'expression ORIGINALE (avant simplification) — voir `core6e/domaineDeriveeLogarithme.types.ts`
 * pour la construction "cible d'abord" du sous-type "quotientDifference" (`m>0`, `p<0`, garantit
 * un domaine réel EXACTEMENT égal à "les deux positifs séparément", jamais la branche "les deux
 * négatifs").
 */
export function construireE(): ExerciceDomaineDeriveeLogE {
  const r = Math.random();
  if (r < 1 / 6) return construirePuissanceAbs();
  if (r < 2 / 6) return construireQuotientDifference();
  if (r < 3 / 6) return construirePuissanceSimple();
  if (r < 4 / 6) return construireCombinaison();
  if (r < 5 / 6) return construireValeurAbsolueQuadratique();
  return construireDejaSimplifie();
}

/** f(x) = ln((e^x−1)²) → 2ln|e^x−1|. Domaine ℝ\{0}. */
function construirePuissanceAbs(): ExerciceDomaineDeriveeLogEPuissanceAbs {
  return { famille: "E", sousType: "puissanceAbs", domaine: ensemblePrivePoints([0]) };
}

/** f(x) = ln((mx+n)/(px+q)) → ln(mx+n)−ln(px+q). "Cible d'abord" : `r1<r2` choisis EN PREMIER,
 * `m>0`/`p<0` tirés ensuite, `n`/`q` DÉRIVÉS pour que `mx+n=0` en `x=r1` et `px+q=0` en `x=r2`
 * exactement — garantit un domaine réel `]r1;r2[` où mx+n>0 ET px+q>0 séparément (jamais la
 * branche "les deux négatifs", voir note de tête `core6e/domaineDeriveeLogarithme.types.ts`). */
function construireQuotientDifference(): ExerciceDomaineDeriveeLogEQuotientDifference {
  const r1 = tirerEntier(-3, 2);
  const gap = tirerEntier(2, 5);
  const r2 = r1 + gap;
  const m = tirerEntier(1, 3);
  const p = tirerParmi([-3, -2, -1] as const);
  const n = -r1 * m;
  const q = -r2 * p;
  const domaine = ensembleUnMorceau({ inf: r1, sup: r2, infInclus: false, supInclus: false });
  return { famille: "E", sousType: "quotientDifference", domaine, m, n, p, q };
}

/** f(x) = ln(√x) → (1/2)ln(x). Domaine x>0. */
function construirePuissanceSimple(): ExerciceDomaineDeriveeLogEPuissanceSimple {
  return { famille: "E", sousType: "puissanceSimple", domaine: ensembleUnMorceau(versLeHautDepuis(0, false)) };
}

/** f(x) = (ln x)³−ln(x³) → (ln x)³−3ln(x). Domaine x>0. */
function construireCombinaison(): ExerciceDomaineDeriveeLogECombinaison {
  return { famille: "E", sousType: "combinaison", domaine: ensembleUnMorceau(versLeHautDepuis(0, false)) };
}

/** f(x) = ln((x²−k²)²) → 2ln|x²−k²|. Domaine ℝ\{-k;k}. */
function construireValeurAbsolueQuadratique(): ExerciceDomaineDeriveeLogEValeurAbsolueQuadratique {
  const k = tirerEntier(1, 5);
  return { famille: "E", sousType: "valeurAbsolueQuadratique", domaine: ensemblePrivePoints([-k, k]), k };
}

/** f(x) = ln(x^x) → x·ln(x). Domaine x>0. */
function construireDejaSimplifie(): ExerciceDomaineDeriveeLogEDejaSimplifie {
  return { famille: "E", sousType: "dejaSimplifie", domaine: ensembleUnMorceau(versLeHautDepuis(0, false)) };
}
