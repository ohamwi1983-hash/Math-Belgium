/**
 * Couche A — géométrie des racines/intervalles, PARTAGÉE par les 4 familles (module FRÈRE, même
 * principe que `generateurs/optimisation/optimum.ts`). `f(x) = -a_abs·(x-xS)² + yS` (parabole
 * concave) ou `f(x) = a_abs·(x-xS)² + yS` (convexe) — n'importe laquelle des deux, cette géométrie
 * ne dépend que de `xS`/`delta` (jamais de `a_abs`/`yS`) : les 2 racines de `f(x)=k` sont TOUJOURS
 * `xS-delta`/`xS+delta` par construction ("cible d'abord" — chaque famille choisit `delta` ENTIER
 * en premier, `k` en est DÉRIVÉ, jamais l'inverse).
 *
 * `genererDeltaEtDomaine` choisit `delta` PUIS un domaine, avec un ratio ~50/50 entre domaine
 * "large" (les 2 racines valides) et domaine "clip" (une seule racine valide, l'autre rejetée —
 * piège central de l'écran "validation" côté `equation" ; côté `inequation`, un clip garantit une
 * intersection RÉELLE avec l'intervalle brut plutôt qu'une simple inclusion déjà satisfaite).
 *
 * **Invariant à la charge de l'appelant** (même convention que `genererDomaine`, gen55) : chaque
 * famille doit choisir `xS` avec une marge d'au moins `DELTA_MAX+MARGE_LARGE_MAX` par rapport à
 * `xMinPossible`, faute de quoi le clamp sur `xMinPossible` pourrait fausser le ratio 1-racine/
 * 2-racines — vérifié empiriquement par tirage massif dans `racines.test.ts` et dans le test de
 * chaque famille consommatrice, jamais supposé sans preuve.
 */
import { randomInt } from "./aleatoire";

export interface DeltaEtDomaine {
  delta: number;
  domaine: { inf: number; sup: number };
}

const DELTA_MIN = 3;
const DELTA_MAX = 8;
const MARGE_LARGE_MIN = 1;
const MARGE_LARGE_MAX = 3;
const RATIO_CLIP = 0.5;

export function genererDeltaEtDomaine(xS: number, xMinPossible: number): DeltaEtDomaine {
  const delta = randomInt(DELTA_MIN, DELTA_MAX);

  if (Math.random() >= RATIO_CLIP) {
    const margeGauche = randomInt(MARGE_LARGE_MIN, MARGE_LARGE_MAX);
    const margeDroite = randomInt(MARGE_LARGE_MIN, MARGE_LARGE_MAX);
    return {
      delta,
      domaine: { inf: Math.max(xMinPossible, xS - delta - margeGauche), sup: xS + delta + margeDroite },
    };
  }

  const decalage = randomInt(1, delta - 1);
  const margeAutreCote = randomInt(MARGE_LARGE_MIN, MARGE_LARGE_MAX);
  if (Math.random() < 0.5) {
    // Clip à gauche : xS-delta rejetée (hors domaine), xS+delta reste valide.
    return {
      delta,
      domaine: { inf: Math.max(xMinPossible, xS - decalage), sup: xS + delta + margeAutreCote },
    };
  }
  // Clip à droite : xS+delta rejetée (hors domaine), xS-delta reste valide.
  return {
    delta,
    domaine: { inf: Math.max(xMinPossible, xS - delta - margeAutreCote), sup: xS + decalage },
  };
}

/** Les racines réellement dans `[domaine.inf,domaine.sup]`, triées croissant (0 exclu par
 * construction — voir en-tête de fichier, toujours ≥1). */
export function racinesDansDomaine(xS: number, delta: number, domaine: { inf: number; sup: number }): number[] {
  return [xS - delta, xS + delta].filter((r) => r >= domaine.inf && r <= domaine.sup).sort((a, b) => a - b);
}

/** Intersection de l'intervalle brut `[xS-delta,xS+delta]` avec le domaine — toujours non vide par
 * construction (voir en-tête de fichier). */
export function intervalleIntersecte(xS: number, delta: number, domaine: { inf: number; sup: number }): { inf: number; sup: number } {
  return {
    inf: Math.max(xS - delta, domaine.inf),
    sup: Math.min(xS + delta, domaine.sup),
  };
}
