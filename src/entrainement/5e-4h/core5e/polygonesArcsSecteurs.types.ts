/**
 * Couche core (5e) — contrat propre à `5gen7` ("Polygones, arcs et secteurs : lecture de
 * diagramme"). Un cercle de rayon r, n sommets régulièrement espacés (étiquetés A,B,C... dans
 * l'ordre de parcours FIXE, sens de rotation constant) — l'exercice ne stocke que des INDICES
 * (0..n-1), la traduction en lettres est une pure question de présentation (`ui5e/formatPolygonesArcsSecteurs.ts`).
 *
 * `SegmentMultiPas.k` (nombre de crans, > 1) reste TOUJOURS ≤ n/2 (hypothèse fixée faute de
 * diagramme source, voir CLAUDE.md section 5gen7) : le chemin de `indexDepart` à `indexArrivee` en
 * AVANÇANT dans le sens de parcours (indexArrivee = (indexDepart+k) mod n) est donc toujours le
 * plus court arc entre les deux sommets — aucune ambiguïté de sens à lever pour l'élève.
 */

export interface SegmentMultiPas {
  indexDepart: number;
  indexArrivee: number;
  /** Nombre de crans (> 1, ≤ n/2) entre les 2 sommets, dans le sens de parcours. */
  k: number;
}

export interface ExercicePolygonesArcsSecteurs {
  r: number;
  n: number;
  /** Écran 3 ("arc multi-pas"), tiré indépendamment — `null` si l'écran est absent de la séquence. */
  arcMultiPas: SegmentMultiPas | null;
  /** Écran 5 ("secteur multi-pas"), tiré INDÉPENDAMMENT de `arcMultiPas` (paire de sommets propre,
   * jamais forcément la même). */
  secteurMultiPas: SegmentMultiPas | null;
}

export type GenerateurExercicePolygonesArcsSecteurs = () => ExercicePolygonesArcsSecteurs;
