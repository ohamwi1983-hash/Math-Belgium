import type { ExerciceIntersectionsConiquesB } from "../../core6e/intersectionsConiques.types";
import { tirerEntier, tirerParmi, tirerSigne } from "./aleatoire";

/**
 * Couche A (6e) — famille B de `6gen61` : intersection de 2 coniques via combinaison linéaire
 * λC1+μC2, construite À L'ENVERS depuis un cercle CIBLE — technique "élégante" de la mission,
 * jamais résoudre le système {C1,C2} directement (polynôme de degré 4 générique).
 *
 * ## Dérivation complète
 *
 * `C1 : y = x²+b1·x+c1`, soit `x²+b1·x-y+c1 = 0` (coefficient de x² = 1, de y² = 0, jamais de xy).
 * `C2 : A2·x²+B2·y²+D2·x+E2·y+F2 = 0` (A2,B2 choisis entiers, A2≠B2 — jamais un cercle en propre,
 * jamais non plus une conique dégénérée à vérifier : elle n'a besoin d'être qu'une combinaison
 * algébrique valide, jamais interprétée géométriquement par l'énoncé).
 *
 * Condition pour que `λC1+μC2` soit un cercle (coefficients de x² et y² égaux, aucun terme croisé —
 * déjà garanti ici, aucune des 2 coniques n'en a) :
 *   coefficient de x² : `λ·1 + μ·A2`
 *   coefficient de y² : `λ·0 + μ·B2 = μ·B2`
 *   égalité ⇒ `λ = μ·(B2-A2)`.
 * On choisit `μ=1`, donc `λ=B2-A2` (entier, non nul car A2≠B2) — LA solution la plus simple, mais
 * n'importe quel multiple non nul `(k·λ,k·μ)` est tout aussi valide (voir
 * `moteur6e/verificationIntersectionsConiques.ts`, écran 1 : la vérification teste la RELATION, pas
 * l'égalité stricte à cette paire précise).
 *
 * Avec ce choix, le coefficient commun de x²/y² dans `λC1+μC2` vaut exactement `K=B2` (`λ+μA2 =
 * (B2-A2)+A2 = B2 = μB2` ✓). Le cercle CIBLE (centre `(h,k)`, rayon `r`, entiers simples) donne
 * l'équation `x²+y²-2h·x-2k·y+(h²+k²-r²)=0` ; en l'égalant à `λC1+μC2` divisée par `K` :
 *   coefficient de x (divisé par K) : `(λ·b1+D2)/K = -2h` ⇒ `D2 = -2·K·h - λ·b1`
 *   coefficient de y (divisé par K) : `(-λ+E2)/K = -2k` ⇒ `E2 = -2·K·k + λ`
 *   constante (divisée par K) : `(λ·c1+F2)/K = h²+k²-r²` ⇒ `F2 = K·(h²+k²-r²) - λ·c1`
 * `D2,E2,F2` ainsi calculés sont TOUJOURS entiers (K,h,k,r,λ,b1,c1 tous entiers) — la construction
 * "à l'envers" garantit un cercle cible EXACT, jamais un résultat à espérer.
 *
 * ## Exemple concret travaillé (voir aussi `familleB.test.ts`)
 *
 * Cercle cible : centre `(2,-1)`, rayon `3`. `A2=3,B2=5` (⇒ `K=5,λ=B2-A2=2,μ=1`). `C1` avec
 * `b1=1,c1=-2`. Alors `D2 = -2·5·2 - 2·1 = -22`, `E2 = -2·5·(-1) + 2 = 12`, `F2 = 5·(4+1-9) -
 * 2·(-2) = 5·(-4)+4 = -16`. Vérification : `λC1+μC2 = 2(x²+x-y-2) + (3x²+5y²-22x+12y-16) =
 * 2x²+2x-2y-4 + 3x²+5y²-22x+12y-16 = 5x²+5y²-20x+10y-20`, divisé par `5` :
 * `x²+y²-4x+2y-4=0`, complété : `(x-2)²+(y+1)²=4+1+4=9=3²` ✓ centre `(2,-1)`, rayon `3` — cohérent.
 */

export interface OverridesFamilleB {
  centre?: { x: number; y: number };
  rayon?: number;
}

const COEFFS_A2_B2: [number, number][] = [
  [1, 2],
  [1, 3],
  [2, 3],
  [1, 4],
  [3, 4],
  [2, 5],
];

export function construireFamilleB(overrides: OverridesFamilleB = {}): ExerciceIntersectionsConiquesB {
  const [A2brut, B2brut] = tirerParmi(COEFFS_A2_B2);
  // Ordre aléatoire (A2 < B2 ou A2 > B2), pour ne jamais figer le signe de λ.
  const [A2, B2] = tirerParmi([
    [A2brut, B2brut],
    [B2brut, A2brut],
  ] as [number, number][]);

  const b1 = tirerEntier(-4, 4) * tirerSigne();
  const c1 = tirerEntier(-4, 4) * tirerSigne();

  const centre = overrides.centre ?? { x: tirerEntier(1, 5) * tirerSigne(), y: tirerEntier(1, 5) * tirerSigne() };
  const rayon = overrides.rayon ?? tirerEntier(2, 6);

  const lambda = B2 - A2;
  const mu = 1;
  const K = B2;

  const D2 = -2 * K * centre.x - lambda * b1;
  const E2 = -2 * K * centre.y + lambda;
  const F2 = K * (centre.x * centre.x + centre.y * centre.y - rayon * rayon) - lambda * c1;

  // Équation brute (après substitution de λ,μ, AVANT division par K) : K·x²+K·y²+coeffX·x+coeffY·y+constanteBrute=0.
  const coeffX = lambda * b1 + D2;
  const coeffY = -lambda + E2;
  const constanteBrute = lambda * c1 + F2;

  return { famille: "B", b1, c1, A2, B2, D2, E2, F2, lambda, mu, K, coeffX, coeffY, constanteBrute, centre, rayon };
}
