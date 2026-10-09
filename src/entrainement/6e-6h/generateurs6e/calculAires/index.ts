import type { ExerciceCalculAires, FamilleCalculAires } from "../../core6e/calculAires.types";
import { construireFamilleAireA, construireFamilleAireA_Exponentielle, construireFamilleAireA_Rationnelle, construireFamilleAireA_Trigonometrique } from "./familleA";
import { construireFamilleAireB, construireFamilleAireB_Cubique, construireFamilleAireB_Parabole } from "./familleB";
import { construireFamilleAireC } from "./familleC";
import { construireFamilleAireD, construireFamilleAireD_BornesATrouver, construireFamilleAireD_BornesDonnees, construireFamilleAireD_Parametre } from "./familleD";

/**
 * Couche A (6e) — point d'entrée `6gen26` ("Calcul d'aires par intégrale", chapitre 4). Tirage
 * ÉQUIPROBABLE de la famille (A à D) — voir en-tête de chaque `familleX.ts` pour la construction
 * détaillée et le contrat de réutilisation de 6gen23.
 */

export {
  construireFamilleAireA,
  construireFamilleAireA_Exponentielle,
  construireFamilleAireA_Rationnelle,
  construireFamilleAireA_Trigonometrique,
  construireFamilleAireB,
  construireFamilleAireB_Parabole,
  construireFamilleAireB_Cubique,
  construireFamilleAireC,
  construireFamilleAireD,
  construireFamilleAireD_BornesDonnees,
  construireFamilleAireD_BornesATrouver,
  construireFamilleAireD_Parametre,
};

export type IdVarianteCalculAires = "A_exponentielle" | "A_rationnelle" | "A_trigonometrique" | "B_parabole" | "B_cubique" | "C" | "D_bornesDonnees" | "D_bornesATrouver" | "D_parametre";

/** Catalogue de variantes `{id,label}` + `construireAvecVarianteId` — convention permanente
 * (CLAUDE.md). Les 3 sous-types de la famille D sont forçables individuellement (le sous-type
 * "parametre" tire équiprobablement entre ses 2 motifs — pas assez d'enjeu pédagogique distinct pour
 * justifier 2 entrées séparées au panneau dev). */
export const CATALOGUE_VARIANTES: { id: IdVarianteCalculAires; label: string }[] = [
  { id: "A_exponentielle", label: "A — Aire courbe/axe, exponentielle" },
  { id: "A_rationnelle", label: "A — Aire courbe/axe, rationnelle (1/x)" },
  { id: "A_trigonometrique", label: "A — Aire courbe/axe, trigonométrique (cos)" },
  { id: "B_parabole", label: "B — Bornes à trouver, parabole" },
  { id: "B_cubique", label: "B — Bornes à trouver, cubique (racine double)" },
  { id: "C", label: "C — Signe changeant, découper et sommer" },
  { id: "D_bornesDonnees", label: "D — Entre 2 courbes, bornes données" },
  { id: "D_bornesATrouver", label: "D — Entre 2 courbes, bornes à trouver" },
  { id: "D_parametre", label: "D — Entre 2 courbes, paramètre m" },
];

export function construireAvecVarianteId(id: IdVarianteCalculAires): ExerciceCalculAires {
  switch (id) {
    case "A_exponentielle":
      return construireFamilleAireA_Exponentielle();
    case "A_rationnelle":
      return construireFamilleAireA_Rationnelle();
    case "A_trigonometrique":
      return construireFamilleAireA_Trigonometrique();
    case "B_parabole":
      return construireFamilleAireB_Parabole();
    case "B_cubique":
      return construireFamilleAireB_Cubique();
    case "C":
      return construireFamilleAireC();
    case "D_bornesDonnees":
      return construireFamilleAireD_BornesDonnees();
    case "D_bornesATrouver":
      return construireFamilleAireD_BornesATrouver();
    case "D_parametre":
      return construireFamilleAireD_Parametre();
  }
}

const FAMILLES: FamilleCalculAires[] = ["A", "B", "C", "D"];

const CONSTRUCTEURS_PAR_FAMILLE: Record<FamilleCalculAires, () => ExerciceCalculAires> = {
  A: construireFamilleAireA,
  B: construireFamilleAireB,
  C: construireFamilleAireC,
  D: construireFamilleAireD,
};

/** Tirage à 1 niveau pour A/B/C, 2 niveaux pour D (famille ÉQUIPROBABLE, puis `construireFamilleAireD`
 * tire son propre sous-type équiprobable) — jamais un tirage uniforme direct parmi les 9 entrées de
 * `CATALOGUE_VARIANTES` (biaiserait A, qui a 3 sous-types, contre C qui n'en a aucun). */
export function genererExerciceCalculAires(): ExerciceCalculAires {
  const famille = FAMILLES[Math.floor(Math.random() * FAMILLES.length)];
  return CONSTRUCTEURS_PAR_FAMILLE[famille]();
}
