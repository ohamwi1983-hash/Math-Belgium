import type { ExerciceTangentesConique } from "../../core6e/tangentesConique.types";
import { construireFamilleA } from "./familleA";
import { construireFamilleB } from "./familleB";
import { construireFamilleC } from "./familleC";
import { construireFamilleD } from "./familleD";
import { construireFamilleE } from "./familleE";
import { tirerParmi } from "./aleatoire";

export { construireFamilleA } from "./familleA";
export { construireFamilleB } from "./familleB";
export { construireFamilleC } from "./familleC";
export { construireFamilleD } from "./familleD";
export { construireFamilleE } from "./familleE";

/**
 * Couche A (6e) — point d'entrée `6gen62` ("Tangentes à une conique"). Tirage ÉQUIPROBABLE parmi les
 * 5 familles A-E (mission : "1 famille parmi 5, équiprobable").
 */

export type IdVarianteTangentesConique =
  | "A_centree_ellipse"
  | "A_centree_hyperbole"
  | "A_parabole_horizontal"
  | "A_parabole_vertical"
  | "B_aSolution"
  | "B_aucuneSolution"
  | "C_exterieur"
  | "C_interieur"
  | "D_ellipse"
  | "D_hyperbole_horizontal"
  | "D_hyperbole_vertical"
  | "E_pointLePlusProche";

export const CATALOGUE_VARIANTES: { id: IdVarianteTangentesConique; label: string }[] = [
  { id: "A_centree_ellipse", label: "A — tangente en un point donné : ellipse" },
  { id: "A_centree_hyperbole", label: "A — tangente en un point donné : hyperbole" },
  { id: "A_parabole_horizontal", label: "A — tangente en un point donné : parabole (axe horizontal)" },
  { id: "A_parabole_vertical", label: "A — tangente en un point donné : parabole (axe vertical)" },
  { id: "B_aSolution", label: "B — tangentes parallèles à une droite : 2 solutions réelles" },
  { id: "B_aucuneSolution", label: "B — tangentes parallèles à une droite : AUCUNE solution (piège)" },
  { id: "C_exterieur", label: "C — tangentes depuis un point : P EXTÉRIEUR (2 tangentes)" },
  { id: "C_interieur", label: "C — tangentes depuis un point : P INTÉRIEUR (piège, aucune tangente)" },
  { id: "D_ellipse", label: "D — construire une conique : ellipse" },
  { id: "D_hyperbole_horizontal", label: "D — construire une conique : hyperbole (axe transverse horizontal)" },
  { id: "D_hyperbole_vertical", label: "D — construire une conique : hyperbole (axe transverse vertical, piège signe)" },
  { id: "E_pointLePlusProche", label: "E — point d'une conique le plus proche d'une droite" },
];

export function construireAvecVarianteId(id: IdVarianteTangentesConique): ExerciceTangentesConique {
  switch (id) {
    case "A_centree_ellipse":
      return construireFamilleA({ typeConique: "centree", natureCible: "ellipse" });
    case "A_centree_hyperbole":
      return construireFamilleA({ typeConique: "centree", natureCible: "hyperbole" });
    case "A_parabole_horizontal":
      return construireFamilleA({ typeConique: "parabole", axe: "horizontal" });
    case "A_parabole_vertical":
      return construireFamilleA({ typeConique: "parabole", axe: "vertical" });
    case "B_aSolution":
      return construireFamilleB({ aSolution: true });
    case "B_aucuneSolution":
      return construireFamilleB({ aSolution: false });
    case "C_exterieur":
      return construireFamilleC({ aSolution: true });
    case "C_interieur":
      return construireFamilleC({ aSolution: false });
    case "D_ellipse":
      return construireFamilleD({ natureCible: "ellipse" });
    case "D_hyperbole_horizontal":
      return construireFamilleD({ natureCible: "hyperbole", axeTransverse: "horizontal" });
    case "D_hyperbole_vertical":
      return construireFamilleD({ natureCible: "hyperbole", axeTransverse: "vertical" });
    case "E_pointLePlusProche":
      return construireFamilleE();
  }
}

export function genererExerciceTangentesConique(): ExerciceTangentesConique {
  const famille = tirerParmi(["A", "B", "C", "D", "E"] as const);
  if (famille === "A") return construireFamilleA();
  if (famille === "B") return construireFamilleB();
  if (famille === "C") return construireFamilleC();
  if (famille === "D") return construireFamilleD();
  return construireFamilleE();
}
