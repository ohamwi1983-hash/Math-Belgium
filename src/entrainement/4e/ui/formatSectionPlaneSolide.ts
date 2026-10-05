import type { SegmentExtraSolide3D, PointExtraSolide3D } from "../components/Solide3DSketch";
import type { ExerciceSectionPlaneSolide } from "../core/sectionPlaneSolide.types";
import { cleLigneSegmentTrace, cleSegment } from "../moteur/verificationSectionPlaneSolide";

/**
 * Présentation — "Section plane d'un solide" (40e générateur, chapitre "Géométrie dans l'espace").
 * Terminologie interdite dans tout texte affiché à l'élève : "déterminant", "produit scalaire" (même
 * règle que "Position droite/plan").
 *
 * Aucune saisie libre nulle part (sélection uniquement, spec section "Vérification") — jamais de
 * `StatutVerification`/`formatMessageErreur` avec un statut particulier ici, le message générique
 * "Incorrect — tentative N/M" suffit partout, comme "Position droite/plan".
 */

export function libelleBoutonAide(niveau: number, max: number): string {
  if (niveau >= max) return "Aide utilisée";
  if (niveau === 0) return "Aide";
  return "Aide supplémentaire";
}

// --- Étiquetage des points/faces découverts --------------------------------------------------------

/** P, Q, R sont toujours les 3 premiers (`connus[0..2]`, ordre fixé par `idsDepart`) ; chaque point
 * auxiliaire découvert ensuite reçoit la lettre suivante, dans l'ordre RÉEL de découverte (l'ordre
 * d'insertion de `connus`, jamais un ordre recalculé indépendamment). */
