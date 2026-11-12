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
  | "B_cercleA"
  | "B_argument"
  | "B_argumentPi"
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
  { id: "B_cercleA", label: "B — Lieu : |z − a| = k" },
  { id: "B_argument", label: "B — Lieu : arg(z − a) ≡ θ (mod 2π)" },
  { id: "B_argumentPi", label: "B — Lieu : arg(z − a) ≡ θ (mod π)" },
  { id: "B_demiDroites", label: "B — Lieu : demi-droite(s)" },
  { id: "B_cercleO", label: "B — Lieu : cercle centré en O" },
  { id: "B_intersection", label: "B — Intersection de 2 lieux" },
  { id: "B_thales", label: "B — Approfondissement : cercle de Thalès" },
  { id: "B_apollonius", label: "B — Approfondissement : cercle d'Apollonius" },
  { id: "C", label: "C — Le cercle unité est-il préservé ?" },
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
    case "B_cercleA":
      return construireFamilleBSimple("cercleA");
    case "B_argument":
      return construireFamilleBSimple("argument");
    case "B_argumentPi":
      return construireFamilleBSimple("argumentPi");
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

/** Variantes d'approfondissement : accessibles au sélecteur, jamais au tirage libre (décision H). */
const HORS_TIRAGE_LIBRE: IdVarianteComplexesAvances[] = ["B_thales", "B_apollonius"];

/** Tirage libre ÉQUIPROBABLE PAR VARIANTE (17 variantes) — et non plus par famille : la famille C
 * (une seule variante) pèse ainsi ≈ 1/17 du tirage (audit 6e ch. 5, décision J : ≈ 1/16) au lieu de
 * 1/5, et les lieux du cours (famille B) gardent leur place. */
const VARIANTES_TIRAGE_LIBRE: IdVarianteComplexesAvances[] = CATALOGUE_VARIANTES.map((v) => v.id).filter((id) => !HORS_TIRAGE_LIBRE.includes(id));

/** Conservé pour les appelants qui tirent une famille précise. */
export const CONSTRUCTEURS_PAR_FAMILLE: Record<FamilleComplexesAvances, () => ExerciceComplexesAvances> = {
  A: construireFamilleA,
  B: construireFamilleB,
  C: () => construireFamilleC(),
  D: construireFamilleD,
  E: construireFamilleE,
};

export function genererExerciceComplexesAvances(): ExerciceComplexesAvances {
  const id = VARIANTES_TIRAGE_LIBRE[Math.floor(Math.random() * VARIANTES_TIRAGE_LIBRE.length)];
  return construireAvecVarianteId(id);
}
