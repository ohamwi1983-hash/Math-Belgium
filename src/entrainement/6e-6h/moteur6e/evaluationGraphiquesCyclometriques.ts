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
export function evaluerReel(exercice: ExerciceGraphiquesCyclometriques, x: number): number | null {
  switch (exercice.famille) {
    case "A": {
      const r = exercice.reel;
      const u = r.m * x + r.n;
      if (u < -1 || u > 1) return null;
      const w = r.arcfonction === "arcsin" ? Math.asin(u) : Math.acos(u);
      return r.c + r.k * w;
    }
    case "B": {
      const r = exercice.reel;
      return r.c + r.k * Math.atan(r.m * x + r.n);
    }
    case "C": {
      const r = exercice.reel;
      const u = r.a * x * x + r.b;
      if (r.arcfonction === "arctan") return Math.atan(u);
      if (u < -1 || u > 1) return null;
      return r.arcfonction === "arcsin" ? Math.asin(u) : Math.acos(u);
    }
    case "D": {
      const r = exercice.reel;
      if (Math.abs(x - r.p) < 1e-9) return null;
      return r.c + Math.atan(r.k / (x - r.p));
    }
    case "E": {
      const r = exercice.reel;
      if (x < -1 || x > 1) return null;
      const w = r.arcfonction === "arcsin" ? Math.asin(x) : Math.acos(x);
      const radicande = r.k * w + r.c;
      if (radicande < 0) return null;
      return Math.sqrt(radicande);
    }
    case "F": {
      const r = exercice.reel;
      const u = r.m * x + r.n;
      if (u < -1 || u > 1) return null;
      const w = r.arcfonction === "arcsin" ? Math.asin(u) : Math.acos(u);
      return w * w + r.c;
    }
  }
}