const LETTRES_POINTS = ["P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];

export function libellePoint(connus: readonly number[], id: number): string {
  const index = connus.indexOf(id);
  if (index < 0 || index >= LETTRES_POINTS.length) return `#${id}`;
  return LETTRES_POINTS[index];
}

/** Libellé d'une face du solide — ses sommets nommés concaténés entre parenthèses, ex. "(ABFE)" —
 * jamais un numéro d'index brut montré à l'élève. */
export function libelleFace(exercice: ExerciceSectionPlaneSolide, face: number): string {
  return `(${exercice.solide.faces[face].join("")})`;
}

// --- Rendu du croquis --------------------------------------------------------------------------------

const COULEUR_CONNU = "#1971c2";
const COULEUR_SELECTION = "#f08c00";

/** Points de section déjà connus, prêts à être passés en `pointsExtra` de `Solide3DSketch` —
 * toujours dérivés de `connus` (jamais de la saisie de l'élève), étiquetés P/Q/R/S/T/... selon leur
 * ordre réel de découverte. */
export function pointsExtraConnus(exercice: ExerciceSectionPlaneSolide, connus: readonly number[]): PointExtraSolide3D[] {
  return connus.map((id) => {
    const point = exercice.points.find((p) => p.id === id);
    if (!point) throw new Error(`pointsExtraConnus : point inconnu (id=${id})`);
    return { position: point.position, label: libellePoint(connus, id), couleur: COULEUR_CONNU };
  });
}

/** Segments de la section déjà tracés, prêts à être passés en `segmentsExtra`. */
export function segmentsExtraTraces(exercice: ExerciceSectionPlaneSolide, segmentsTraces: readonly string[]): SegmentExtraSolide3D[] {
  return segmentsTraces.map((cle) => {
    const [a, b] = cle.split("-").map(Number);
    const pointA = exercice.points.find((p) => p.id === a);
    const pointB = exercice.points.find((p) => p.id === b);
    if (!pointA || !pointB) throw new Error(`segmentsExtraTraces : segment invalide (cle=${cle})`);
    return { a: pointA.position, b: pointB.position, couleur: COULEUR_CONNU };
  });
}

/** Aperçu (pointillé orange) du segment que désignerait la face actuellement survolée/sélectionnée à
 * l'écran A — jamais affiché avant sélection, jamais la réponse correcte imposée : seulement ce que
 * l'élève a lui-même choisi, quel que soit son statut de correction. `null` si les 2 points de cette
 * face ne sont pas tous les deux déjà connus (aperçu impossible à tracer). */
export function apercuSegmentFace(
  exercice: ExerciceSectionPlaneSolide,
  connus: readonly number[],
  face: number | null,
): SegmentExtraSolide3D | null {
  if (face === null) return null;
  const pointsDeFace = exercice.points.filter((p) => p.faces.includes(face) && connus.includes(p.id));
  if (pointsDeFace.length !== 2) return null;
  const [a, b] = pointsDeFace;
  return { a: a.position, b: b.position, couleur: COULEUR_SELECTION, pointille: true };
}

/** Aperçu (pointillé orange) des 2 droites actuellement sélectionnées à l'écran B, étape 1. */
export function apercuLignesChoisies(exercice: ExerciceSectionPlaneSolide, cles: readonly string[]): SegmentExtraSolide3D[] {
  return cles.flatMap((cle) => {
    const ligne = resoudrePourApercu(exercice, cle);
    return ligne ? [{ a: ligne[0], b: ligne[1], couleur: COULEUR_SELECTION, pointille: true }] : [];
  });
}

function resoudrePourApercu(exercice: ExerciceSectionPlaneSolide, cle: string) {
  const statique = exercice.lignesStatiques.find((l) => l.cle === cle);
  if (statique) return statique.points;
  if (cle.startsWith("segment:")) {
    const [a, b] = cle.slice("segment:".length).split("-").map(Number);
    const pointA = exercice.points.find((p) => p.id === a);
    const pointB = exercice.points.find((p) => p.id === b);
    if (pointA && pointB) return [pointA.position, pointB.position] as const;
  }
  return null;
}

// --- Indicateur de progression (nombre d'écrans non connu à l'avance, voir typesSectionPlaneSolide.ts) --

/** Deux compteurs live plutôt qu'une formule dérivée du nombre d'itérations restantes (jugée trop
 * fragile — voir la discussion d'architecture) : toujours dérivés directement de l'état vivant. */
export function texteProgressionPoints(exercice: ExerciceSectionPlaneSolide, connus: readonly number[]): string {
  return `Sommets découverts : ${connus.length}/${exercice.points.length}`;
}

export function texteProgressionSegments(exercice: ExerciceSectionPlaneSolide, segmentsTraces: readonly string[]): string {
  return `Segments tracés : ${segmentsTraces.length}/${exercice.points.length}`;
}

// --- Écran A — segment direct ------------------------------------------------------------------------

export const CONSIGNE_SEGMENT_DIRECT = "Sélectionne une face dont les 2 points de section sont déjà connus, pour y tracer le segment de coupe.";

export const TEXTE_AIDE_SEGMENT_NIVEAU1 =
  "Rappel de la méthode : dès qu'une face possède 2 points de section déjà connus, le segment qui les relie peut être tracé directement.";

export interface CandidatSegmentDirect {
  face: number;
  compteConnus: number;
}

/** Toutes les faces croisées encore à traiter (leur segment n'est pas déjà tracé) — inclut
 * délibérément les faces à 0 ou 1 seul point connu comme distracteurs (piège central de la spec :
 * tracer un segment dans une face qui n'a qu'un seul point connu, sans passer par la construction
 * d'un point auxiliaire). */
export function candidatsSegmentDirect(
  exercice: ExerciceSectionPlaneSolide,
  connus: ReadonlySet<number>,
  segmentsTraces: ReadonlySet<string>,
): CandidatSegmentDirect[] {
  const resultat: CandidatSegmentDirect[] = [];
  for (const face of exercice.facesCroisees) {
    const pointsDeFace = exercice.points.filter((p) => p.faces.includes(face));
    const pointsConnus = pointsDeFace.filter((p) => connus.has(p.id));
    if (pointsConnus.length === 2) {
      const [a, b] = pointsConnus;
      if (segmentsTraces.has(cleSegment(a.id, b.id))) continue;
    }
    resultat.push({ face, compteConnus: pointsConnus.length });
  }
  return resultat;
}

/** Aide 2 : révèle combien de points connus possède CHAQUE face actuellement — jamais laquelle en a
 * exactement 2 (spec, "Écran type A"). */
export function texteAideSegmentNiveau2(exercice: ExerciceSectionPlaneSolide, candidats: readonly CandidatSegmentDirect[]): string {
  const detail = candidats.map((c) => `${libelleFace(exercice, c.face)} : ${c.compteConnus} point(s) connu(s)`).join(" ; ");
  return `Nombre de points de section déjà connus par face : ${detail}.`;
}

// --- Écran B — point auxiliaire -----------------------------------------------------------------------

export const CONSIGNE_AUXILIAIRE_LIGNES =
  "Sélectionne 2 droites coplanaires (arêtes, diagonales du solide, ou segments déjà tracés de la section) dont le prolongement se croise.";
export const CONSIGNE_AUXILIAIRE_FACE = "Sélectionne la face que ce nouveau point auxiliaire permet de continuer à construire.";

export const TEXTE_AIDE_AUXILIAIRE_NIVEAU1 =
  "Rappel de la méthode : quand plus aucune face n'a directement 2 points connus, cherche 2 droites coplanaires du solide (ou déjà tracées) dont le prolongement se croise en un point auxiliaire — ce point permet de continuer la construction sur une autre face.";

export interface FaceAMoitieConnue {
  face: number;
  pointConnu: number;
  pointCible: number;
}

/** Faces croisées dont EXACTEMENT 1 des 2 points de section est déjà connu — le "plan commun"
 * révélé par l'aide 2, et l'ensemble des candidats affichés à l'écran B/étape 2. */
export function facesAMoitieConnues(exercice: ExerciceSectionPlaneSolide, connus: ReadonlySet<number>): FaceAMoitieConnue[] {
  const resultat: FaceAMoitieConnue[] = [];
  for (const face of exercice.facesCroisees) {
    const pointsDeFace = exercice.points.filter((p) => p.faces.includes(face));
    if (pointsDeFace.length !== 2) continue;
    const [a, b] = pointsDeFace;
    const aConnu = connus.has(a.id);
    const bConnu = connus.has(b.id);
    if (aConnu === bConnu) continue;
    resultat.push({ face, pointConnu: aConnu ? a.id : b.id, pointCible: aConnu ? b.id : a.id });
  }
  return resultat;
}

/** Aide 2 : révèle le(s) plan(s) commun(s) à utiliser — quelles faces sont à moitié connues —
 * jamais les 2 droites précises à l'intérieur (spec, "Écran type B"). */
export function texteAideAuxiliaireNiveau2(exercice: ExerciceSectionPlaneSolide, faces: readonly FaceAMoitieConnue[]): string {
  const liste = faces.map((f) => libelleFace(exercice, f.face)).join(", ");
  return `Le plan à utiliser pour continuer est l'une des faces suivantes : ${liste}.`;
}

export interface CandidatLigne {
  cle: string;
  label: string;
}

/** Union des droites STATIQUES du solide (arêtes/diagonales) et des segments déjà TRACÉS de la
 * section — ces derniers étiquetés dynamiquement via les lettres de point réellement attribuées. */
export function candidatsLignesAuxiliaires(connus: readonly number[], lignesStatiques: readonly CandidatLigne[], segmentsTraces: readonly string[]): CandidatLigne[] {
  const traces = segmentsTraces.map((cle) => {
    const [a, b] = cle.split("-").map(Number);
    return { cle: cleLigneSegmentTrace(a, b), label: `segment [${libellePoint(connus, a)}${libellePoint(connus, b)}]` };
  });
  return [...lignesStatiques, ...traces];
}
