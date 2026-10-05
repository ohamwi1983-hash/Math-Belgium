/**
 * Couche présentation (5e) — segmentation d'un domaine visible autour d'AU PLUS UNE exclusion,
 * pour 5gen25 famille A avancée (`prompt5gen25varianteavanceerichessegraphique.md`). Local et
 * volontairement minimal (une seule exclusion possible par fonction ici, contrairement à
 * `construireSegmentsFonctionReelle`, 5gen31, généraliste à N exclusions mais non réactive au
 * zoom) — jamais importé cross-générateur, cette fonction est réévaluée à chaque changement de
 * fenêtre visible (voir `FenetreVisibleXY5e`, `mafsGraphPartage5e.tsx`).
 */

/** Marge de part et d'autre d'une exclusion — jamais évaluée à l'intérieur (asymptote/cuspide/
 * tangente verticale : valeurs énormes ou non définies tout près du point). */
export const BUFFER_EXCLUSION_ASSOCIATION = 0.4;

/** Découpe `[visibleMin, visibleMax]` en 1 segment (aucune exclusion, ou exclusion hors champ) ou
 * jusqu'à 2 segments (exclusion à l'intérieur, un segment de moins si la marge mange tout un
 * côté — ex. très zoomé près du bord). Jamais de segment vide ni inversé. */
export function construireSegmentsExclusionUnique(visibleMin: number, visibleMax: number, exclusion: number | null): [number, number][] {
  if (exclusion === null || exclusion <= visibleMin || exclusion >= visibleMax) {
    return [[visibleMin, visibleMax]];
  }
  const segments: [number, number][] = [];
  const gauche = exclusion - BUFFER_EXCLUSION_ASSOCIATION;
  const droite = exclusion + BUFFER_EXCLUSION_ASSOCIATION;
  if (gauche > visibleMin) segments.push([visibleMin, gauche]);
  if (droite < visibleMax) segments.push([droite, visibleMax]);
  return segments;
}
