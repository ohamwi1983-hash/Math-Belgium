/**
 * Couche présentation (5e) — consignes/labels/aides pour 5gen7 ("Polygones, arcs et secteurs").
 * Peut dépendre de `src/moteur5e/` (seule `src/moteur5e/` ne peut jamais dépendre de
 * `src/generateurs5e/`).
 */
import type { ExercicePolygonesArcsSecteurs, SegmentMultiPas } from "../core5e/polygonesArcsSecteurs.types";
import type { PhasePolygonesArcsSecteurs } from "../moteur5e/typesPolygonesArcsSecteurs";
import type { Surlignage } from "./polygoneCercleSketch";

const SEGMENT_ELEMENTAIRE: SegmentMultiPas = { indexDepart: 0, indexArrivee: 1, k: 1 };

/** Segment/type à surligner sur le diagramme pour l'écran courant — `null` pour "cercleEntier"
 * (aucun surlignage) ou pour un écran multi-pas absent de cet exercice (jamais atteint en
 * pratique, garde défensive). */
export function surlignagePourPhase(exercice: ExercicePolygonesArcsSecteurs, phase: PhasePolygonesArcsSecteurs): Surlignage | null {
  if (phase === "cercleEntier") return null;
  if (phase === "arcElementaire") return { type: "arc", segment: SEGMENT_ELEMENTAIRE };
  if (phase === "secteurElementaire") return { type: "secteur", segment: SEGMENT_ELEMENTAIRE };
  if (phase === "arcMultiPas") return exercice.arcMultiPas !== null ? { type: "arc", segment: exercice.arcMultiPas } : null;
  return exercice.secteurMultiPas !== null ? { type: "secteur", segment: exercice.secteurMultiPas } : null;
}

/** A, B, C... — n≤12 par construction (voir générateur), largement dans A-Z. */
export function labelSommet(index: number): string {
  return String.fromCharCode(65 + index);
}

export function segmentsDonnees(exercice: ExercicePolygonesArcsSecteurs): string {
  return `r = ${exercice.r}, n = ${exercice.n} sommets`;
}

/** Consigne générale redondante, répétée sur chaque écran — intègre les données (r, n) : pas de
 * bloc de données séparé pour ce générateur, cette consigne en tient lieu (convention énoncé,
 * exception au même titre que 5gen5 pour la consigne). */
export function consigneGenerale(exercice: ExercicePolygonesArcsSecteurs): string {
  return `Le cercle suivant est de rayon r=${exercice.r} et a ${exercice.n} sommets.`;
}

const CONSIGNES: Record<PhasePolygonesArcsSecteurs, string> = {
  cercleEntier: "Calcule la circonférence et l'aire du cercle entier (arrondis au centième près).",
  arcElementaire: "Calcule la longueur de l'arc élémentaire, entre 2 sommets consécutifs (arrondis au centième près).",
  arcMultiPas: "Calcule la longueur de l'arc surligné (compte le nombre de crans sur le diagramme). Arrondis au centième près.",
  secteurElementaire: "Calcule l'aire du secteur élémentaire, entre 2 sommets consécutifs (arrondis au centième près).",
  secteurMultiPas: "Calcule l'aire du secteur surligné (compte le nombre de crans sur le diagramme). Arrondis au centième près.",
};

export function consignePhase(phase: PhasePolygonesArcsSecteurs): string {
  return CONSIGNES[phase];
}

const AIDES_NIVEAU1: Record<PhasePolygonesArcsSecteurs, string> = {
  cercleEntier: "Circonférence = 2\\pi r \\qquad \\text{Aire} = \\pi r^2",
  arcElementaire: "\\text{longueur d'arc} = \\text{fraction du cercle} \\times \\text{circonférence}",
  arcMultiPas: "\\text{longueur d'arc} = \\text{fraction du cercle} \\times \\text{circonférence}",
  secteurElementaire: "\\text{aire du secteur} = \\text{fraction du cercle} \\times \\text{aire totale}",
  secteurMultiPas: "\\text{aire du secteur} = \\text{fraction du cercle} \\times \\text{aire totale}",
};

