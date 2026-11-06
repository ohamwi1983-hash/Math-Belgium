import type { ExerciceVitesse } from "../../core5e/suitesClassiques.types";
import { sommeArithmetique, termeArithmetique } from "../suitesArithmetiques/parametres";
import { entierAleatoire } from "./aleatoire";

const KMH_PAR_MS = 3.6;

/** Scénario 4 — « À toute allure » : un mobile démarre et parcourt u₁ mètres pendant la 1re
 * seconde, puis r mètres de plus à chaque seconde (suite arithmétique). Varient u₁ (0,6 à 2 m, au
 * dixième pair), r (0,5 à 2,5 m, au demi-mètre) et la durée n (8 à 15 s), avec une vitesse finale
 * réaliste (uₙ ≤ 35 m/s, soit 126 km/h).
 *
 * Questions : uₙ, Sₙ, puis deux vitesses MOYENNES (calculables avec le chapitre) — sur les n
 * secondes (Sₙ/n) et pendant la dernière seconde (uₙ) — converties en km/h (× 3,6). La vitesse
 * instantanée par dérivée a été retirée (audit 5e ch. 3, décision D). */
export function construireVitesse(): ExerciceVitesse {
  for (;;) {
    const u1 = entierAleatoire(3, 10) / 5; // 0,6 ; 0,8 ; … ; 2
    const r = entierAleatoire(1, 5) / 2; // 0,5 ; 1 ; … ; 2,5
    const n = entierAleatoire(8, 15);
    const distanceN = arrondi(termeArithmetique(u1, r, n));
    if (distanceN > 35) continue;
    const sommeTotaleN = arrondi(sommeArithmetique(u1, r, n));
    return {
      scenario: "vitesse",
      u1,
      r,
      n,
      distanceN,
      sommeTotaleN,
      vitesseMoyenneTotaleKmH: (sommeTotaleN / n) * KMH_PAR_MS,
      vitesseDerniereSecondeKmH: distanceN * KMH_PAR_MS,
    };
  }
}

/** Supprime le résidu flottant (ex. 0,6 + 7 × 1,5 = 11,100000000000001). */
function arrondi(valeur: number): number {
  return Math.round(valeur * 1e6) / 1e6;
}
