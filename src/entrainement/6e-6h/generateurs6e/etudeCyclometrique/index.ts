import type { ExerciceEtudeCyclo, VarianteEtudeCyclo } from "../../core6e/etudeCyclometrique";
import { TABLE_ARCTAN_DROITE, TABLE_ARC_RACINE } from "../../core6e/etudeCyclometrique";

/**
 * Couche A — générateur de `6gen157` « Étude d'une fonction cyclométrique ». `Math.random()` seul
 * (`?code=`). Tous les extremums, bornes et limites sont des valeurs remarquables exactes ; l'ordre
 * des quatre descriptions de variations (choix fermé) est tiré avec l'instance.
 * - `arctan-droite` : k ∈ {2, 4, 4/3} ; `x-arctan` : k ∈ {1, 2, 3} ;
 * - `arc-racine` : arcsin ou arccos, k ∈ {2, √2, −2, −√2} (maximum ou minimum intérieur, 50/50) ;
 * - `arctan-inverse` : k ∈ {1, 2, 3, −1, −2} (décroissante / croissante sur chaque intervalle).
 */

function parmi<T>(t: readonly T[]): T {
  return t[Math.floor(Math.random() * t.length)];
}

function permutation(n: number): number[] {
  const p = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [p[i], p[j]] = [p[j], p[i]];
  }
  return p;
}

export function construire(variante: VarianteEtudeCyclo): ExerciceEtudeCyclo {
  switch (variante) {
    case "arctan-droite": {
      const d = parmi(TABLE_ARCTAN_DROITE);
      return { variante, d, ordre: permutation(4), cleCollecteur: `${variante}/k${d.kn}-${d.kd}` };
    }
    case "x-arctan": {
      const k = parmi([1, 2, 3] as const);
      return { variante, k, ordre: permutation(4), cleCollecteur: `${variante}/k${k}` };
    }
    case "arc-racine": {
      const d = parmi(TABLE_ARC_RACINE);
      return { variante, d, ordre: permutation(4), cleCollecteur: `${variante}/${d.arc}/${d.signe > 0 ? "max" : "min"}` };
    }
    case "arctan-inverse": {
      const k = parmi([1, 2, 3, -1, -2]);
      return { variante, k, ordre: permutation(4), cleCollecteur: `${variante}/${k > 0 ? "decroissante" : "croissante"}` };
    }
  }
}

export const CATALOGUE_VARIANTES: { id: VarianteEtudeCyclo; label: string }[] = [
  { id: "arctan-droite", label: "k·arctan x − x (deux extremums locaux)" },
  { id: "x-arctan", label: "x·arctan(x/k) (fonction paire)" },
  { id: "arc-racine", label: "arcsin x ou arccos x + k√(1 − x²) (domaine fermé)" },
  { id: "arctan-inverse", label: "arctan(k/x) (domaine en deux intervalles)" },
];

export function construireAvecVarianteId(id: VarianteEtudeCyclo): ExerciceEtudeCyclo {
  return construire(id);
}

export function genererExerciceEtudeCyclo(): ExerciceEtudeCyclo {
  return construire(parmi(CATALOGUE_VARIANTES).id);
}
