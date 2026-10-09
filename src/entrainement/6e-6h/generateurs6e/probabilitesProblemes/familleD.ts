import type { ContexteFamilleD, ExerciceFamilleD } from "../../core6e/probabilitesProblemes.types";

/**
 * Couche A (6e) — génération famille D ("Probabilité géométrique") pour `6gen33`. Zones concentriques
 * (cercles), probabilité d'une zone proportionnelle à son aire. Rayons ENTIERS r1<r2<r3 — les aires
 * (disque interne πr1², anneau2 π(r2²-r1²), anneau3 π(r3²-r2²)) sont donc TOUJOURS des multiples
 * entiers exacts de π (jamais de flottant/fraction à gérer pour π lui-même) : `coeffAire(zone)`
 * retourne ce coefficient entier, comparé tel quel côté vérification — π s'annule structurellement
 * dans le rapport de l'écran 2 (probabilité = rapport de coefficients, jamais besoin d'évaluer π
 * numériquement).
 */

function tirerParmi<T>(candidats: readonly T[]): T {
  return candidats[Math.floor(Math.random() * candidats.length)];
}

const CONTEXTES_D: readonly ContexteFamilleD[] = [
  { id: "cible", texte: "Une cible de tir est formée de 3 zones concentriques : un disque central et deux anneaux. Un tir touche la cible en un point choisi AU HASARD sur toute la surface (probabilité proportionnelle à l'aire).", labelZones: ["Zone centrale", "Zone intermédiaire", "Zone externe"] },
  { id: "jardin", texte: "Un jardin circulaire est divisé en 3 zones concentriques (parterre central, allée circulaire, pelouse extérieure). Une graine tombe en un point choisi AU HASARD sur toute la surface (probabilité proportionnelle à l'aire).", labelZones: ["Parterre central", "Allée circulaire", "Pelouse extérieure"] },
];

/** Rayons candidats (petits entiers, écarts ≥1 garantis à la construction) — bornés pour que les
 * aires calculées à la main restent des nombres raisonnables. */
function tirerRayons(): [number, number, number] {
  const r1 = 2 + Math.floor(Math.random() * 3); // 2..4
  const r2 = r1 + 1 + Math.floor(Math.random() * 3); // r1+1..r1+3
  const r3 = r2 + 1 + Math.floor(Math.random() * 3); // r2+1..r2+3
  return [r1, r2, r3];
}

/** Construction déterministe (`zoneCible` fixée) — utilisée par `CATALOGUE_VARIANTES`/
 * `construireAvecVarianteId`. `zoneCible` toujours CONTIGU depuis 0 (voir en-tête de
 * `core6e/probabilitesProblemes.types.ts`). */
export function construireFamilleD(zoneCible: number[]): ExerciceFamilleD {
  return { famille: "D", contexte: tirerParmi(CONTEXTES_D), r: tirerRayons(), zoneCible };
}

const ZONES_CIBLES: readonly number[][] = [[0], [1], [2], [0, 1]];

export function genererFamilleD(): ExerciceFamilleD {
  return construireFamilleD(tirerParmi(ZONES_CIBLES));
}

// ============================================================================
// Calculs purs — réutilisés par les TESTS de ce fichier (voir `familleA.ts`, même principe).
// ============================================================================

/** Coefficient entier de π pour la zone d'index `zone` (0=disque interne,1=anneau2,2=anneau3). */
export function coeffAireZone(r: [number, number, number], zone: number): number {
  if (zone === 0) return r[0] ** 2;
  if (zone === 1) return r[1] ** 2 - r[0] ** 2;
  return r[2] ** 2 - r[1] ** 2;
}

/** Aire totale (coefficient de π) — celle du plus grand disque, rayon r3. */
export function coeffAireTotale(r: [number, number, number]): number {
  return r[2] ** 2;
}

/** Écran 2 — probabilité demandée = somme des coefficients des zones ciblées / coefficient total. */
export function probabiliteZoneCible(exercice: ExerciceFamilleD): number {
  const numerateur = exercice.zoneCible.reduce((acc, z) => acc + coeffAireZone(exercice.r, z), 0);
  return numerateur / coeffAireTotale(exercice.r);
}
