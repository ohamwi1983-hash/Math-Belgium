import type { ExerciceDenombB_Direct, ExerciceDenombB_Inverse, ExerciceDenombrementB } from "../../core6e/denombrementFondamental.types";
import { tirerParmi } from "./aleatoire";

/**
 * Couche A (6e) — génération, famille B ("Diagonales d'un polygone") de `6gen43`. `D(n)=n(n-3)/2`,
 * nombre de diagonales d'un polygone convexe à `n` côtés.
 *
 * Sous-type "inverse" : `n(n-3)/2=D` se développe en `n²-3n-2D=0` (équation du second degré en
 * `n`) — écran 1 demande la CONSTANTE du gabarit affiché `n² − 3n − ⬚ = 0`, soit `2D` (jamais
 * l'équation entière en texte libre — un gabarit KaTeX déjà posé + 1 champ numérique reste dans le
 * même esprit que "poser l'équation" tout en restant vérifiable par égalité exacte, cohérent avec
 * `moteur6e/verificationDenombrementFondamental.ts`, "toutes les valeurs numériques : égalité
 * exacte"). Écran 2 résout `n²-3n-2D=0` pour `n>0` entier via la formule quadratique :
 * `n=(3+√(9+8D))/2` (racine positive uniquement, l'autre étant toujours négative pour `D>0`).
 */

const VALEURS_N_DIRECT = Array.from({ length: 12 - 5 + 1 }, (_, i) => i + 5); // 5..12
const VALEURS_N_INVERSE = Array.from({ length: 15 - 5 + 1 }, (_, i) => i + 5); // 5..15

export function calculerDiagonales(n: number): number {
  return (n * (n - 3)) / 2;
}

export function construireDirect(n: number = tirerParmi(VALEURS_N_DIRECT)): ExerciceDenombB_Direct {
  return { famille: "B", sousType: "direct", n, diagonales: calculerDiagonales(n) };
}

export function construireInverse(n: number = tirerParmi(VALEURS_N_INVERSE)): ExerciceDenombB_Inverse {
  const diagonales = calculerDiagonales(n);
  return { famille: "B", sousType: "inverse", diagonales, n, constanteEquation: 2 * diagonales };
}

export function construireFamilleB(): ExerciceDenombrementB {
  return tirerParmi([construireDirect, construireInverse] as const)();
}
