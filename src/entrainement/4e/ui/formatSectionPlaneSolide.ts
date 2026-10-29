import type { SegmentExtraSolide3D, PointExtraSolide3D } from "../components/Solide3DSketch";
import type { Point3D } from "../core/geometrieEspace.types";
import type { ExerciceSectionPlaneSolide } from "../core/sectionPlaneSolide.types";
import type { EntreeRecapitulatif } from "./recapitulatif";
import { faceEstVisible } from "./solide3DSketch";
import {
  cleLigneSegmentTrace,
  cleSegment,
  facesContenantLigne,
  facesPretesPourSegment,
  pairesLignesValides,
  pointAuxiliaireDesLignes,
  resoudreLigne,
} from "../moteur/verificationSectionPlaneSolide";
import { distance3D } from "../moteur/geometrieEspace";

/**
 * Présentation — "Section plane d'un solide" (40e générateur, chapitre "Géométrie dans l'espace").
 * Terminologie interdite dans tout texte affiché à l'élève : "déterminant", "produit scalaire" (même
 * règle que "Position droite/plan").
 *
 * Aucune saisie libre nulle part (sélection uniquement, spec section "Vérification") — jamais de
 * `StatutVerification`/`formatMessageErreur` avec un statut particulier ici, le message générique
 * "Incorrect — tentative N/M" suffit partout, comme "Position droite/plan".
 */

// --- Étiquetage des points/faces/droites ---------------------------------------------------------------

/** P, Q, R sont toujours les 3 premiers (`connus[0..2]`, ordre fixé par `idsDepart`) ; chaque point
 * auxiliaire découvert ensuite reçoit la lettre suivante, dans l'ordre RÉEL de découverte (l'ordre
 * d'insertion de `connus`, jamais un ordre recalculé indépendamment). La lettre I est réservée au
 * point AUXILIAIRE de construction, jamais à un sommet de la section. */
