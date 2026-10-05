import type { AngleRemarquable } from "../../core/valeursRemarquables.types";

/** Magnitudes exactes (non signées) — table mathématique connue, jamais calculée via Math.sin/cos
 * (qui introduirait du bruit flottant sur ces valeurs remarquables). */
export const MAGNITUDE_SIN: Record<AngleRemarquable, number> = {
  0: 0,
  30: 0.5,
  45: Math.SQRT2 / 2,
  60: Math.sqrt(3) / 2,
  90: 1,
};

export const MAGNITUDE_COS: Record<AngleRemarquable, number> = {
  0: 1,
  30: Math.sqrt(3) / 2,
  45: Math.SQRT2 / 2,
  60: 0.5,
  90: 0,
};

/** `null` à 90° : tan(90°) n'existe pas. */
export const MAGNITUDE_TAN: Record<AngleRemarquable, number | null> = {
  0: 0,
  30: 1 / Math.sqrt(3),
  45: 1,
  60: Math.sqrt(3),
  90: null,
};

export const LATEX_SIN: Record<AngleRemarquable, string> = {
  0: "0",
  30: "\\frac{1}{2}",
  45: "\\frac{\\sqrt{2}}{2}",
  60: "\\frac{\\sqrt{3}}{2}",
  90: "1",
};

export const LATEX_COS: Record<AngleRemarquable, string> = {
  0: "1",
  30: "\\frac{\\sqrt{3}}{2}",
  45: "\\frac{\\sqrt{2}}{2}",
  60: "\\frac{1}{2}",
  90: "0",
};

/** "n'existe pas" à 90° — jamais un gabarit LaTeX, remplacé tel quel par appliquerSigneTanLatex. */
export const LATEX_TAN: Record<AngleRemarquable, string> = {
  0: "0",
  30: "\\frac{\\sqrt{3}}{3}",
  45: "1",
  60: "\\sqrt{3}",
  90: "n'existe pas",
};
