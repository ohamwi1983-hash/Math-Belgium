import type { ExerciceDomaineDeriveeC, ExerciceDomaineDeriveeCD, ExerciceDomaineDeriveeCE, ExerciceDomaineDeriveeCP } from "../../../core6e/domaineDeriveeExponentielles.types";
import { ENSEMBLE_R_PLUS, ensembleReel } from "../../ensembleReel";
import { tirerEntier, tirerParmi } from "../aleatoire";

const BASES = [2, 3, 4, 5, 6, 7, 8, 9] as const;

/**
 * Famille C — produit avec terme exponentiel (3 écrans : domaine, facteurs, assemblage). Chaque
 * sous-type est un produit `u(x)·v(x)` — la Couche B n'a jamais besoin de connaître le sous-type
 * pour l'écran "assemblage" (toujours `u'v+uv'`, vérifié contre la VRAIE f'(x) reconstruite
 * directement depuis les paramètres bruts, jamais depuis la saisie de l'écran "facteurs").
 *
 * Sous-type "d" (auto-référentiel) — f(x)=P(x)·e^(P(x)), P(x)=a·x³+b·x². Domaine ℝ. Astuce
 * (mentionnée en aide, jamais imposée) : f=u·e^u ⇒ f'=u'·e^u·(1+u) — mais le produit standard
 * u'v+uv' avec u=P(x), v=e^(P(x)) donne EXACTEMENT le même résultat (P'e^P+P·P'e^P=P'e^P(1+P)),
 * vérifié par test.
 *
 * Sous-type "e" — f(x)=x^r·e^(√x), r∈{1,2}. Domaine [0;+∞[.
 *
 * Sous-type "p" — f(x)=(base^x−c)·trig(x), base∈{2,...,9}, trig∈{sin,cos}. Domaine ℝ.
 */
export function construireC(): ExerciceDomaineDeriveeC {
  const r = Math.random();
  if (r < 1 / 3) return construireD();
  if (r < 2 / 3) return construireE();
  return construireP();
}

function construireD(): ExerciceDomaineDeriveeCD {
  const a = tirerParmi([1, 2, 3] as const);
  const b = tirerEntier(-6, -1);
  return { famille: "C", sousType: "d", domaine: ensembleReel(), a, b };
}

function construireE(): ExerciceDomaineDeriveeCE {
  const r = tirerParmi([1, 2] as const);
  return { famille: "C", sousType: "e", domaine: ENSEMBLE_R_PLUS, r };
}

function construireP(): ExerciceDomaineDeriveeCP {
  const base = tirerParmi(BASES);
  const c = tirerParmi([1, 2, 3] as const);
  const trig = tirerParmi(["sin", "cos"] as const);
  return { famille: "C", sousType: "p", domaine: ensembleReel(), base, c, trig };
}

export function evaluerFC(exercice: ExerciceDomaineDeriveeC, x: number): number {
  if (exercice.sousType === "d") {
    const p = exercice.a * x * x * x + exercice.b * x * x;
    return p * Math.exp(p);
  }
  if (exercice.sousType === "e") {
    return Math.pow(x, exercice.r) * Math.exp(Math.sqrt(x));
  }
  const trigDeX = exercice.trig === "sin" ? Math.sin(x) : Math.cos(x);
  return (Math.pow(exercice.base, x) - exercice.c) * trigDeX;
}
