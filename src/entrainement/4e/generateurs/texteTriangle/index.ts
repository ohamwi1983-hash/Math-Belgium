import type { ExerciceTexteTriangle } from "../../core/texteTriangle.types";
import { construireDeuxBateaux, construireParcelle, construireTrajets } from "./navigation";
import { construireDepression, construireDistanceInaccessible, construireElevation } from "./visees";
import { construireDeuxPositions } from "./deuxPositions";
import { choisir } from "./outils";

/**
 * Générateur de gen77 « Du texte au triangle : problèmes en contexte ». Tout le hasard passe par
 * `Math.random` : `genererAvecCode` (`export/codeExercice.ts`) le remplace par une graine, et le QR
 * code d'une feuille rouvre ainsi le MÊME exercice.
 *
 * Garanties (vérifiées par tirages massifs) : situations à caps, angle utile entre 32° et 148°,
 * jamais à moins de 6° d'un angle droit (pas de Pythagore déguisé), caps à plus de 14° d'un point
 * cardinal ; élévation et dépression, hauteur plausible pour le contexte (falaise, éolienne,
 * colline, montgolfière), angles de visée réalistes (petits pour une dépression) ; pour « deux
 * positions », toujours deux triangles distincts (angle candidat aigu ≤ 76°, deuxième position à
 * plus de 10° de P vue de R, distances écartées d'au moins 3 km) et un seuil qui sépare nettement
 * les deux positions.
 */

export const CATALOGUE_VARIANTES: { id: string; label: string }[] = [
  { id: "trajets", label: "Navigation — deux trajets successifs (caps)" },
  { id: "deuxBateaux", label: "Navigation — deux mobiles partis du même point (caps)" },
  { id: "elevation", label: "Angles d'élévation vus de deux points" },
  { id: "depression", label: "Angles de dépression vers deux points" },
  { id: "distanceInaccessible", label: "Distance inaccessible (base mesurée)" },
  { id: "parcelle", label: "Topographie — parcelle relevée depuis un coin" },
  { id: "deuxPositions", label: "Deux positions possibles (radar, cas ambigu)" },
];

const CONSTRUCTEURS: Record<string, () => ExerciceTexteTriangle> = {
  trajets: () => construireTrajets(),
  deuxBateaux: () => construireDeuxBateaux(),
  elevation: construireElevation,
  depression: construireDepression,
  distanceInaccessible: () => construireDistanceInaccessible(),
  parcelle: () => construireParcelle(),
  deuxPositions: () => construireDeuxPositions(),
};

export function construireAvecVariante(id: string): ExerciceTexteTriangle {
  const constructeur = CONSTRUCTEURS[id];
  return constructeur ? constructeur() : genererExerciceTexteTriangle();
}

/** Tirage libre : une situation au hasard parmi les sept. */
export function genererExerciceTexteTriangle(): ExerciceTexteTriangle {
  return construireAvecVariante(choisir(CATALOGUE_VARIANTES).id);
}