export function texteAideNiveau1(phase: PhasePolygonesArcsSecteurs): string {
  return AIDES_NIVEAU1[phase];
}

function segmentActif(exercice: ExercicePolygonesArcsSecteurs, phase: PhasePolygonesArcsSecteurs): SegmentMultiPas | null {
  if (phase === "arcMultiPas") return exercice.arcMultiPas;
  if (phase === "secteurMultiPas") return exercice.secteurMultiPas;
  return null;
}

/** Niveau 2 — formule substituée (r et n connus), le comptage de crans n'est PAS fourni pour les
 * écrans multi-pas (le "k" reste symbolique, spec explicite). */
export function latexAideNiveau2(exercice: ExercicePolygonesArcsSecteurs, phase: PhasePolygonesArcsSecteurs): string {
  const { r, n } = exercice;
  if (phase === "cercleEntier") return `\\text{Circonférence} = 2\\pi \\times ${r} \\qquad \\text{Aire} = \\pi \\times ${r}^2`;
  if (phase === "arcElementaire") return `\\text{longueur d'arc} = \\dfrac{1}{${n}} \\times 2\\pi \\times ${r}`;
  if (phase === "secteurElementaire") return `\\text{aire du secteur} = \\dfrac{1}{${n}} \\times \\pi \\times ${r}^2`;
  if (phase === "arcMultiPas") return `\\text{longueur d'arc} = \\dfrac{k}{${n}} \\times 2\\pi \\times ${r}`;
  return `\\text{aire du secteur} = \\dfrac{k}{${n}} \\times \\pi \\times ${r}^2`;
}

/** Niveau 3 (écrans multi-pas uniquement) — désigne les 2 sommets à observer, sans donner k. */
export function texteAideNiveau3(exercice: ExercicePolygonesArcsSecteurs, phase: PhasePolygonesArcsSecteurs): string | null {
  const segment = segmentActif(exercice, phase);
  if (segment === null) return null;
  return `Compte le nombre de crans entre les sommets ${labelSommet(segment.indexDepart)} et ${labelSommet(segment.indexArrivee)} sur le diagramme (dans le sens le plus court).`;
}

// ============================================================================
// Réponses attendues (récapitulatif final ET bloc "état actuel") — dérivées PUREMENT de
// `exercice` (r, n, arcMultiPas/secteurMultiPas), jamais de la saisie brute de l'élève. Toujours un
// multiple RATIONNEL de π (r/n/k tous entiers par construction), réduit par PGCD — même principe
// que `formatMultipleDePiLatex` de 5gen6 (`ui5e/formatArcsSecteurs.ts`), dupliqué ICI plutôt que
// partagé entre ces deux générateurs indépendants (convention déjà établie sur la plateforme pour
// ce type de petite primitive pure).
// ============================================================================

function pgcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a || 1;
}

function formatMultipleDePiLatex(numerateur: number, denominateur: number): string {
  const g = pgcd(numerateur, denominateur);
  const n = numerateur / g;
  const d = denominateur / g;
  const piTerme = n === 1 ? "\\pi" : `${n}\\pi`;
  return d === 1 ? piTerme : `\\dfrac{${piTerme}}{${d}}`;
}

export function formatCirconferenceAttendueLatex(exercice: ExercicePolygonesArcsSecteurs): string {
  return formatMultipleDePiLatex(2 * exercice.r, 1);
}

export function formatAireTotaleAttendueLatex(exercice: ExercicePolygonesArcsSecteurs): string {
  return formatMultipleDePiLatex(exercice.r * exercice.r, 1);
}

export function formatArcElementaireAttendueLatex(exercice: ExercicePolygonesArcsSecteurs): string {
  return formatMultipleDePiLatex(2 * exercice.r, exercice.n);
}

