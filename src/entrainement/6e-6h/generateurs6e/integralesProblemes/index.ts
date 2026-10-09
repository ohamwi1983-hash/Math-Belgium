import type { ExerciceIntegralesProblemes, FamilleIntegralesProblemes } from "../../core6e/integralesProblemes.types";
import { construireFamilleA } from "./familleA";
import { construireFamilleB_Evaluer, construireFamilleB_Resoudre } from "./familleB";
import { construireFamilleC_Simple, construireFamilleC_Variante } from "./familleC";
import { construireFamilleD } from "./familleD";
import { construireFamilleE } from "./familleE";
import { construireFamilleF } from "./familleF";
import { construireFamilleG_Archimede, construireFamilleG_Calotte, construireFamilleG_Soustraction } from "./familleG";

export { construireFamilleA } from "./familleA";
export { construireFamilleB_Evaluer, construireFamilleB_Resoudre } from "./familleB";
export { construireFamilleC_Simple, construireFamilleC_Variante } from "./familleC";
export { construireFamilleD } from "./familleD";
export { construireFamilleE } from "./familleE";
export { construireFamilleF } from "./familleF";
export { construireFamilleG_Archimede, construireFamilleG_Calotte, construireFamilleG_Soustraction } from "./familleG";

/**
 * Couche A (6e) — point d'entrée `6gen29` ("Intégrales et primitives : problèmes", chapitre 4,
 * générateur DE CLÔTURE). Tirage à 1 niveau : famille (A à G) ÉQUIPROBABLE, chaque
 * `construireFamilleX` gérant lui-même son tirage de contexte/sous-type interne (mirroir 6gen23/27).
 */

export type IdVarianteIntegralesProblemes = "A" | "B_evaluer" | "B_resoudre" | "C" | "C_variante" | "D" | "E" | "F" | "G_soustraction" | "G_archimede" | "G_calotte";

export const CATALOGUE_VARIANTES: { id: IdVarianteIntegralesProblemes; label: string }[] = [
  { id: "A", label: "A — Méthode des trapèzes (profil discret)" },
  { id: "B_evaluer", label: "B — Cinématique : évaluer x(t1)" },
  { id: "B_resoudre", label: "B — Cinématique : résoudre x(t)=cible" },
  { id: "C", label: "C — Travail, loi de Hooke" },
  { id: "C_variante", label: "C — Travail, loi de Hooke (2 intervalles à comparer)" },
  { id: "D", label: "D — Coût marginal, total et moyen" },
  { id: "E", label: "E — Valeur moyenne en contexte (stock/action)" },
  { id: "F", label: "F — Surplus consommateur" },
  { id: "G_soustraction", label: "G — Volume : soustraction (cylindre creux)" },
  { id: "G_archimede", label: "G — Volume : principe d'Archimède" },
  { id: "G_calotte", label: "G — Volume : calotte sphérique" },
];

export function construireAvecVarianteId(id: IdVarianteIntegralesProblemes): ExerciceIntegralesProblemes {
  switch (id) {
    case "A":
      return construireFamilleA();
    case "B_evaluer":
      return construireFamilleB_Evaluer();
    case "B_resoudre":
      return construireFamilleB_Resoudre();
    case "C":
      return construireFamilleC_Simple();
    case "C_variante":
      return construireFamilleC_Variante();
    case "D":
      return construireFamilleD();
    case "E":
      return construireFamilleE();
    case "F":
      return construireFamilleF();
    case "G_soustraction":
      return construireFamilleG_Soustraction();
    case "G_archimede":
      return construireFamilleG_Archimede();
    case "G_calotte":
      return construireFamilleG_Calotte();
  }
}

const FAMILLES: FamilleIntegralesProblemes[] = ["A", "B", "C", "D", "E", "F", "G"];

function construireFamilleGAleatoire(): ExerciceIntegralesProblemes {
  const sousTypes: IdVarianteIntegralesProblemes[] = ["G_soustraction", "G_archimede", "G_calotte"];
  return construireAvecVarianteId(sousTypes[Math.floor(Math.random() * sousTypes.length)]);
}

const CONSTRUCTEURS_PAR_FAMILLE: Record<FamilleIntegralesProblemes, () => ExerciceIntegralesProblemes> = {
  A: construireFamilleA,
  B: () => (Math.random() < 0.5 ? construireFamilleB_Evaluer() : construireFamilleB_Resoudre()),
  C: () => (Math.random() < 0.5 ? construireFamilleC_Simple() : construireFamilleC_Variante()),
  D: construireFamilleD,
  E: construireFamilleE,
  F: construireFamilleF,
  G: construireFamilleGAleatoire,
};

/** Tirage à 2 niveaux : famille (A-G) ÉQUIPROBABLE, puis contexte/sous-type ÉQUIPROBABLE au sein de
 * la famille — jamais un tirage uniforme direct parmi les 11 entrées de `CATALOGUE_VARIANTES`
 * (biaiserait les familles à peu de sous-types contre G, qui en a 3). */
export function genererExerciceIntegralesProblemes(): ExerciceIntegralesProblemes {
  const famille = FAMILLES[Math.floor(Math.random() * FAMILLES.length)];
  return CONSTRUCTEURS_PAR_FAMILLE[famille]();
}
