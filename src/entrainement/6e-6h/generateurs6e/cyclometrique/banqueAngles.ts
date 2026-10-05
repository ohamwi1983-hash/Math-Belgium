import type { Arcfonction, EntreeBanqueArc, PointCercleTrig, ValeurExacte } from "../../core6e/cyclometrique.types";

/**
 * Couche A (6e) — banques de valeurs/angles remarquables, PARTAGÉES par 6gen2/6gen3 (et, pour
 * `BANQUE_16_POINTS`, potentiellement par un futur générateur ayant besoin du cercle trigo
 * complet). Données tirées EXACTEMENT des tables du prompt (6gen2, variante A) — jamais dérivées
 * d'un algorithme de réduction générique, pour éviter tout risque d'erreur de signe/quadrant sur
 * une donnée aussi structurante. Cross-vérifiées par test dédié contre `Math.sin`/`Math.cos`/
 * `Math.tan`/`Math.asin`/`Math.acos`/`Math.atan` natifs (tolérance flottante), jamais supposées
 * exactes sans preuve.
 */

function v(latex: string, numerique: number): ValeurExacte {
  return { latex, numerique };
}

// ============================================================================
// Banques par arcfonction (variante A de 6gen2, réutilisées telles quelles par 6gen3 famille 1).
// ============================================================================

const PI = Math.PI;

export const BANQUE_ARCSIN: EntreeBanqueArc[] = [
  { valeur: v("-1", -1), angle: v("-\\frac{\\pi}{2}", -PI / 2) },
  { valeur: v("-\\frac{\\sqrt{3}}{2}", -Math.sqrt(3) / 2), angle: v("-\\frac{\\pi}{3}", -PI / 3) },
  { valeur: v("-\\frac{\\sqrt{2}}{2}", -Math.SQRT2 / 2), angle: v("-\\frac{\\pi}{4}", -PI / 4) },
  { valeur: v("-\\frac{1}{2}", -0.5), angle: v("-\\frac{\\pi}{6}", -PI / 6) },
  { valeur: v("0", 0), angle: v("0", 0) },
  { valeur: v("\\frac{1}{2}", 0.5), angle: v("\\frac{\\pi}{6}", PI / 6) },
  { valeur: v("\\frac{\\sqrt{2}}{2}", Math.SQRT2 / 2), angle: v("\\frac{\\pi}{4}", PI / 4) },
  { valeur: v("\\frac{\\sqrt{3}}{2}", Math.sqrt(3) / 2), angle: v("\\frac{\\pi}{3}", PI / 3) },
  { valeur: v("1", 1), angle: v("\\frac{\\pi}{2}", PI / 2) },
];

export const BANQUE_ARCCOS: EntreeBanqueArc[] = [
  { valeur: v("-1", -1), angle: v("\\pi", PI) },
  { valeur: v("-\\frac{\\sqrt{3}}{2}", -Math.sqrt(3) / 2), angle: v("\\frac{5\\pi}{6}", (5 * PI) / 6) },
  { valeur: v("-\\frac{\\sqrt{2}}{2}", -Math.SQRT2 / 2), angle: v("\\frac{3\\pi}{4}", (3 * PI) / 4) },
  { valeur: v("-\\frac{1}{2}", -0.5), angle: v("\\frac{2\\pi}{3}", (2 * PI) / 3) },
  { valeur: v("0", 0), angle: v("\\frac{\\pi}{2}", PI / 2) },
  { valeur: v("\\frac{1}{2}", 0.5), angle: v("\\frac{\\pi}{3}", PI / 3) },
  { valeur: v("\\frac{\\sqrt{2}}{2}", Math.SQRT2 / 2), angle: v("\\frac{\\pi}{4}", PI / 4) },
  { valeur: v("\\frac{\\sqrt{3}}{2}", Math.sqrt(3) / 2), angle: v("\\frac{\\pi}{6}", PI / 6) },
  { valeur: v("1", 1), angle: v("0", 0) },
];

export const BANQUE_ARCTAN: EntreeBanqueArc[] = [
  { valeur: v("-\\sqrt{3}", -Math.sqrt(3)), angle: v("-\\frac{\\pi}{3}", -PI / 3) },
  { valeur: v("-1", -1), angle: v("-\\frac{\\pi}{4}", -PI / 4) },
  { valeur: v("-\\frac{\\sqrt{3}}{3}", -Math.sqrt(3) / 3), angle: v("-\\frac{\\pi}{6}", -PI / 6) },
  { valeur: v("0", 0), angle: v("0", 0) },
  { valeur: v("\\frac{\\sqrt{3}}{3}", Math.sqrt(3) / 3), angle: v("\\frac{\\pi}{6}", PI / 6) },
  { valeur: v("1", 1), angle: v("\\frac{\\pi}{4}", PI / 4) },
  { valeur: v("\\sqrt{3}", Math.sqrt(3)), angle: v("\\frac{\\pi}{3}", PI / 3) },
];

