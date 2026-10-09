/**
 * Couche A (6e) — mécanisme de "table statistique" pour `6gen51` ("Loi normale"), réutilisable par
 * les 5 familles de ce générateur ET par tout générateur ultérieur du même chapitre (6gen52
 * réutilise explicitement `Phi`/`PhiInverse` via la famille D — voir en-tête `familleD.ts`).
 *
 * ============================================================================
 * **DÉCISION DE CONCEPTION — pourquoi une approximation numérique plutôt qu'une VRAIE table
 * figée avec interpolation, lire avant de modifier ce fichier**
 * ============================================================================
 * Ce générateur est le PREMIER de toute la plateforme à vérifier une réponse élève par tolérance
 * décimale contre une valeur CALCULÉE (jamais une valeur exacte/symbolique comme partout
 * ailleurs). Deux options possibles pour la "vérité de référence" côté plateforme :
 *   (a) une vraie table statistique discrète (ex. 1 ligne par 0,01 de z) + interpolation linéaire
 *       entre les entrées les plus proches — fidèle à ce qu'un élève manipule sur papier, mais
 *       introduit une erreur d'interpolation qui n'apporte RIEN pédagogiquement (l'élève ne voit
 *       jamais cette table, seulement l'énoncé "lis dans la table" et le résultat de sa propre
 *       saisie comparé à une tolérance) — cette imprécision parasite pourrait à la marge rejeter à
 *       tort une réponse élève pourtant correcte à la précision annoncée ;
 *   (b) une fonction mathématique fermée, numériquement précise, qui EST la loi normale centrée
 *       réduite exacte (`Phi`) — aucune erreur d'interpolation, précision très supérieure à celle
 *       qu'annonce le générateur (4 décimales pour une probabilité, 2 pour un z), donc jamais la
 *       source d'un faux rejet.
 * Choix retenu : (b). `Phi`/`PhiInverse` sont la vérité de référence INTERNE de la plateforme —
 * l'élève ne les voit jamais, seulement le vocabulaire pédagogique "lis dans la table"/"table
 * inversée" dans les consignes (`ui6e/formatLoiNormale.ts`). Aucune régression pédagogique : la
 * TOLÉRANCE de vérification (voir `moteur6e/verificationLoiNormale.ts`) reste calée sur la
 * précision d'une vraie table papier (4 décimales probabilité, 2 décimales z) — c'est cette
 * tolérance, pas la précision interne de `Phi`, qui détermine ce qui est accepté.
 *
 * ============================================================================
 * **`Phi(z)` — CDF de la loi normale centrée réduite, approximation d'Abramowitz & Stegun 7.1.26**
 * ============================================================================
 * `Phi(z) = 0.5*(1+erf(z/√2))`, `erf` approximée par la formule rationnelle A&S 7.1.26 (5
 * coefficients, erreur maximale annoncée par la littérature : `|ε(x)| ≤ 1.5×10⁻⁷` pour tout
 * `x≥0`) — précision largement supérieure aux 4 décimales annoncées à l'élève. Vérifiée par test
 * (`tableNormale.test.ts`) contre les valeurs de référence usuelles (`Phi(1)≈0,8413447`,
 * `Phi(1.96)≈0,9750021`...) ET la symétrie exacte `Phi(-z)=1-Phi(z)`.
 *
 * ============================================================================
 * **`PhiInverse(p)` — inverse numérique, recherche par BISSECTION contre `Phi` lui-même**
 * ============================================================================
 * Jamais une seconde approximation indépendante (type Acklam) : une bissection contre `Phi`
 * garantit par construction que `Phi(PhiInverse(p))=p` (aucun risque de désaccord entre 2
 * fonctions écrites séparément), au prix d'un coût négligeable (100 itérations, `O(1)` en
 * pratique, jamais appelé dans une boucle chaude). Intervalle de recherche `[-10;10]` — largement
 * hors de portée de toute probabilité pertinente pour ce générateur (`Phi(10)` indiscernable de 1
 * en double précision). Précision atteinte après 100 itérations : `20/2^100`, très largement
 * au-delà de toute tolérance utile — cross-validée par test (`Phi(PhiInverse(p))≈p` à 1e-7 près,
 * pour de nombreux `p` couvrant la plage usuelle d'une table `[0,0001;0,9999]`).
 */

const A1 = 0.254829592;
const A2 = -0.284496736;
const A3 = 1.421413741;
const A4 = -1.453152027;
const A5 = 1.061405429;
const P_COEF = 0.3275911;

/** Approximation d'Abramowitz & Stegun 7.1.26 de la fonction erreur, `|erreur|≤1.5e-7`. */
function erf(x: number): number {
  const signe = x < 0 ? -1 : 1;
  const ax = Math.abs(x);
  const t = 1 / (1 + P_COEF * ax);
  const poly = ((((A5 * t + A4) * t + A3) * t + A2) * t + A1) * t;
  const y = 1 - poly * Math.exp(-ax * ax);
  return signe * y;
}

/** CDF de la loi normale centrée réduite N(0,1) — voir en-tête de fichier. */
export function Phi(z: number): number {
  return 0.5 * (1 + erf(z / Math.SQRT2));
}

/** Inverse numérique de `Phi` par bissection — voir en-tête de fichier. `p` hors de `]0;1[` : `Phi`
 * n'atteint jamais exactement 0 ou 1 en double précision, retourne `±Infinity` par convention. */
export function PhiInverse(p: number): number {
  if (p <= 0) return -Infinity;
  if (p >= 1) return Infinity;
  let lo = -10;
  let hi = 10;
  for (let i = 0; i < 100; i++) {
    const mid = (lo + hi) / 2;
    if (Phi(mid) < p) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}
