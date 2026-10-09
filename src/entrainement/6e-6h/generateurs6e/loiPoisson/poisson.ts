/**
 * Couche A (6e) — brique de calcul PURE pour la loi de Poisson, `6gen53`. PREMIÈRE apparition de
 * cette loi sur la plateforme : P(X=k) = e^(−λ)·λᵏ/k!, aucune formule préexistante à réutiliser
 * (contrairement aux STRATÉGIES de calcul terme unique/somme/complément, reprises de `6gen48`/
 * `6gen50` — voir `familleA.ts`/`familleB.ts` de ce dossier).
 *
 * **Stabilité numérique (λ jusqu'à 75, exemple donné par la spec elle-même : "5 voitures/minute"
 * sur 15 minutes)** : un calcul NAÏF `Math.exp(-lambda) * lambda**k / factorielle(k)` calcule λᵏ et
 * k! séparément — tous deux débordent en `Infinity` (double IEEE-754) bien avant que leur RAPPORT
 * (la vraie quantité recherchée, toujours dans [0,1]) ne devienne problématique : `k!` déborde dès
 * k≈171, `λᵏ` déborde encore plus vite pour λ modéré et k grand (ex. λ=75, k=400 → 75^400≈10^750,
 * hors de portée d'un `number`). `Infinity/Infinity = NaN` — silencieux, aucune exception. Voir
 * `poisson.test.ts` pour la démonstration isolée de cette divergence.
 *
 * Méthode retenue — ITÉRATIVE, ne calcule JAMAIS λᵏ ni k! isolément : en partant de `terme_0 =
 * e^{-λ}`, chaque terme suivant se déduit du précédent par `terme_i = terme_i-1 * (λ/i)` — chaque
 * facteur multiplicatif reste borné (proche de 1 autour de i≈λ, puis <1 au-delà), donc le produit
 * ne diverge jamais quel que soit k. C'est la méthode numériquement stable STANDARD pour la loi de
 * Poisson (évite tout calcul intermédiaire hors de la plage représentable).
 */

/** P(X=k) pour une loi de Poisson de paramètre λ — calcul itératif stable, voir en-tête de fichier.
 * `k` doit être un entier ≥0. */
export function probabilitePoisson(lambda: number, k: number): number {
  let terme = Math.exp(-lambda);
  for (let i = 1; i <= k; i++) {
    terme *= lambda / i;
  }
  return terme;
}

/** Σ P(X=i) pour i de `a` à `b` inclus (`a`≤`b`, entiers ≥0) — réutilise le terme précédent plutôt
 * que de rappeler `probabilitePoisson` depuis 0 à chaque `i` (calcul en O(b) au lieu de O(b²), sans
 * incidence sur la stabilité déjà assurée terme par terme). */
export function sommePoisson(lambda: number, a: number, b: number): number {
  let terme = Math.exp(-lambda);
  for (let i = 1; i <= a; i++) terme *= lambda / i;
  let total = 0;
  for (let i = a; i <= b; i++) {
    if (i > a) terme *= lambda / i;
    total += terme;
  }
  return total;
}
