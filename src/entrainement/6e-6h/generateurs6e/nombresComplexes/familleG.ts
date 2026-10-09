import type { ExerciceFamilleG, ValeurComplexe } from "../../core6e/nombresComplexes.types";
import { tirerParmi } from "../calculPrimitives/aleatoire";

/**
 * Couche A (6e) — génération, famille G ("Puissances de i") de `6gen34`. Exporte `puissanceDeI` et
 * `CYCLE_I`, LA brique réutilisable de cette famille — `6gen38` ("Formule de Moivre : développer
 * cos(nx) et sin(nx)") réutilise EXPLICITEMENT `puissanceDeI` (spec de la mission) : importer
 * `puissanceDeI` depuis CE fichier (`generateurs6e/nombresComplexes/familleG.ts`), jamais
 * réimplémenté ailleurs.
 *
 * ============================================================================
 * **Preuve — le même "reste" (modulo 4 MATHÉMATIQUE, toujours dans {0,1,2,3}) s'applique aux
 * exposants négatifs SANS AUCUN traitement séparé**
 * ============================================================================
 * i a pour période 4 dans les DEUX sens (i^4=1 ⟹ i^n=i^(n+4k) pour tout entier k, positif ou
 * négatif) : `i^n = i^(n mod 4)` reste vrai pour n négatif SI `mod` désigne le modulo mathématique
 * (résultat toujours dans [0;3]) — PAS l'opérateur `%` de JavaScript, qui renvoie un résultat de
 * même signe que le dividende (`-3 % 4 === -3` en JS, jamais `1`). Vérification directe : i^(-1) =
 * 1/i = -i = i³ (bien `-1 mod 4 = 3` au sens mathématique) ; i^(-2) = 1/i² = 1/(-1) = -1 = i² (`-2
 * mod 4 = 2`) ; i^(-3) = 1/i³ = 1/(-i) = i = i¹ (`-3 mod 4 = 1`) ; i^(-4) = 1 = i⁰ (`-4 mod 4 = 0`).
 * `modulo4Mathematique` ci-dessous implémente ce modulo TOUJOURS positif — utilisé identiquement
 * pour n positif ET négatif, jamais un branchement séparé "cas négatif".
 */

export const CYCLE_I: ValeurComplexe[] = [
  { re: 1, im: 0 },
  { re: 0, im: 1 },
  { re: -1, im: 0 },
  { re: 0, im: -1 },
];

/** Modulo mathématique — TOUJOURS dans [0;3], contrairement à `%` (JS) pour un `n` négatif. */
export function modulo4Mathematique(n: number): number {
  return ((n % 4) + 4) % 4;
}

/** i^n pour tout entier n (positif, négatif ou nul) — voir en-tête de fichier pour la preuve. LA
 * brique réutilisée par `6gen38`. */
export function puissanceDeI(n: number): ValeurComplexe {
  return CYCLE_I[modulo4Mathematique(n)];
}

const BANQUE_EXPOSANTS_POSITIFS = [2021, 1000, 777, 2024, 999, 501, 1234] as const;
const BANQUE_EXPOSANTS_NEGATIFS = [-3, -5, -7, -9, -11, -13] as const;

export function construireFamilleG(): ExerciceFamilleG {
  const n = Math.random() < 0.5 ? tirerParmi(BANQUE_EXPOSANTS_POSITIFS) : tirerParmi(BANQUE_EXPOSANTS_NEGATIFS);
  const reste = modulo4Mathematique(n);
  const resultat = CYCLE_I[reste];
  return { famille: "G", n, reste, resultat };
}
