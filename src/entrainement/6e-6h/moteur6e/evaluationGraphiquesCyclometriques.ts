import type { ExerciceGraphiquesCyclometriques } from "../core6e/graphiquesCyclometriques.types";

/**
 * Couche B (6e) — évalue la VRAIE fonction f (candidat `.reel` uniquement, jamais les
 * distracteurs) pour un `x` donné. RÉIMPLÉMENTÉ ici plutôt qu'importé de `ui6e/
 * formatGraphiquesCyclometriques.ts::evaluerA..F` (mêmes formules, mais `moteur6e/` n'importe
 * jamais `ui6e/` — couche présentation, au-dessus — ni `generateurs6e/`, voir CLAUDE.md) : sert à
 * vérifier PAR COHÉRENCE INTERNE la position x d'un extremum saisie librement par l'élève (ré-
 * évalue f en ce point plutôt que de comparer à une position figée — un extremum peut être atteint
 * en plusieurs points, ex. familles C/F paires).
 */
/** Un argument d'arcsin / arccos à 1e-9 près d'une borne de [−1 ; 1] (borne EXACTE saisie, « √(3)/2 »
 * relue à 1,0000000000000002 près) est ramené sur la borne : sinon un extremum juste était jugé faux. */
export function evaluerReel(exercice: ExerciceGraphiquesCyclometriques, x: number): number | null {
  switch (exercice.famille) {
    case "A": {
      const r = exercice.reel;
      let u = r.m * x + r.n;
      if (Math.abs(u) > 1 + 1e-9) return null;
      u = Math.max(-1, Math.min(1, u));
      const w = r.arcfonction === "arcsin" ? Math.asin(u) : Math.acos(u);
      return r.c + r.k * w;
    }
    case "B": {
      const r = exercice.reel;
      return r.c + r.k * Math.atan(r.m * x + r.n);
    }
    case "C": {
      const r = exercice.reel;
      let u = r.a * x * x + r.b;
      if (r.arcfonction === "arctan") return Math.atan(u);
      if (Math.abs(u) > 1 + 1e-9) return null;
      u = Math.max(-1, Math.min(1, u));
      return r.arcfonction === "arcsin" ? Math.asin(u) : Math.acos(u);
    }
    case "D": {
      const r = exercice.reel;
      if (Math.abs(x - r.p) < 1e-9) return null;
      return r.c + Math.atan(r.k / (x - r.p));
    }
    case "E": {
      const r = exercice.reel;
      if (Math.abs(x) > 1 + 1e-9) return null;
      const xb = Math.max(-1, Math.min(1, x));
      const w = r.arcfonction === "arcsin" ? Math.asin(xb) : Math.acos(xb);
      const radicande = r.k * w + r.c;
      // Tolérance d'arrondi : au zéro EXACT du radicande (x = √2/2 saisi), le calcul flottant donne
      // parfois −4·10⁻¹⁶ (constante c exacte, multiple de π).
      if (radicande < -1e-9) return null;
      return Math.sqrt(Math.max(0, radicande));
    }
    case "F": {
      const r = exercice.reel;
      let u = r.m * x + r.n;
      if (Math.abs(u) > 1 + 1e-9) return null;
      u = Math.max(-1, Math.min(1, u));
      const w = r.arcfonction === "arcsin" ? Math.asin(u) : Math.acos(u);
      return w * w + r.c;
    }
  }
}