const LETTRES_POINTS = ["P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];

export function libellePoint(connus: readonly number[], id: number): string {
  const index = connus.indexOf(id);
  if (index < 0 || index >= LETTRES_POINTS.length) return `#${id}`;
  return LETTRES_POINTS[index];
}

/** Nom d'un segment de section, lettres dans l'ordre de découverte (« [PQ] », jamais « [QP] »). */
export function nomSegment(connus: readonly number[], a: number, b: number): string {
  const [x, y] = connus.indexOf(a) <= connus.indexOf(b) ? [a, b] : [b, a];
  return `[${libellePoint(connus, x)}${libellePoint(connus, y)}]`;
}

/** Lettre que recevra le PROCHAIN point de section découvert. */
export function lettreProchainPoint(connus: readonly number[]): string {
  return LETTRES_POINTS[connus.length] ?? `#${connus.length}`;
}

/** Libellé d'une face du solide — ses sommets nommés concaténés entre parenthèses, ex. "(ABFE)" —
 * jamais un numéro d'index brut montré à l'élève. */
export function libelleFace(exercice: ExerciceSectionPlaneSolide, face: number): string {
  return `(${exercice.solide.faces[face].join("")})`;
}

/** Arête du solide portant un point de section, ex. "[AB]". */
function libelleArete(exercice: ExerciceSectionPlaneSolide, id: number): string {
  const point = exercice.points.find((p) => p.id === id);
  return point ? `[${point.arete[0]}${point.arete[1]}]` : "";
}

/** Libellé d'une droite candidate (arête, diagonale ou segment déjà tracé), ex. "arête [BF]". */
export function libelleLigne(exercice: ExerciceSectionPlaneSolide, connus: readonly number[], cle: string): string {
  const statique = exercice.lignesStatiques.find((l) => l.cle === cle);
  if (statique) return statique.label;
  if (cle.startsWith("segment:")) {
    const [a, b] = cle.slice("segment:".length).split("-").map(Number);
    return `segment ${nomSegment(connus, a, b)}`;
  }
  return cle;
}

const NOMS_POLYGONE: Record<number, string> = { 3: "triangle", 4: "quadrilatère", 5: "pentagone", 6: "hexagone" };

export function nomPolygoneSection(k: number): string {
  return NOMS_POLYGONE[k] ?? `polygone à ${k} côtés`;
}

/** Face (index) commune aux 2 points de section d'un segment — celle où le segment est tracé. */
function faceDuSegment(exercice: ExerciceSectionPlaneSolide, a: number, b: number): number | null {
  const pa = exercice.points.find((p) => p.id === a);
  const pb = exercice.points.find((p) => p.id === b);
  if (!pa || !pb) return null;
  return pa.faces.find((f) => pb.faces.includes(f)) ?? null;
}

/** Face où se trouve un segment de section déjà tracé (clé "a-b"). */
export function faceDuSegmentTrace(exercice: ExerciceSectionPlaneSolide, cle: string): number | null {
  const [a, b] = cle.split("-").map(Number);
  return faceDuSegment(exercice, a, b);
}

// --- Rendu du croquis --------------------------------------------------------------------------------

const COULEUR_CONNU = "#1971c2";
const COULEUR_SELECTION = "#f08c00";
export const COULEUR_CONSTRUCTION = "#7048e8";

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

/** Le segment de section est-il sur une face CACHÉE du croquis (convention de la perspective
 * cavalière : trait pointillé, comme les arêtes cachées — audit chapitre 8, point 26) ? */
export function segmentSurFaceCachee(exercice: ExerciceSectionPlaneSolide, a: number, b: number): boolean {
  if (exercice.solide.toutesAretesVisibles) return false;
  const face = faceDuSegment(exercice, a, b);
  return face !== null && !faceEstVisible(exercice.solide, exercice.solide.faces[face]);
}

/** Segments de la section déjà tracés, prêts à être passés en `segmentsExtra` — pointillés quand ils
 * sont sur une face cachée. */
export function segmentsExtraTraces(exercice: ExerciceSectionPlaneSolide, segmentsTraces: readonly string[]): SegmentExtraSolide3D[] {
  return segmentsTraces.map((cle) => {
    const [a, b] = cle.split("-").map(Number);
    const pointA = exercice.points.find((p) => p.id === a);
    const pointB = exercice.points.find((p) => p.id === b);
    if (!pointA || !pointB) throw new Error(`segmentsExtraTraces : segment invalide (cle=${cle})`);
    return { a: pointA.position, b: pointB.position, couleur: COULEUR_CONNU, pointille: segmentSurFaceCachee(exercice, a, b) };
  });
}

/** Aperçu (pointillé orange) du segment que désignerait la face actuellement sélectionnée à
 * l'écran A — seulement ce que l'élève a lui-même choisi, quel que soit son statut de correction.
 * `null` si les 2 points de cette face ne sont pas tous les deux déjà connus. */
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

/** Aperçu (pointillé orange) des droites actuellement sélectionnées à l'écran B, étape 1 — arêtes,
 * diagonales et segments dessinés tels quels (une diagonale n'est pas une arête du croquis : son
 * tracé est la seule façon de la voir, audit chapitre 8, point 27). */
export function apercuLignesChoisies(exercice: ExerciceSectionPlaneSolide, cles: readonly string[]): SegmentExtraSolide3D[] {
  return cles.flatMap((cle) => {
    const ligne = resoudreLigne(exercice, cle);
    return ligne ? [{ a: ligne[0], b: ligne[1], couleur: COULEUR_SELECTION, pointille: true }] : [];
  });
}

/** L'extrémité de [a,b] la plus éloignée de `point` — prolonger [a,b] jusqu'à `point` revient à
 * tracer le segment (extrémité éloignée, point), qui contient [a,b]. */
function extremiteEloignee(a: Point3D, b: Point3D, point: Point3D): Point3D {
  return distance3D(a, point) >= distance3D(b, point) ? a : b;
}

/** Construction du point auxiliaire I (audit chapitre 8, points 6 et 21) : les 2 droites
 * PROLONGÉES jusqu'à I, et I lui-même. Avec `construction` (écran "face" validé), ajoute la droite
 * qui relie I au point déjà connu jusqu'au nouveau point de section, et ce nouveau point. */
export function elementsConstructionAuxiliaire(
  exercice: ExerciceSectionPlaneSolide,
  connus: readonly number[],
  ligne1: string,
  ligne2: string,
  construction?: { pointConnu: number; pointCible: number } | null,
): { segments: SegmentExtraSolide3D[]; points: PointExtraSolide3D[] } {
  const I = pointAuxiliaireDesLignes(exercice, ligne1, ligne2);
  if (!I) return { segments: [], points: [] };
  const segments: SegmentExtraSolide3D[] = [ligne1, ligne2].flatMap((cle) => {
    const ligne = resoudreLigne(exercice, cle);
    return ligne ? [{ a: extremiteEloignee(ligne[0], ligne[1], I), b: I, couleur: COULEUR_CONSTRUCTION, pointille: true }] : [];
  });
  const points: PointExtraSolide3D[] = [{ position: I, label: "I", couleur: COULEUR_CONSTRUCTION }];
  if (construction) {
    const connu = exercice.points.find((p) => p.id === construction.pointConnu);
    const cible = exercice.points.find((p) => p.id === construction.pointCible);
    if (connu && cible) {
      segments.push({ a: I, b: extremiteEloignee(connu.position, cible.position, I), couleur: COULEUR_CONSTRUCTION });
      points.push({ position: cible.position, label: lettreProchainPoint(connus), couleur: COULEUR_CONSTRUCTION });
    }
  }
  return { segments, points };
}

// --- Indicateur de progression (nombre d'écrans non connu à l'avance, voir typesSectionPlaneSolide.ts) --

/** Compteurs SANS total (audit chapitre 8, point 24) : « 3/5 » donnait d'entrée le nombre de
 * côtés de la section. */
export function texteProgression(connus: readonly number[], segmentsTraces: readonly string[]): string {
  return `Points de section trouvés : ${connus.length} — Segments tracés : ${segmentsTraces.length}`;
}

/** Récapitulatif « Ce qu'on sait déjà » — points de section connus (avec leur arête) et segments
 * déjà tracés, toujours l'état confirmé (jamais la saisie de l'élève). */
export function calculerRecapitulatifSectionPlaneSolide(
  exercice: ExerciceSectionPlaneSolide,
  connus: readonly number[],
  segmentsTraces: readonly string[],
): EntreeRecapitulatif[] {
  const points = connus.map((id) => `${libellePoint(connus, id)} sur ${libelleArete(exercice, id)}`).join(", ");
  const segments = segmentsTraces
    .map((cle) => {
      const [a, b] = cle.split("-").map(Number);
      return nomSegment(connus, a, b);
    })
    .join(", ");
  return [
    { libelle: "Points de section", valeur: points, estLatex: false, revele: false },
    { libelle: "Segments tracés", valeur: segments || "aucun pour l'instant", estLatex: false, revele: false },
  ];
}

// --- Écran A — segment direct ------------------------------------------------------------------------

export const CONSIGNE_SEGMENT_DIRECT = "Sélectionne une face dont les 2 points de section sont déjà connus, pour y tracer le segment de coupe.";

export const TEXTE_AIDE_SEGMENT_NIVEAU1 =
  "Rappel de la méthode : dès qu'une face possède 2 points de section déjà connus, le segment qui les relie peut être tracé directement.";

/** Faces proposées à l'écran A : TOUTES les faces du solide (audit chapitre 8, point 24 — ne
 * proposer que les faces traversées révélait lesquelles le plan coupe), sauf celles dont le segment
 * est déjà tracé. Les faces à 0 ou 1 point connu, ou que le plan ne traverse pas, sont des
 * distracteurs délibérés (tracer un segment dans une face pas encore assez connue). */
export function candidatsFaces(exercice: ExerciceSectionPlaneSolide, segmentsTraces: ReadonlySet<string>): number[] {
  return exercice.solide.faces
    .map((_, index) => index)
    .filter((face) => {
      const pointsDeFace = exercice.points.filter((p) => p.faces.includes(face));
      if (pointsDeFace.length !== 2) return true;
      return !segmentsTraces.has(cleSegment(pointsDeFace[0].id, pointsDeFace[1].id));
    });
}

/** Aide 2 : rappelle sur quelle arête se trouve chaque point déjà connu — jamais le décompte par
 * face (qui désignait directement la réponse, audit chapitre 8, point 20) : l'élève doit encore
 * trouver lui-même la face qui possède 2 de ces arêtes. */
export function texteAideSegmentNiveau2(exercice: ExerciceSectionPlaneSolide, connus: readonly number[]): string {
  const detail = connus.map((id) => `${libellePoint(connus, id)} est sur l'arête ${libelleArete(exercice, id)}`).join(", ");
  return `${detail}. Une face convient si 2 de ces points sont sur ses arêtes.`;
}

/** Réponse révélée de l'écran A — la face confirmée et le segment tracé. */
export function texteReponseSegmentDirect(exercice: ExerciceSectionPlaneSolide, connus: readonly number[], face: number): string {
  const pret = facesPretesPourSegment(exercice, new Set(connus), new Set()).find((f) => f.face === face);
  const segment = pret ? ` : on y trace le segment ${nomSegment(connus, pret.pointA, pret.pointB)}` : "";
  return `Face ${libelleFace(exercice, face)}${segment}.`;
}

// --- Écran B — point auxiliaire -----------------------------------------------------------------------

export const CONSIGNE_AUXILIAIRE_LIGNES =
  "Plus aucune face n'a 2 points de section connus : construis un point auxiliaire I. Sélectionne 2 droites coplanaires (arêtes, diagonales ou segments déjà tracés) dont les prolongements se coupent.";
export const CONSIGNE_AUXILIAIRE_FACE =
  "Les 2 droites prolongées se coupent au point auxiliaire I. Sélectionne la face dans laquelle I permet de trouver un nouveau point de section.";

/** Aide 1 de l'écran "droites" — le CRITÈRE qui rend la construction valable (audit chapitre 8,
 * point 22), pas seulement « 2 droites qui se croisent ». */
export const TEXTE_AIDE_AUXILIAIRE_NIVEAU1 =
  "Méthode : I doit être à la fois dans le plan de coupe et dans le plan d'une face où un seul point de section est connu. Prends une droite du plan de coupe (un segment déjà tracé de la section) et une droite du plan de cette face (une de ses arêtes), toutes deux dans une même face du solide : prolongées, elles se coupent en I.";

/** Aide 2 de l'écran "droites" — la face qui contient les 2 droites de la construction la plus
 * lisible, jamais les 2 droites elles-mêmes. */
export function texteAideLignesNiveau2(exercice: ExerciceSectionPlaneSolide, connus: readonly number[], segmentsTraces: readonly string[]): string {
  const meilleure = pairesLignesValides(exercice, new Set(connus), new Set(segmentsTraces))[0];
  if (!meilleure) return "";
  if (meilleure.faceCommune !== null) return `Les 2 droites à prolonger sont toutes deux dans la face ${libelleFace(exercice, meilleure.faceCommune)}.`;
  const segment = [meilleure.ligne1, meilleure.ligne2].find((c) => c.startsWith("segment:"));
  return segment ? `L'une des 2 droites est le ${libelleLigne(exercice, connus, segment)}.` : "";
}

export const TEXTE_AIDE_FACE_NIVEAU1 =
  "I est dans le plan de coupe, et dans le plan de chaque face qui contient l'une des 2 droites. Parmi ces faces, cherche celle où un seul point de section est connu : la droite qui relie I à ce point coupe une arête de la face au point manquant.";

/** Aide 2 de l'écran "face" — les faces qui contiennent chacune des 2 droites choisies. */
export function texteAideFaceNiveau2(exercice: ExerciceSectionPlaneSolide, connus: readonly number[], lignes: readonly [string, string]): string {
  return (
    lignes
      .map((cle) => {
        const faces = facesContenantLigne(exercice, cle).map((f) => libelleFace(exercice, f));
        return `${libelleLigne(exercice, connus, cle)} : ${faces.length > 1 ? "faces" : "face"} ${faces.join(" et ")}`;
      })
      .join(" ; ") + "."
  );
}

export interface CandidatLigne {
  cle: string;
  label: string;
}

export interface GroupeLignes {
  titre: string;
  lignes: CandidatLigne[];
}

/** Droites proposées à l'écran "droites", RANGÉES en 3 groupes (audit chapitre 8, point 27 — une
 * liste à plat de 25 à 28 boutons) : segments déjà tracés de la section, arêtes, diagonales. */
export function groupesLignesAuxiliaires(exercice: ExerciceSectionPlaneSolide, connus: readonly number[], segmentsTraces: readonly string[]): GroupeLignes[] {
  const traces = segmentsTraces.map((cle) => {
    const [a, b] = cle.split("-").map(Number);
    const cleLigne = cleLigneSegmentTrace(a, b);
    return { cle: cleLigne, label: libelleLigne(exercice, connus, cleLigne) };
  });
  const aretes = exercice.lignesStatiques.filter((l) => l.cle.startsWith("arete:")).map((l) => ({ cle: l.cle, label: l.label }));
  const diagonales = exercice.lignesStatiques.filter((l) => l.cle.startsWith("diagonale:")).map((l) => ({ cle: l.cle, label: l.label }));
  return [
    { titre: "Segments déjà tracés (plan de coupe)", lignes: traces },
    { titre: "Arêtes du solide", lignes: aretes },
    { titre: "Diagonales de face", lignes: diagonales },
  ].filter((g) => g.lignes.length > 0);
}

/** Réponse révélée de l'écran "droites". */
export function texteReponseLignes(exercice: ExerciceSectionPlaneSolide, connus: readonly number[], lignes: readonly [string, string]): string {
  const [l1, l2] = lignes.map((c) => libelleLigne(exercice, connus, c));
  return `${l1.charAt(0).toUpperCase()}${l1.slice(1)} et ${l2} : prolongées, elles se coupent au point auxiliaire I.`;
}

/** Réponse révélée de l'écran "face" (et texte de la construction confirmée). */
export function texteReponseFace(
  exercice: ExerciceSectionPlaneSolide,
  connus: readonly number[],
  construction: { face: number; pointConnu: number; pointCible: number },
): string {
  const nouveau = lettreProchainPoint(connus);
  return `Face ${libelleFace(exercice, construction.face)} : la droite (I${libellePoint(connus, construction.pointConnu)}) coupe l'arête ${libelleArete(exercice, construction.pointCible)} en ${nouveau}.`;
}

// --- Conclusion ----------------------------------------------------------------------------------------

/** Nom du polygone fermé, lettres dans l'ordre du parcours depuis P (ex. "pentagone PQSTR"). */
export function texteConclusion(exercice: ExerciceSectionPlaneSolide, connus: readonly number[], segmentAutomatique: string | null): string[] {
  const { ordreCyclique, idsDepart } = exercice;
  const indexP = ordreCyclique.indexOf(idsDepart[0]);
  const ordre = [...ordreCyclique.slice(indexP), ...ordreCyclique.slice(0, indexP)];
  const lignes = [`Le polygone de section est fermé : c'est le ${nomPolygoneSection(ordre.length)} ${ordre.map((id) => libellePoint(connus, id)).join("")}.`];
  if (segmentAutomatique) {
    const [a, b] = segmentAutomatique.split("-").map(Number);
    lignes.unshift(`Ses 2 points étant connus, le dernier segment ${nomSegment(connus, a, b)} se trace directement et referme la section.`);
  }
  return lignes;
}
