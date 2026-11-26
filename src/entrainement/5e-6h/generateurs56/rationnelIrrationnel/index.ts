import { parmi } from "../communReels/outilsReels";
import { tirerNombre } from "./core/nombres";
import { ENSEMBLES, FAMILLES } from "./core/types";
import type { ExerciceRationnel, FamilleNombre, NombreClasse, VarianteRationnel } from "./core/types";

/**
 * Couche A — générateur de `56gen14` « Rationnel ou irrationnel ? ». `Math.random()` seul (le `?code=`
 * rejoue le tirage). Pour CHAQUE nombre, l'ensemble (verdict) est tiré à parts égales parmi ℕ, ℤ, ℚ,
 * ℝ∖ℚ AVANT le nombre, indépendamment des autres nombres (aucune déduction par élimination) ; puis un
 * gabarit de cet ensemble dans la famille de la variante (« mélange » : famille tirée pour chaque
 * nombre). Quatre gabarits différents par exercice ; au moins une écriture « déguisée » (rationnel
 * écrit avec une racine, une fraction, une période, un cosinus…), sinon l'exercice est retiré (cas
 * « quatre irrationnels », 1 / 256 des tirages).
 */

export type IdVarianteRationnel = VarianteRationnel;

export const CATALOGUE_VARIANTES: { id: IdVarianteRationnel; label: string }[] = [
  { id: "racines", label: "Racines carrées et cubiques" },
  { id: "ecritures", label: "Fractions, puissances et écritures décimales" },
  { id: "expressions", label: "Expressions avec des racines" },
  { id: "constantes", label: "Trigonométrie, π et Φ" },
  { id: "melange", label: "Mélange des quatre familles" },
];

function construire(variante: VarianteRationnel): ExerciceRationnel {
  for (;;) {
    const nombres: NombreClasse[] = [];
    const vus = new Set<string>();
    let essais = 0;
    while (nombres.length < 4 && essais < 200) {
      essais++;
      const ensemble = parmi(ENSEMBLES);
      for (let k = 0; k < 40; k++) {
        const famille: FamilleNombre = variante === "melange" ? parmi(FAMILLES) : variante;
        const n = tirerNombre(famille, ensemble);
        if (vus.has(n.gabarit) || vus.has(n.latex)) continue;
        vus.add(n.gabarit);
        vus.add(n.latex);
        nombres.push(n);
        break;
      }
    }
    if (nombres.length === 4 && nombres.some((n) => n.deguise)) return { variante, nombres };
  }
}

export function construireAvecVarianteId(id: IdVarianteRationnel): ExerciceRationnel {
  return construire(id);
}

/** Tirage libre : le mélange des quatre familles. */
export function genererExerciceRationnel(): ExerciceRationnel {
  return construire("melange");
}
