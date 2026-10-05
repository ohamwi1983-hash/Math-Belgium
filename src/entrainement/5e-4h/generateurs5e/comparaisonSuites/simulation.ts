import type { ConditionComparaison } from "../../core5e/comparaisonSuites.types";

/** Balayage NUMÉRIQUE direct (jamais de résolution algébrique/log) — retourne le plus petit n≥1
 * satisfaisant la condition, ou `null` si aucun n≤nMax ne la satisfait. C'est le CŒUR de la
 * technique de 5gen18 : le seuil est toujours trouvé par simulation, jamais par formule fermée. */
export function trouverSeuil(uDeN: (n: number) => number, vDeN: (n: number) => number, condition: ConditionComparaison, nMax: number): number | null {
  for (let n = 1; n <= nMax; n++) {
    const satisfait = condition === "uGeV" ? uDeN(n) >= vDeN(n) : vDeN(n) >= uDeN(n);
    if (satisfait) return n;
  }
  return null;
}

/** Vérifie que la condition est FAUSSE à n-1 — nécessaire pour que le tableau à 3 lignes
 * [n-1,n,n+1] illustre correctement le "cran" de bascule (jamais un seuil déjà vrai à n-1, ce qui
 * romprait le piège "erreur d'un cran" central de ce générateur). */
export function basculeExactementA(uDeN: (n: number) => number, vDeN: (n: number) => number, condition: ConditionComparaison, n: number): boolean {
  if (n < 2) return false;
  const satisfaitAvant = condition === "uGeV" ? uDeN(n - 1) >= vDeN(n - 1) : vDeN(n - 1) >= uDeN(n - 1);
  const satisfaitApres = condition === "uGeV" ? uDeN(n) >= vDeN(n) : vDeN(n) >= uDeN(n);
  return !satisfaitAvant && satisfaitApres;
}
