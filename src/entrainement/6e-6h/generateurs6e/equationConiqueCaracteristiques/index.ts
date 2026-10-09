import type { ExerciceEquationConiqueCaracteristiques } from "../../core6e/equationConiqueCaracteristiques.types";
import { construireAxesPerpendiculaires, construireDeuxSommets, construireFamilleA, construireMemeAxe } from "./familleA";
import { construireFamilleB } from "./familleB";
import { construireFamilleC } from "./familleC";
import { construireFamilleD } from "./familleD";
import { tirerParmi } from "./aleatoire";

export { construireAxesPerpendiculaires, construireDeuxSommets, construireFamilleA, construireMemeAxe } from "./familleA";
export { construireFamilleB } from "./familleB";
export { construireFamilleC } from "./familleC";
export { construireFamilleD } from "./familleD";

/**
 * Couche A (6e) — point d'entrée `6gen59` ("Équation d'une conique depuis ses caractéristiques").
 * Tirage à 2 niveaux (mirroir `identificationConiques/index.ts`, 6gen58) : la FAMILLE (A à D) est
 * tirée ÉQUIPROBABLE en premier ; le sous-type est ensuite tiré équiprobable À L'INTÉRIEUR de
 * chaque `construireFamilleX` (voir `familleA.ts`/`familleD.ts`).
 */

export type IdVarianteEquationConiqueCaracteristiques =
  | "A_memeAxe_ellipse_horizontal"
  | "A_memeAxe_ellipse_vertical"
  | "A_memeAxe_hyperbole_horizontal"
  | "A_memeAxe_hyperbole_vertical"
  | "A_axesPerp_horizontal"
  | "A_axesPerp_vertical"
  | "A_deuxSommets"
  | "B_foyer_horizontal"
  | "B_foyer_vertical"
  | "B_point_horizontal"
  | "B_point_vertical"
  | "C_deuxC_excentricite_ellipse"
  | "C_deuxC_excentricite_hyperbole"
  | "C_deuxC_distanceDirectrices_ellipse"
  | "C_deuxC_distanceDirectrices_hyperbole"
  | "C_deuxA_excentricite_ellipse"
  | "C_deuxA_excentricite_hyperbole"
  | "C_deuxA_distanceDirectrices_ellipse"
  | "C_deuxA_distanceDirectrices_hyperbole"
  | "C_excentricite_distanceDirectrices_ellipse"
  | "C_excentricite_distanceDirectrices_hyperbole"
  | "D_sommet_horizontal"
  | "D_sommet_vertical"
  | "D_foyer_horizontal"
  | "D_foyer_vertical"
  | "D_distanceFocale_horizontal"
  | "D_distanceFocale_vertical";

export const CATALOGUE_VARIANTES: { id: IdVarianteEquationConiqueCaracteristiques; label: string }[] = [
  { id: "A_memeAxe_ellipse_horizontal", label: "A — même axe : ellipse (axe horizontal)" },
  { id: "A_memeAxe_ellipse_vertical", label: "A — même axe : ellipse (axe vertical)" },
  { id: "A_memeAxe_hyperbole_horizontal", label: "A — même axe : hyperbole (axe horizontal)" },
  { id: "A_memeAxe_hyperbole_vertical", label: "A — même axe : hyperbole (axe vertical)" },
  { id: "A_axesPerp_horizontal", label: "A — axes perpendiculaires : foyer sur Ox (piège S secondaire)" },
  { id: "A_axesPerp_vertical", label: "A — axes perpendiculaires : foyer sur Oy (piège S secondaire)" },
  { id: "A_deuxSommets", label: "A — 2 sommets donnés directement" },
  { id: "B_foyer_horizontal", label: "B — parabole depuis le foyer (axe horizontal)" },
  { id: "B_foyer_vertical", label: "B — parabole depuis le foyer (axe vertical)" },
  { id: "B_point_horizontal", label: "B — parabole depuis un point de passage (axe horizontal)" },
  { id: "B_point_vertical", label: "B — parabole depuis un point de passage (axe vertical)" },
  { id: "C_deuxC_excentricite_ellipse", label: "C — 2c & e : ellipse" },
  { id: "C_deuxC_excentricite_hyperbole", label: "C — 2c & e : hyperbole" },
  { id: "C_deuxC_distanceDirectrices_ellipse", label: "C — 2c & distance directrices : ellipse" },
  { id: "C_deuxC_distanceDirectrices_hyperbole", label: "C — 2c & distance directrices : hyperbole" },
  { id: "C_deuxA_excentricite_ellipse", label: "C — 2a & e : ellipse" },
  { id: "C_deuxA_excentricite_hyperbole", label: "C — 2a & e : hyperbole" },
  { id: "C_deuxA_distanceDirectrices_ellipse", label: "C — 2a & distance directrices : ellipse" },
  { id: "C_deuxA_distanceDirectrices_hyperbole", label: "C — 2a & distance directrices : hyperbole" },
  { id: "C_excentricite_distanceDirectrices_ellipse", label: "C — e & distance directrices : ellipse" },
  { id: "C_excentricite_distanceDirectrices_hyperbole", label: "C — e & distance directrices : hyperbole" },
  { id: "D_sommet_horizontal", label: "D — asymptote + sommet (axe transverse horizontal)" },
  { id: "D_sommet_vertical", label: "D — asymptote + sommet (axe transverse vertical, piège a/b)" },
  { id: "D_foyer_horizontal", label: "D — asymptote + foyer (système, axe horizontal)" },
  { id: "D_foyer_vertical", label: "D — asymptote + foyer (système, axe vertical)" },
  { id: "D_distanceFocale_horizontal", label: "D — asymptote + distance focale (axe horizontal)" },
  { id: "D_distanceFocale_vertical", label: "D — asymptote + distance focale (axe vertical)" },
];