export const BANQUES_ARC: Record<Arcfonction, EntreeBanqueArc[]> = {
  arcsin: BANQUE_ARCSIN,
  arccos: BANQUE_ARCCOS,
  arctan: BANQUE_ARCTAN,
};

// ============================================================================
// Les 16 points standards du cercle trigonométrique complet (multiples de π/6 et π/4).
// ============================================================================

const UNDEF = null;

function point(angleLatex: string, angleNum: number, quadrant: 0 | 1 | 2 | 3 | 4, refLatex: string | null, refNum: number | null, sinL: string, sinN: number, cosL: string, cosN: number, tanL: string | null, tanN: number | null): PointCercleTrig {
  return {
    angle: v(angleLatex, angleNum),
    quadrant,
    angleReference: refLatex === null ? null : v(refLatex, refNum as number),
    sin: v(sinL, sinN),
    cos: v(cosL, cosN),
    tan: tanL === null ? UNDEF : v(tanL, tanN as number),
  };
}

const R2 = Math.SQRT2 / 2;
const R3 = Math.sqrt(3) / 2;
const T3 = Math.sqrt(3) / 3;

export const BANQUE_16_POINTS: PointCercleTrig[] = [
  point("0", 0, 0, null, null, "0", 0, "1", 1, "0", 0),
  point("\\frac{\\pi}{6}", PI / 6, 1, "\\frac{\\pi}{6}", PI / 6, "\\frac{1}{2}", 0.5, "\\frac{\\sqrt{3}}{2}", R3, "\\frac{\\sqrt{3}}{3}", T3),
  point("\\frac{\\pi}{4}", PI / 4, 1, "\\frac{\\pi}{4}", PI / 4, "\\frac{\\sqrt{2}}{2}", R2, "\\frac{\\sqrt{2}}{2}", R2, "1", 1),
  point("\\frac{\\pi}{3}", PI / 3, 1, "\\frac{\\pi}{3}", PI / 3, "\\frac{\\sqrt{3}}{2}", R3, "\\frac{1}{2}", 0.5, "\\sqrt{3}", Math.sqrt(3)),
  point("\\frac{\\pi}{2}", PI / 2, 0, null, null, "1", 1, "0", 0, null, null),
  point("\\frac{2\\pi}{3}", (2 * PI) / 3, 2, "\\frac{\\pi}{3}", PI / 3, "\\frac{\\sqrt{3}}{2}", R3, "-\\frac{1}{2}", -0.5, "-\\sqrt{3}", -Math.sqrt(3)),
  point("\\frac{3\\pi}{4}", (3 * PI) / 4, 2, "\\frac{\\pi}{4}", PI / 4, "\\frac{\\sqrt{2}}{2}", R2, "-\\frac{\\sqrt{2}}{2}", -R2, "-1", -1),
  point("\\frac{5\\pi}{6}", (5 * PI) / 6, 2, "\\frac{\\pi}{6}", PI / 6, "\\frac{1}{2}", 0.5, "-\\frac{\\sqrt{3}}{2}", -R3, "-\\frac{\\sqrt{3}}{3}", -T3),
  point("\\pi", PI, 0, null, null, "0", 0, "-1", -1, "0", 0),
  point("\\frac{7\\pi}{6}", (7 * PI) / 6, 3, "\\frac{\\pi}{6}", PI / 6, "-\\frac{1}{2}", -0.5, "-\\frac{\\sqrt{3}}{2}", -R3, "\\frac{\\sqrt{3}}{3}", T3),
  point("\\frac{5\\pi}{4}", (5 * PI) / 4, 3, "\\frac{\\pi}{4}", PI / 4, "-\\frac{\\sqrt{2}}{2}", -R2, "-\\frac{\\sqrt{2}}{2}", -R2, "1", 1),
  point("\\frac{4\\pi}{3}", (4 * PI) / 3, 3, "\\frac{\\pi}{3}", PI / 3, "-\\frac{\\sqrt{3}}{2}", -R3, "-\\frac{1}{2}", -0.5, "\\sqrt{3}", Math.sqrt(3)),
  point("\\frac{3\\pi}{2}", (3 * PI) / 2, 0, null, null, "-1", -1, "0", 0, null, null),
  point("\\frac{5\\pi}{3}", (5 * PI) / 3, 4, "\\frac{\\pi}{3}", PI / 3, "-\\frac{\\sqrt{3}}{2}", -R3, "\\frac{1}{2}", 0.5, "-\\sqrt{3}", -Math.sqrt(3)),
  point("\\frac{7\\pi}{4}", (7 * PI) / 4, 4, "\\frac{\\pi}{4}", PI / 4, "-\\frac{\\sqrt{2}}{2}", -R2, "\\frac{\\sqrt{2}}{2}", R2, "-1", -1),
  point("\\frac{11\\pi}{6}", (11 * PI) / 6, 4, "\\frac{\\pi}{6}", PI / 6, "-\\frac{1}{2}", -0.5, "\\frac{\\sqrt{3}}{2}", R3, "-\\frac{\\sqrt{3}}{3}", -T3),
];
