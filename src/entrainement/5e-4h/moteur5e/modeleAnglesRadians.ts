import { add, cosExact, mul, piLatex, rat, sinExact, tanExact, val, type Rat, type ValeurExacte } from "./trigExact";

/**
 * Modèle de 5gen51 « Angles en radians sur le cercle » (5e, chapitre 2, § 4, processus 1 CONNAÎTRE).
 * Un angle θ = kπ/n hors de [0 ; 2π[ ; l'élève le ramène dans [0 ; 2π[, nomme le quadrant, lit cos θ et
 * sin θ sur le cercle quadrillé aux valeurs remarquables, puis calcule tan θ.
 *
 * VARIANTE = sens de la réduction (retirer des tours : θ > 2π ; ajouter des tours : θ < 0). L'angle
 * réduit est tiré parmi les 16 angles remarquables de [0 ; 2π[ (axes compris) : le quadrant et
 * « tan θ n'existe pas » sont des VERDICTS tirés dans la variante, jamais dans son nom.
 */

export type VarianteAnglesRadians = "grand" | "negatif";

export interface ExerciceAnglesRadians {
  variante: VarianteAnglesRadians;
  /** Angle réduit (coefficient de π) dans [0 ; 2[. */
  reduit: Rat;
  /** θ = réduit + 2·tours (tours ≥ 1 pour « grand », ≤ −1 pour « négatif »). */
  tours: number;
}

export type Quadrant = "I" | "II" | "III" | "IV" | "axe";

/** Les 16 angles remarquables de [0 ; 2π[ (coefficients de π). */
export const ANGLES_REMARQUABLES: Rat[] = Array.from({ length: 24 }, (_, k) => rat(k, 12)).filter((c) => c.d !== 12);

export function angle(e: ExerciceAnglesRadians): Rat {
  return add(e.reduit, mul(rat(2), rat(e.tours)));
}

export function angleLatex(e: ExerciceAnglesRadians): string {
  return piLatex(angle(e));
}

export function quadrant(e: { reduit: Rat }): Quadrant {
  const v = val(e.reduit);
  if (v === 0 || v === 0.5 || v === 1 || v === 1.5) return "axe";
  if (v < 0.5) return "I";
  if (v < 1) return "II";
  if (v < 1.5) return "III";
  return "IV";
}

export function cosinus(e: ExerciceAnglesRadians): ValeurExacte {
  return cosExact(e.reduit);
}

export function sinus(e: ExerciceAnglesRadians): ValeurExacte {
  return sinExact(e.reduit);
}

/** `null` : tan θ n'existe pas. */
export function tangente(e: ExerciceAnglesRadians): ValeurExacte | null {
  return tanExact(e.reduit);
}

/** Angle de référence α (dans [0 ; π/2]) : distance du point M à l'axe horizontal, en angle. */
export function angleReference(e: ExerciceAnglesRadians): Rat {
  const v = val(e.reduit);
  if (v <= 0.5) return e.reduit;
  if (v <= 1) return add(rat(1), mul(rat(-1), e.reduit));
  if (v <= 1.5) return add(e.reduit, rat(-1));
  return add(rat(2), mul(rat(-1), e.reduit));
}
