import type { ExerciceIdentificationConiques } from "../../core6e/identificationConiques.types";
import { construireA1, construireDroitesParalleles, construireFamilleA, construireParabole } from "./familleA";
import { construireFamilleB } from "./familleB";
import { construireFamilleC } from "./familleC";
import { tirerParmi } from "./aleatoire";

export { construireA1, construireA2, construireDroitesParalleles, construireFamilleA, construireParabole } from "./familleA";
export { construireFamilleB } from "./familleB";
export { construireFamilleC } from "./familleC";
export type { OverridesFamilleC } from "./familleC";
export * from "./classification";

/**
 * Couche A (6e) — point d'entrée `6gen58` ("Identification d'une conique et de ses éléments
 * caractéristiques"), générateur D'OUVERTURE du chapitre "Les coniques". Tirage à 2 niveaux (mirroir
 * `generateurs6e/denombrementFondamental/index.ts`, 6gen43) : la FAMILLE (A, B, C) est tirée
 * ÉQUIPROBABLE en premier ; pour la famille A, le sous-type (`centree2Carres`/`unCarreUnLineaire`)
 * est ENSUITE tiré équiprobable À L'INTÉRIEUR de `construireFamilleA` (voir `familleA.ts`).
 */

export type IdVarianteIdentificationConiques =
  | "A1_ellipseHorizontal"
  | "A1_ellipseVertical"
  | "A1_cercle"
  | "A1_vide"
  | "A1_point"
  | "A1_hyperboleHorizontal"
  | "A1_hyperboleVertical"
  | "A1_droitesSecantes"
  | "A2_droitesParalleles"
  | "A2_paraboleDroite"
  | "A2_paraboleGauche"
  | "A2_paraboleHaut"
  | "A2_paraboleBas"
  | "B_ellipseHorizontal"
  | "B_ellipseVertical"
  | "B_cercle"
  | "B_vide"
  | "B_point"
  | "B_hyperboleHorizontal"
  | "B_hyperboleVertical"
  | "B_droitesSecantes"
  | "C_ellipseHorizontal"
  | "C_ellipseVertical"
  | "C_hyperboleHorizontal"
  | "C_hyperboleVertical";

export const CATALOGUE_VARIANTES: { id: IdVarianteIdentificationConiques; label: string }[] = [
  { id: "A1_ellipseHorizontal", label: "A1 — Ax²+By²+C=0 : ellipse (axe horizontal)" },
  { id: "A1_ellipseVertical", label: "A1 — Ax²+By²+C=0 : ellipse (axe vertical)" },
  { id: "A1_cercle", label: "A1 — Ax²+By²+C=0 : cercle" },
  { id: "A1_vide", label: "A1 — Ax²+By²+C=0 : ∅ (piège C, même signe)" },
  { id: "A1_point", label: "A1 — Ax²+By²+C=0 : point (piège C=0)" },
  { id: "A1_hyperboleHorizontal", label: "A1 — Ax²+By²+C=0 : hyperbole (axe horizontal)" },
  { id: "A1_hyperboleVertical", label: "A1 — Ax²+By²+C=0 : hyperbole (axe vertical)" },
  { id: "A1_droitesSecantes", label: "A1 — Ax²+By²+C=0 : 2 droites sécantes (piège C=0)" },
  { id: "A2_droitesParalleles", label: "A2 — Av²+Dv=0 : 2 droites parallèles (même variable)" },
  { id: "A2_paraboleDroite", label: "A2 — Av²+Dw=0 : parabole (ouverte à droite)" },
  { id: "A2_paraboleGauche", label: "A2 — Av²+Dw=0 : parabole (ouverte à gauche)" },
  { id: "A2_paraboleHaut", label: "A2 — Av²+Dw=0 : parabole (ouverte vers le haut)" },
  { id: "A2_paraboleBas", label: "A2 — Av²+Dw=0 : parabole (ouverte vers le bas)" },
  { id: "B_ellipseHorizontal", label: "B — décentrée : ellipse (axe horizontal)" },
  { id: "B_ellipseVertical", label: "B — décentrée : ellipse (axe vertical)" },
  { id: "B_cercle", label: "B — décentrée : cercle" },
  { id: "B_vide", label: "B — décentrée : ∅ (piège constante finale)" },
  { id: "B_point", label: "B — décentrée : point" },
  { id: "B_hyperboleHorizontal", label: "B — décentrée : hyperbole (axe horizontal)" },
  { id: "B_hyperboleVertical", label: "B — décentrée : hyperbole (axe vertical)" },
  { id: "B_droitesSecantes", label: "B — décentrée : 2 droites sécantes" },
  { id: "C_ellipseHorizontal", label: "C — racine isolée : ellipse (axe horizontal)" },
  { id: "C_ellipseVertical", label: "C — racine isolée : ellipse (axe vertical)" },
  { id: "C_hyperboleHorizontal", label: "C — racine isolée : hyperbole (axe horizontal)" },
  { id: "C_hyperboleVertical", label: "C — racine isolée : hyperbole (axe vertical)" },
];

export function construireAvecVarianteId(id: IdVarianteIdentificationConiques): ExerciceIdentificationConiques {
  switch (id) {
    case "A1_ellipseHorizontal":
      return construireA1("ellipseHorizontal");
    case "A1_ellipseVertical":
      return construireA1("ellipseVertical");
    case "A1_cercle":
      return construireA1("cercle");
    case "A1_vide":
      return construireA1("vide");
    case "A1_point":
      return construireA1("point");
    case "A1_hyperboleHorizontal":
      return construireA1("hyperboleHorizontal");
    case "A1_hyperboleVertical":
      return construireA1("hyperboleVertical");
    case "A1_droitesSecantes":
      return construireA1("droitesSecantes");
    case "A2_droitesParalleles":
      return construireDroitesParalleles();
    case "A2_paraboleDroite":
      return construireParabole("droite");
    case "A2_paraboleGauche":
      return construireParabole("gauche");
    case "A2_paraboleHaut":
      return construireParabole("haut");
    case "A2_paraboleBas":
      return construireParabole("bas");
    case "B_ellipseHorizontal":
      return construireFamilleB("ellipseHorizontal");
    case "B_ellipseVertical":
      return construireFamilleB("ellipseVertical");
    case "B_cercle":
      return construireFamilleB("cercle");
    case "B_vide":
      return construireFamilleB("vide");
    case "B_point":
      return construireFamilleB("point");
    case "B_hyperboleHorizontal":
      return construireFamilleB("hyperboleHorizontal");
    case "B_hyperboleVertical":
      return construireFamilleB("hyperboleVertical");
    case "B_droitesSecantes":
      return construireFamilleB("droitesSecantes");
    case "C_ellipseHorizontal":
      return construireFamilleC({ variableRacine: "x", s: -1, mBucket: "petit" });
    case "C_ellipseVertical":
      return construireFamilleC({ variableRacine: "x", s: -1, mBucket: "grand" });
    case "C_hyperboleHorizontal":
      return construireFamilleC({ variableRacine: "x", s: 1 });
    case "C_hyperboleVertical":
      return construireFamilleC({ variableRacine: "y", s: 1 });
  }
}

export function genererExerciceIdentificationConiques(): ExerciceIdentificationConiques {
  const famille = tirerParmi(["A", "B", "C"] as const);
  if (famille === "A") return construireFamilleA();
  if (famille === "B") return construireFamilleB();
  return construireFamilleC();
}
