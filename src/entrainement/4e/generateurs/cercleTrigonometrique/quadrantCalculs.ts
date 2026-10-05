import type { Quadrant, Signe, SigneTan } from "../../core/cercleTrigonometrique.types";

/**
 * angleReduit est toujours un entier dans [0,360[ — 0°/180° tombent sur l'axe Ox (y=0), 90°/270°
 * sur l'axe Oy (x=0). "axeOx"/"axeOy" sont deux valeurs distinctes (round 2,
 * promptcorrectionsgenerateurcercletrigo2.md, point 1.4) — jamais une seule valeur "axe" commune.
 */
export function calculerQuadrant(angleReduit: number): Quadrant {
  if (angleReduit === 0 || angleReduit === 180) return "axeOx";
  if (angleReduit === 90 || angleReduit === 270) return "axeOy";
  if (angleReduit < 90) return "I";
  if (angleReduit < 180) return "II";
  if (angleReduit < 270) return "III";
  return "IV";
}

/**
 * Angle du premier quadrant (angle de référence par rapport à l'axe des x). Pour un angle sur un
 * axe, règle corrigée (promptcorrectionsgenerateur14lot2.md, section 3, remplace la règle "90°
 * pour tout multiple de 90°" précédente) : les multiples PAIRS de 90° (0°/180°/360°, axe Ox) ont un
 * angle de référence de 0° — le point de θ est déjà "sur" l'axe de référence, aucune rotation n'est
 * nécessaire pour l'y ramener ; les multiples IMPAIRS (90°/270°, axe Oy) restent à 90°.
 */
export function calculerAnglePremierQuadrant(angleReduit: number, quadrant: Quadrant): number {
  switch (quadrant) {
    case "axeOx":
      return 0;
    case "axeOy":
      return 90;
    case "I":
      return angleReduit;
    case "II":
      return 180 - angleReduit;
    case "III":
      return angleReduit - 180;
    case "IV":
      return 360 - angleReduit;
  }
}

/**
 * sin/cos/tan aux 4 angles axiaux (0°/90°/180°/270°) : sin s'annule en 0°/180° (axe Ox, y=0), cos
 * s'annule en 90°/270° (axe Oy, x=0), tan s'annule en 0°/180° et n'est pas définie (∄) en 90°/270°
 * — trois fonctions distinctes plutôt qu'une seule, chacune avec sa propre table de cas
 * particuliers. Distinguer axeOx/axeOy simplifie ces tables par rapport à l'ancienne valeur "axe"
 * unique : sin/tan valent toujours 0 sur tout l'axe Ox (aucun besoin de départager 0°/180°), et
 * cos/tan valent toujours 0/∄ sur tout l'axe Oy (aucun besoin de départager 90°/270°).
 */
export function calculerSigneSin(angleReduit: number, quadrant: Quadrant): Signe {
  if (quadrant === "axeOx") return "0";
  if (quadrant === "axeOy") return angleReduit === 90 ? "+" : "-";
  return quadrant === "I" || quadrant === "II" ? "+" : "-";
}

export function calculerSigneCos(angleReduit: number, quadrant: Quadrant): Signe {
  if (quadrant === "axeOy") return "0";
  if (quadrant === "axeOx") return angleReduit === 0 ? "+" : "-";
  return quadrant === "I" || quadrant === "IV" ? "+" : "-";
}

export function calculerSigneTan(quadrant: Quadrant): SigneTan {
  if (quadrant === "axeOx") return "0";
  if (quadrant === "axeOy") return "indefini";
  return quadrant === "I" || quadrant === "III" ? "+" : "-";
}
