import type { FactorisationP3 } from "../../core/caracteristiquesAlgebriques.types";

/**
 * Formes retenues pour `P3` (`racine_cubique`/`cube`, niveau 2) — la forme 1 (`A³x³±B³`) est
 * exclue : elle force algébriquement le côté "linéaire dérivé" à dégénérer en constante (voir
 * CLAUDE.md, section niveau 2 — le détail complet de cette exclusion).
 */
export type FormeP3 = "forme2" | "forme3" | "forme4";
export const FORMES_P3: FormeP3[] = ["forme2", "forme3", "forme4"];

export interface ResultatP3 {
  /** Coefficient directeur du côté linéaire (dérivé, sauf forme 2 où c'est `uLibre` tel quel). */
  u: number;
  /** Terme constant du côté linéaire — toujours dérivé, aux 3 formes. */
  v: number;
  factorisation: FactorisationP3;
}

/**
 * Développe `P3 = (px+q)³ + (ux+v)` et calcule `(u,v)` + la factorisation connue de `P3`, pour
 * l'une des 3 formes retenues. `(p,q)` est le côté ÉLEVÉ AU CUBE — `k` pour `racine_cubique`, `P1`
 * pour `cube` (le calcul est purement algébrique, générique aux deux familles : seul le rôle
 * physique de `(p,q)`/`(u,v)` diffère selon l'appelant, voir `construireNiveau2RacineCubique.ts`/
 * `construireNiveau2Cube.ts`). `uLibre` n'intervient QUE pour la forme 2 (seul degré de liberté
 * restant une fois `(p,q)` fixés) :
 * - forme 2 (`Ax³+Bx²+Cx`, mise en évidence simple) : `v=-q³` (`u` libre).
 * - forme 3 (`Ax³+Bx²`, mise en évidence simple) : `v=-q³`, `u=-3pq²`.
 * - forme 4 (`Ax³+Bx²+Ax+B = (x²+1)(Ax+B)`) : `u=p³-3pq²`, `v=3p²q-q³`.
 * Dans les 3 cas, `P3 = p³x³ + 3p²qx² + (3pq²+u)x + (q³+v)` — la CONSTANTE s'annule toujours
 * (formes 2/3/4 : `v` est toujours choisi pour ça), donnant `x` comme facteur commun SAUF pour la
 * forme 4, où le développement retombe au contraire sur `(x²+1)(p³x+3p²q)` (voir la vérification
 * complète, CLAUDE.md).
 */
export function construireP3(forme: FormeP3, p: number, q: number, uLibre: number): ResultatP3 {
  if (forme === "forme4") {
    const u = p * p * p - 3 * p * q * q;
    const v = 3 * p * p * q - q * q * q;
    return { u, v, factorisation: { type: "sansX", lineaire: { A: p * p * p, B: 3 * p * p * q } } };
  }

  const u = forme === "forme2" ? uLibre : -3 * p * q * q;
  const v = -(q * q * q);
  return { u, v, factorisation: { type: "avecX", quadratique: { A: p * p * p, B: 3 * p * p * q, C: 3 * p * q * q + u } } };
}
