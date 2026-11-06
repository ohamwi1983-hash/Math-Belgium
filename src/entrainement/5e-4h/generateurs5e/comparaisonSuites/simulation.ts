import type { ConditionComparaison } from "../../core5e/comparaisonSuites.types";
import { entierAleatoire } from "./utils";

/** Nombre de lignes du tableau affiché à l'élève (fenêtre de rangs consécutifs). */
export const LIGNES_TABLEAU = 4;

/** Dépassement STRICT, comme le cours (« le premier rang où Bₙ > Aₙ »). */
export function conditionVraie(u: number, v: number, condition: ConditionComparaison): boolean {
  return condition === "aDepasseB" ? u > v : v > u;
}

/** Balayage NUMÉRIQUE direct (jamais de résolution algébrique/log) — retourne le plus petit n≥1
 * satisfaisant la condition, ou `null` si aucun n≤nMax ne la satisfait. C'est le CŒUR de la
 * technique de 5gen18 : le seuil est toujours trouvé par simulation, jamais par formule fermée. */
export function trouverSeuil(uDeN: (n: number) => number, vDeN: (n: number) => number, condition: ConditionComparaison, nMax: number): number | null {
  for (let n = 1; n <= nMax; n++) {
    if (conditionVraie(uDeN(n), vDeN(n), condition)) return n;
  }
  return null;
}

export interface FenetreTableau {
  nTable: number[];
  uTable: number[];
  vTable: number[];
}

/**
 * Fenêtre de `LIGNES_TABLEAU` rangs consécutifs contenant le rang de bascule `nSeuil` à une position
 * tirée au hasard — jamais la 1re ligne (la ligne précédente, où la condition est encore fausse,
 * doit rester visible : c'est la vérification « au rang n−1 ce n'était pas encore le cas » du cours).
 *
 * `null` (le constructeur retire alors une autre instance) si le tableau ARRONDI À L'UNITÉ — ce que
 * l'élève voit et écrit — ne montre pas exactement la même bascule que les valeurs exactes : égalité
 * des arrondis sur une ligne, ou verdict différent entre valeurs exactes et arrondies. Rejette aussi
 * les valeurs négatives et les fenêtres qui s'envolent (plus de `facteurMax` fois la plus grande
 * valeur de départ : contextes irréalistes — un lac qui monte de plusieurs dizaines de mètres).
 */
export function construireFenetre(
  uDeN: (n: number) => number,
  vDeN: (n: number) => number,
  condition: ConditionComparaison,
  nSeuil: number,
  valeurDepartMax: number,
  facteurMax = 4,
): FenetreTableau | null {
  const positionMax = Math.min(LIGNES_TABLEAU - 1, nSeuil - 1);
  if (positionMax < 1) return null;
  const position = entierAleatoire(1, positionMax);
  const n0 = nSeuil - position;
  const nTable = Array.from({ length: LIGNES_TABLEAU }, (_, i) => n0 + i);
  const uTable = nTable.map(uDeN);
  const vTable = nTable.map(vDeN);
  for (let i = 0; i < LIGNES_TABLEAU; i++) {
    const u = uTable[i];
    const v = vTable[i];
    if (u <= 0 || v <= 0) return null;
    if (u > facteurMax * valeurDepartMax || v > facteurMax * valeurDepartMax) return null;
    const ur = Math.round(u);
    const vr = Math.round(v);
    if (ur === vr) return null;
    const attendu = nTable[i] >= nSeuil;
    if (conditionVraie(u, v, condition) !== attendu) return null;
    if (conditionVraie(ur, vr, condition) !== attendu) return null;
  }
  return { nTable, uTable, vTable };
}