export function formatSecteurElementaireAttendueLatex(exercice: ExercicePolygonesArcsSecteurs): string {
  return formatMultipleDePiLatex(exercice.r * exercice.r, exercice.n);
}

/** `null` ssi `exercice.arcMultiPas===null` (écran absent de la séquence). */
export function formatArcMultiPasAttendueLatex(exercice: ExercicePolygonesArcsSecteurs): string | null {
  if (exercice.arcMultiPas === null) return null;
  return formatMultipleDePiLatex(2 * exercice.r * exercice.arcMultiPas.k, exercice.n);
}

/** `null` ssi `exercice.secteurMultiPas===null` (écran absent de la séquence). */
export function formatSecteurMultiPasAttendueLatex(exercice: ExercicePolygonesArcsSecteurs): string | null {
  if (exercice.secteurMultiPas === null) return null;
  return formatMultipleDePiLatex(exercice.r * exercice.r * exercice.secteurMultiPas.k, exercice.n);
}

// ============================================================================
// Bloc "état actuel" — quantités déjà résolues aux écrans précédents de CETTE séquence, jamais sur
// le 1er écran ("cercleEntier") — vide dans ce cas. Réutilise les fonctions "attendue" ci-dessus,
// jamais une seconde dérivation.
// ============================================================================

/** Séquence RÉELLE des écrans traversés par cette instance (3 à 5 écrans selon la présence des 2
 * écrans optionnels) — même ordre que `phaseApres` (`moteur5e/typesPolygonesArcsSecteurs.ts`). */
function sequenceComplete(exercice: ExercicePolygonesArcsSecteurs): PhasePolygonesArcsSecteurs[] {
  const sequence: PhasePolygonesArcsSecteurs[] = ["cercleEntier", "arcElementaire"];
  if (exercice.arcMultiPas !== null) sequence.push("arcMultiPas");
  sequence.push("secteurElementaire");
  if (exercice.secteurMultiPas !== null) sequence.push("secteurMultiPas");
  return sequence;
}

const LABELS_ETAT_ACTUEL: Record<Exclude<PhasePolygonesArcsSecteurs, "cercleEntier">, string> = {
  arcElementaire: "Arc élémentaire",
  arcMultiPas: "Arc multi-pas",
  secteurElementaire: "Secteur élémentaire",
  secteurMultiPas: "Secteur multi-pas",
};

/** Bloc "état actuel" (screens 2+ uniquement) — sur "arcElementaire" (2e écran), rappelle la
 * circonférence ET l'aire du cercle entier déjà confirmées à l'écran 1 ; sur les écrans suivants,
 * ajoute en plus chaque grandeur déjà résolue à ce point de la séquence (dans l'ordre réel de
 * `sequenceComplete`). Vide sur "cercleEntier" (rien n'a encore été résolu). */
export function segmentsEtatActuelPolygone(exercice: ExercicePolygonesArcsSecteurs, phase: PhasePolygonesArcsSecteurs): string[] {
  const sequence = sequenceComplete(exercice);
  const precedentes = sequence.slice(0, sequence.indexOf(phase));
  const termes: string[] = [];
  for (const p of precedentes) {
    if (p === "cercleEntier") {
      termes.push(`\\text{Circonférence} = ${formatCirconferenceAttendueLatex(exercice)}`);
      termes.push(`\\text{Aire du cercle} = ${formatAireTotaleAttendueLatex(exercice)}`);
      continue;
    }
    const valeur = p === "arcElementaire" ? formatArcElementaireAttendueLatex(exercice) : p === "secteurElementaire" ? formatSecteurElementaireAttendueLatex(exercice) : p === "arcMultiPas" ? formatArcMultiPasAttendueLatex(exercice) : formatSecteurMultiPasAttendueLatex(exercice);
    if (valeur !== null) termes.push(`\\text{${LABELS_ETAT_ACTUEL[p]}} = ${valeur}`);
  }
  return termes;
}
