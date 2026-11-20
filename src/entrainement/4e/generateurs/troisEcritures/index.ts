import type { CatalogueVarianteEntree } from "../../../export/genererFeuilleExercices";
import type { ExerciceTroisEcritures, VarianteTroisEcritures } from "../../core/troisEcritures.types";
import { choisir, entierAlea, type Poly2 } from "../../moteur/algebreTransfertSecondDegre";

/**
 * Générateur de gen126 « Trois écritures d'une parabole ». Tout le hasard passe par `Math.random` :
 * `genererAvecCode` (`export/codeExercice.ts`) le remplace par une graine et le QR code d'une
 * feuille rouvre le MÊME exercice.
 *
 * - `depuisCanonique` : le VERDICT « f a deux zéros / f n'en a aucun » est tiré AVANT les nombres
 *   (2/3 – 1/3) ; avec zéros, −y_S/a = d² (zéros entiers x_S ± d) ; sans zéro, y_S du signe de a.
 * - `depuisDeveloppee` : a ∈ {−3, −2, −1, 2, 3} (a ≠ 1 : il faut le mettre en évidence), x_S et y_S
 *   entiers non nuls.
 * - `depuisFactorisee` : zéros entiers de même parité (x_S entier), y_S = −a·d².
 * Bornes communes : |x_S| ≤ 5, |y_S| ≤ 27, |c| ≤ 60.
 */

export const CATALOGUE_VARIANTES: CatalogueVarianteEntree[] = [
  { id: "depuisCanonique", label: "Depuis la forme canonique (développée, zéros, factorisée)" },
  { id: "depuisDeveloppee", label: "Depuis la forme développée (a ≠ 1 : forme canonique, sommet)" },
  { id: "depuisFactorisee", label: "Depuis la forme factorisée (développée, sommet, canonique)" },
];

function nonNul(min: number, max: number): number {
  for (;;) {
    const v = entierAlea(min, max);
    if (v !== 0) return v;
  }
}

export function construireAvecVariante(id: string): ExerciceTroisEcritures {
  if (!CATALOGUE_VARIANTES.some((v) => v.id === id)) return genererExerciceTroisEcritures();
  const variante = id as VarianteTroisEcritures;
  const avecZeros = variante === "depuisCanonique" ? Math.random() < 2 / 3 : variante === "depuisFactorisee";
  for (;;) {
    const a = variante === "depuisDeveloppee" ? choisir([-3, -2, -1, 2, 3]) : choisir([-3, -2, -1, 1, 2, 3]);
    const h = nonNul(-5, 5);
    let k: number;
    let d: number | null = null;
    if (variante === "depuisDeveloppee") k = nonNul(-12, 12);
    else if (avecZeros) {
      d = entierAlea(1, variante === "depuisFactorisee" ? 5 : 4);
      k = -a * d * d;
    } else k = Math.sign(a) * entierAlea(1, 9);
    const c = a * h * h + k;
    if (Math.abs(k) > 27 || Math.abs(c) > 60) continue;
    if (d !== null && (Math.abs(h - d) > 8 || Math.abs(h + d) > 9)) continue;
    return { variante, a, h, k, d };
  }
}

export function genererExerciceTroisEcritures(): ExerciceTroisEcritures {
  return construireAvecVariante(choisir(CATALOGUE_VARIANTES).id);
}

/** Coefficients [a, b, c] de la forme développée. */
export function developpe(e: ExerciceTroisEcritures): Poly2 {
  return [e.a, -2 * e.a * e.h, e.a * e.h * e.h + e.k];
}

/** Zéros triés (deux entiers), ou `[]`. */
export function zeros(e: ExerciceTroisEcritures): number[] {
  return e.d === null ? [] : [e.h - e.d, e.h + e.d];
}

/** Valeur de f en x (forme canonique). */
export function f(e: ExerciceTroisEcritures, x: number): number {
  return e.a * (x - e.h) * (x - e.h) + e.k;
}
