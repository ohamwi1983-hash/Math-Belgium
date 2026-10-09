import type {
  ExerciceDomaineDeriveeLogC,
  ExerciceDomaineDeriveeLogCCarreLn,
  ExerciceDomaineDeriveeLogCExpoLn,
  ExerciceDomaineDeriveeLogCLnRacine,
  ExerciceDomaineDeriveeLogCProduitLn,
  ExerciceDomaineDeriveeLogCTrigLn,
} from "../../../core6e/domaineDeriveeLogarithme.types";
import { ensembleReel, ensembleUnMorceau, versLeBasJusque, versLeHautDepuis } from "../../ensembleReel";
import { tirerBaseLogAvecE, tirerEntier, tirerParmi } from "../aleatoire";

/**
 * Famille C — produit avec terme logarithmique (3 écrans : domaine, facteurs, assemblage). 5
 * sous-types.
 *
 * **Sous-type "trigLn"** : la spec littérale ("trig(x)·ln(trig2(x))") a un domaine périodique
 * infini, non représentable — voir `core6e/domaineDeriveeLogarithme.types.ts` pour la
 * justification du décalage `2+trig2(x)` (toujours dans [1;3], domaine ℝ).
 */
export function construireC(): ExerciceDomaineDeriveeLogC {
  const r = Math.random();
  if (r < 0.2) return construireProduitLn();
  if (r < 0.4) return construireTrigLn();
  if (r < 0.6) return construireExpoLn();
  if (r < 0.8) return construireCarreLn();
  return construireLnRacine();
}

/** f(x) = k·x·ln(x). Domaine x>0. */
function construireProduitLn(): ExerciceDomaineDeriveeLogCProduitLn {
  const k = tirerEntier(2, 6);
  return { famille: "C", sousType: "produitLn", domaine: ensembleUnMorceau(versLeHautDepuis(0, false)), k };
}

/** f(x) = trig(x)·ln(2+trig2(x)). Domaine ℝ. */
function construireTrigLn(): ExerciceDomaineDeriveeLogCTrigLn {
  const trig = tirerParmi(["sin", "cos"] as const);
  const trig2 = tirerParmi(["sin", "cos"] as const);
  return { famille: "C", sousType: "trigLn", domaine: ensembleReel(), trig, trig2 };
}

/** f(x) = base^x·ln(x). Domaine x>0. */
function construireExpoLn(): ExerciceDomaineDeriveeLogCExpoLn {
  const { base, baseEstE } = tirerBaseLogAvecE();
  return { famille: "C", sousType: "expoLn", domaine: ensembleUnMorceau(versLeHautDepuis(0, false)), base, baseEstE };
}

/** f(x) = x²·ln(mx+n). Domaine mx+n>0. */
function construireCarreLn(): ExerciceDomaineDeriveeLogCCarreLn {
  const m = tirerParmi([-4, -3, -2, -1, 1, 2, 3, 4] as const);
  const n = tirerEntier(-5, 5);
  const borne = -n / m;
  const domaine = ensembleUnMorceau(m > 0 ? versLeHautDepuis(borne, false) : versLeBasJusque(borne, false));
  return { famille: "C", sousType: "carreLn", domaine, m, n };
}

/** f(x) = ln(x)·√(x²−k²). Domaine [k;+∞[ (x>0 restreint la branche x≤-k). */
function construireLnRacine(): ExerciceDomaineDeriveeLogCLnRacine {
  const k = tirerEntier(1, 5);
  return { famille: "C", sousType: "lnRacine", domaine: ensembleUnMorceau(versLeHautDepuis(k, true)), k };
}
