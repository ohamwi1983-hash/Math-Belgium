import type { ExercicePointsDroitesRemarquablesTriangle, FamillePointsDroitesRemarquablesTriangle } from "../../core6e/pointsDroitesRemarquablesTriangle.types";
import { construireFamilleA } from "./familleA";
import { construireFamilleB } from "./familleB";
import { construireFamilleC } from "./familleC";
import { construireFamilleD } from "./familleD";
import { construireFamilleE } from "./familleE";
import { calculerSymetriqueParRapportADroite, construireFamilleF } from "./familleF";
import { construireCentreCote, construireFamilleG, construireSommetDiagonale } from "./familleG";
import { construireFamilleH } from "./familleH";

export { construireFamilleA, construireFamilleB, construireFamilleC, construireFamilleD, construireFamilleE, construireFamilleF, calculerSymetriqueParRapportADroite, construireFamilleG, construireSommetDiagonale, construireCentreCote, construireFamilleH };

/**
 * Couche A (6e) — point d'entrée `6gen54` ("Points et droites remarquables du triangle"),
 * générateur D'OUVERTURE du chapitre "Lieux géométriques". Tirage à 1 niveau pour 7 des 8 familles
 * (A-F, H : équiprobable) ; la famille G tire ensuite ÉQUIPROBABLEMENT son sous-type
 * ("sommetDiagonale"/"centreCote") — mirroir du patron `denombrementFondamental/index.ts` (6gen43).
 */

export type IdVariantePointsDroitesRemarquablesTriangle = "A" | "B" | "C" | "D" | "E" | "F" | "G_sommetDiagonale" | "G_centreCote" | "H";

export const CATALOGUE_VARIANTES: { id: IdVariantePointsDroitesRemarquablesTriangle; label: string }[] = [
  { id: "A", label: "A — Sommets depuis les milieux des côtés" },
  { id: "B", label: "B — Point d'une bissectrice sur le côté opposé" },
  { id: "C", label: "C — Point à aire imposée sur une droite" },
  { id: "D", label: "D — Côtés depuis un sommet et 2 médianes" },
  { id: "E", label: "E — Droite équidistante de deux points" },
  { id: "F", label: "F — Symétrique d'un point par rapport à une droite" },
  { id: "G_sommetDiagonale", label: "G — Sommets d'un carré (sommet + diagonale)" },
  { id: "G_centreCote", label: "G — Sommets d'un carré (centre + côté)" },
  { id: "H", label: "H — Rayon réfléchi (réutilise F)" },
];

export function construireAvecVarianteId(id: IdVariantePointsDroitesRemarquablesTriangle): ExercicePointsDroitesRemarquablesTriangle {
  switch (id) {
    case "A":
      return construireFamilleA();
    case "B":
      return construireFamilleB();
    case "C":
      return construireFamilleC();
    case "D":
      return construireFamilleD();
    case "E":
      return construireFamilleE();
    case "F":
      return construireFamilleF();
    case "G_sommetDiagonale":
      return construireSommetDiagonale();
    case "G_centreCote":
      return construireCentreCote();
    case "H":
      return construireFamilleH();
  }
}

const FAMILLES: FamillePointsDroitesRemarquablesTriangle[] = ["A", "B", "C", "D", "E", "F", "G", "H"];

const CONSTRUCTEURS_PAR_FAMILLE: Record<FamillePointsDroitesRemarquablesTriangle, () => ExercicePointsDroitesRemarquablesTriangle> = {
  A: construireFamilleA,
  B: construireFamilleB,
  C: construireFamilleC,
  D: construireFamilleD,
  E: construireFamilleE,
  F: construireFamilleF,
  G: construireFamilleG,
  H: construireFamilleH,
};

export function genererExercicePointsDroitesRemarquablesTriangle(): ExercicePointsDroitesRemarquablesTriangle {
  const famille = FAMILLES[Math.floor(Math.random() * FAMILLES.length)];
  return CONSTRUCTEURS_PAR_FAMILLE[famille]();
}