export function construireAvecVarianteId(id: IdVarianteEquationConiqueCaracteristiques): ExerciceEquationConiqueCaracteristiques {
  switch (id) {
    case "A_memeAxe_ellipse_horizontal":
      return construireMemeAxe({ natureCible: "ellipse", axe: "horizontal" });
    case "A_memeAxe_ellipse_vertical":
      return construireMemeAxe({ natureCible: "ellipse", axe: "vertical" });
    case "A_memeAxe_hyperbole_horizontal":
      return construireMemeAxe({ natureCible: "hyperbole", axe: "horizontal" });
    case "A_memeAxe_hyperbole_vertical":
      return construireMemeAxe({ natureCible: "hyperbole", axe: "vertical" });
    case "A_axesPerp_horizontal":
      return construireAxesPerpendiculaires({ axePrincipal: "horizontal" });
    case "A_axesPerp_vertical":
      return construireAxesPerpendiculaires({ axePrincipal: "vertical" });
    case "A_deuxSommets":
      return construireDeuxSommets();
    case "B_foyer_horizontal":
      return construireFamilleB({ axe: "horizontal", donneeType: "foyer" });
    case "B_foyer_vertical":
      return construireFamilleB({ axe: "vertical", donneeType: "foyer" });
    case "B_point_horizontal":
      return construireFamilleB({ axe: "horizontal", donneeType: "point" });
    case "B_point_vertical":
      return construireFamilleB({ axe: "vertical", donneeType: "point" });
    case "C_deuxC_excentricite_ellipse":
      return construireFamilleC({ combinaison: ["deuxC", "excentricite"], natureCible: "ellipse" });
    case "C_deuxC_excentricite_hyperbole":
      return construireFamilleC({ combinaison: ["deuxC", "excentricite"], natureCible: "hyperbole" });
    case "C_deuxC_distanceDirectrices_ellipse":
      return construireFamilleC({ combinaison: ["deuxC", "distanceDirectrices"], natureCible: "ellipse" });
    case "C_deuxC_distanceDirectrices_hyperbole":
      return construireFamilleC({ combinaison: ["deuxC", "distanceDirectrices"], natureCible: "hyperbole" });
    case "C_deuxA_excentricite_ellipse":
      return construireFamilleC({ combinaison: ["deuxA", "excentricite"], natureCible: "ellipse" });
    case "C_deuxA_excentricite_hyperbole":
      return construireFamilleC({ combinaison: ["deuxA", "excentricite"], natureCible: "hyperbole" });
    case "C_deuxA_distanceDirectrices_ellipse":
      return construireFamilleC({ combinaison: ["deuxA", "distanceDirectrices"], natureCible: "ellipse" });
    case "C_deuxA_distanceDirectrices_hyperbole":
      return construireFamilleC({ combinaison: ["deuxA", "distanceDirectrices"], natureCible: "hyperbole" });
    case "C_excentricite_distanceDirectrices_ellipse":
      return construireFamilleC({ combinaison: ["excentricite", "distanceDirectrices"], natureCible: "ellipse" });
    case "C_excentricite_distanceDirectrices_hyperbole":
      return construireFamilleC({ combinaison: ["excentricite", "distanceDirectrices"], natureCible: "hyperbole" });
    case "D_sommet_horizontal":
      return construireFamilleD({ sousType: "sommet", axeTransverse: "horizontal" });
    case "D_sommet_vertical":
      return construireFamilleD({ sousType: "sommet", axeTransverse: "vertical" });
    case "D_foyer_horizontal":
      return construireFamilleD({ sousType: "foyer", axeTransverse: "horizontal" });
    case "D_foyer_vertical":
      return construireFamilleD({ sousType: "foyer", axeTransverse: "vertical" });
    case "D_distanceFocale_horizontal":
      return construireFamilleD({ sousType: "distanceFocale", axeTransverse: "horizontal" });
    case "D_distanceFocale_vertical":
      return construireFamilleD({ sousType: "distanceFocale", axeTransverse: "vertical" });
  }
}

export function genererExerciceEquationConiqueCaracteristiques(): ExerciceEquationConiqueCaracteristiques {
  const famille = tirerParmi(["A", "B", "C", "D"] as const);
  if (famille === "A") return construireFamilleA();
  if (famille === "B") return construireFamilleB();
  if (famille === "C") return construireFamilleC();
  return construireFamilleD();
}
