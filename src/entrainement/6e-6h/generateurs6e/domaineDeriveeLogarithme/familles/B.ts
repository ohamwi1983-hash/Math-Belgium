import type {
  ExerciceDomaineDeriveeLogB,
  ExerciceDomaineDeriveeLogBDoubleContrainte,
  ExerciceDomaineDeriveeLogBQuadratique,
  ExerciceDomaineDeriveeLogBRacineInterne,
  ExerciceDomaineDeriveeLogBRacineSimplifiee,
} from "../../../core6e/domaineDeriveeLogarithme.types";
import type { MorceauIntervalle } from "../../../core6e/ensembleReel.types";
import { ensembleDeuxMorceaux, ensembleUnMorceau, versLeBasJusque, versLeHautDepuis } from "../../ensembleReel";
import { tirerBaseLogEntiere, tirerEntier, tirerParmi } from "../aleatoire";

/**
 * Famille B — domaine via racine/quadratique, parfois double contrainte (2 écrans : domaine,
 * dérivée). 4 sous-types, base TOUJOURS entière (spec littérale, jamais `e` pour cette famille).
 */
function morceauBorne(inf: number, infInclus: boolean, sup: number, supInclus: boolean): MorceauIntervalle {
  return inf <= sup ? { inf, sup, infInclus, supInclus } : { inf: sup, sup: inf, infInclus: supInclus, supInclus: infInclus };
}

export function construireB(): ExerciceDomaineDeriveeLogB {
  const r = Math.random();
  if (r < 0.25) return construireDoubleContrainte();
  if (r < 0.5) return construireRacineInterne();
  if (r < 0.75) return construireQuadratique();
  return construireRacineSimplifiee();
}

/** f(x) = √(1−log_base(mx+n)), m∈{1,-1} ("cible d'abord" — voir `core6e/domaineDeriveeLogarithme.types.ts`
 * pour la justification de cette restriction). Domaine : 0 < mx+n ≤ base. */
function construireDoubleContrainte(): ExerciceDomaineDeriveeLogBDoubleContrainte {
  const base = tirerBaseLogEntiere();
  const m = tirerParmi([1, -1] as const);
  const n = tirerEntier(-4, 4);
  const borne1 = -n / m; // mx+n=0, exclu (argument du log)
  const borne2 = (base - n) / m; // mx+n=base, inclus (radicande=0)
  const domaine = ensembleUnMorceau(morceauBorne(borne1, false, borne2, true));
  return { famille: "B", sousType: "doubleContrainte", domaine, base, m, n };
}

/** f(x) = log_base(√(1−x²)). Domaine ]-1;1[. */
function construireRacineInterne(): ExerciceDomaineDeriveeLogBRacineInterne {
  const base = tirerBaseLogEntiere();
  const domaine = ensembleUnMorceau(morceauBorne(-1, false, 1, false));
  return { famille: "B", sousType: "racineInterne", domaine, base };
}

/** f(x) = log_base(x²−k²). Domaine ]-∞;-k[∪]k;+∞[. */
function construireQuadratique(): ExerciceDomaineDeriveeLogBQuadratique {
  const base = tirerBaseLogEntiere();
  const k = tirerEntier(1, 5);
  const domaine = ensembleDeuxMorceaux(versLeBasJusque(-k, false), versLeHautDepuis(k, false));
  return { famille: "B", sousType: "quadratique", domaine, base, k };
}

/** f(x) = log_base(√(x−p)). Domaine simplifié ]p;+∞[. */
function construireRacineSimplifiee(): ExerciceDomaineDeriveeLogBRacineSimplifiee {
  const base = tirerBaseLogEntiere();
  const p = tirerEntier(-5, 5);
  const domaine = ensembleUnMorceau(versLeHautDepuis(p, false));
  return { famille: "B", sousType: "racineSimplifiee", domaine, base, p };
}
