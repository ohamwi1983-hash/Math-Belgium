import type { ExerciceEquationsCyclometriques, VarianteEquationsCyclometriques } from "../../core6e/equationsCyclometriques.types";
import { construireAngleLineaire } from "./familles/angleLineaire";
import { construireAngleQuadratique } from "./familles/angleQuadratique";
import { construireArcfonctionsDifferentesAvecSousCas } from "./familles/arcfonctionsDifferentes";
import { construireMemeArcfonction } from "./familles/memeArcfonction";

/** Identifiant de variante POUR LE PANNEAU DEV — la variante 4 y est éclatée en ses 3 sous-cas
 * (utile pour forcer directement un sous-cas précis sans retirer), contrairement au tirage normal
 * qui tire d'abord la variante puis, pour la 4, son sous-cas. */
export type IdVarianteDev = "angleLineaire" | "memeArcfonction" | "angleQuadratique" | "arcfonctionsDifferentes_asin_acos" | "arcfonctionsDifferentes_asin_atan" | "arcfonctionsDifferentes_acos_atan";

export const CATALOGUE_VARIANTES: { id: IdVarianteDev; label: string }[] = [
  { id: "angleLineaire", label: "1. arcfonction(ax+b) = angle" },
  { id: "memeArcfonction", label: "2. arcfonction(ax+b) = arcfonction(cx+d)" },
  { id: "angleQuadratique", label: "3. arcfonction(ax²+bx+c) = angle" },
  { id: "arcfonctionsDifferentes_asin_acos", label: "4a. arcsin(ax+b) = arccos(cx+d)" },
  { id: "arcfonctionsDifferentes_asin_atan", label: "4b. arcsin(ax+b) = arctan(cx+d)" },
  { id: "arcfonctionsDifferentes_acos_atan", label: "4c. arccos(ax+b) = arctan(cx+d)" },
];

export function construireAvecVarianteId(id: IdVarianteDev): ExerciceEquationsCyclometriques {
  switch (id) {
    case "angleLineaire":
      return construireAngleLineaire();
    case "memeArcfonction":
      return construireMemeArcfonction();
    case "angleQuadratique":
      return construireAngleQuadratique();
    case "arcfonctionsDifferentes_asin_acos":
      return construireArcfonctionsDifferentesAvecSousCas("asin_acos");
    case "arcfonctionsDifferentes_asin_atan":
      return construireArcfonctionsDifferentesAvecSousCas("asin_atan");
    case "arcfonctionsDifferentes_acos_atan":
      return construireArcfonctionsDifferentesAvecSousCas("acos_atan");
  }
}

const VARIANTES: VarianteEquationsCyclometriques[] = ["angleLineaire", "memeArcfonction", "angleQuadratique", "arcfonctionsDifferentes"];
const SOUS_CAS_4 = ["asin_acos", "asin_atan", "acos_atan"] as const;

/** Tirage ÉQUIPROBABLE parmi les 4 variantes (spec explicite) — la variante 4 tire ensuite l'un de
 * ses 3 sous-cas, ÉQUIPROBABLE lui aussi. */
export function genererExerciceEquationsCyclometriques(): ExerciceEquationsCyclometriques {
  const variante = VARIANTES[Math.floor(Math.random() * VARIANTES.length)];
  if (variante === "angleLineaire") return construireAngleLineaire();
  if (variante === "memeArcfonction") return construireMemeArcfonction();
  if (variante === "angleQuadratique") return construireAngleQuadratique();
  return construireArcfonctionsDifferentesAvecSousCas(SOUS_CAS_4[Math.floor(Math.random() * SOUS_CAS_4.length)]);
}
