import type { ExerciceComplexesAvances, FamilleComplexesAvances } from "../../core6e/complexesAvances.types";
import { construireFamilleA, construireFamilleAAvecN } from "./familleA";
import { construireFamilleB, construireFamilleBIntersection, construireFamilleBSimple } from "./familleB";
import { construireFamilleC } from "./familleC";
import { construireFamilleD, construireFamilleDCoef, construireFamilleDModules, construireFamilleDRatio, construireFamilleDReelles } from "./familleD";
import { construireFamilleE } from "./familleE";

export { construireFamilleA, construireFamilleAAvecN, construireFamilleB, construireFamilleBIntersection, construireFamilleBSimple, construireFamilleC, construireFamilleD, construireFamilleDCoef, construireFamilleDModules, construireFamilleDRatio, construireFamilleDReelles, construireFamilleE };

/**
 * Couche A (6e) — point d'entrée `6gen42` ("Nombres complexes : problèmes avancés", chapitre 7
 * "Nombres complexes", générateur de CLÔTURE — 9e et dernier générateur du chapitre, mirroir 6gen29
 * (clôture chapitre 4) et 6gen33 (clôture chapitre 8)). Tirage à 2 niveaux (mirroir
 * `generateurs6e/formeTrigonometrique/index.ts`, 6gen37) : la FAMILLE (A à E) est tirée ÉQUIPROBABLE
 * en premier, puis le sous-type des familles B/D (seules à en avoir un ici) est tiré ÉQUIPROBABLE
 * ensuite, DEDANS `construireFamilleB`/`construireFamilleD`.
 */

export type IdVarianteComplexesAvances =
  | "A_n3"
  | "A_n4"
  | "B_droite"
  | "B_thales"
  | "B_apollonius"
  | "B_demiDroites"
  | "B_cercleO"
  | "B_intersection"
  | "C"
  | "D_ratio"
  | "D_reelles"
  | "D_coef"
  | "D_modules"
  | "E_paralleles"
  | "E_perpendiculaires"
  | "E_aucun";

export const CATALOGUE_VARIANTES: { id: IdVarianteComplexesAvances; label: string }[] = [
  { id: "A_n3", label: "A — Condition réel positif (n=3)" },
  { id: "A_n4", label: "A — Condition réel positif (n=4)" },
  { id: "B_droite", label: "B — Lieu : droite" },
  { id: "B_thales", label: "B — Lieu : cercle de Thalès" },
  { id: "B_apollonius", label: "B — Lieu : cercle d'Apollonius" },
  { id: "B_demiDroites", label: "B — Lieu : demi-droite(s)" },
  { id: "B_cercleO", label: "B — Lieu : cercle centré en O" },
  { id: "B_intersection", label: "B — Intersection de 2 lieux" },
  { id: "C", label: "C — Préservation du cercle unité (Blaschke)" },
  { id: "D_ratio", label: "D — Ratio racine n-ième" },
  { id: "D_reelles", label: "D — Solutions réelles imposées" },
  { id: "D_coef", label: "D — Coefficients depuis une racine donnée" },
  { id: "D_modules", label: "D — Modules simultanés" },
  { id: "E_paralleles", label: "E — Droites parallèles" },
  { id: "E_perpendiculaires", label: "E — Droites perpendiculaires" },
  { id: "E_aucun", label: "E — Ni parallèles ni perpendiculaires" },
];

export function construireAvecVarianteId(id: IdVarianteComplexesAvances): ExerciceComplexesAvances {
  switch (id) {
    case "A_n3":
      return construireFamilleAAvecN(3);
    case "A_n4":
      return construireFamilleAAvecN(4);
    case "B_droite":
      return construireFamilleBSimple("droite");
    case "B_thales":
      return construireFamilleBSimple("thales");
    case "B_apollonius":
      return construireFamilleBSimple("apollonius");
    case "B_demiDroites":
      return construireFamilleBSimple("demiDroites");
    case "B_cercleO":
      return construireFamilleBSimple("cercleO");
    case "B_intersection":
      return construireFamilleBIntersection();
    case "C":
      return construireFamilleC();
    case "D_ratio":
      return construireFamilleDRatio();
    case "D_reelles":
      return construireFamilleDReelles();
    case "D_coef":
      return construireFamilleDCoef();
    case "D_modules":
      return construireFamilleDModules();
    case "E_paralleles":
      return construireFamilleE("paralleles");
    case "E_perpendiculaires":
      return construireFamilleE("perpendiculaires");
    case "E_aucun":
      return construireFamilleE("aucun");
  }
}

const FAMILLES: FamilleComplexesAvances[] = ["A", "B", "C", "D", "E"];

const CONSTRUCTEURS_PAR_FAMILLE: Record<FamilleComplexesAvances, () => ExerciceComplexesAvances> = {
  A: construireFamilleA,
  B: construireFamilleB,
  C: construireFamilleC,
  D: construireFamilleD,
  E: construireFamilleE,
};

export function genererExerciceComplexesAvances(): ExerciceComplexesAvances {
  const famille = FAMILLES[Math.floor(Math.random() * FAMILLES.length)];
  return CONSTRUCTEURS_PAR_FAMILLE[famille]();
}
