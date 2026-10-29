import type { Point3D } from "../core/geometrieEspace.types";
import type { ExerciceSectionPlaneSolide } from "../core/sectionPlaneSolide.types";
import { intersectionDeuxDroites3D, normalePlan, normeCarree3D, points3AlignesDistincts, produitScalaire3D, soustraire3D } from "./geometrieEspace";

/**
 * Couche B — vérification "Section plane d'un solide" (40e générateur, chapitre "Géométrie dans
 * l'espace"). Logique CATÉGORIELLE pure (sélection parmi des candidats, jamais de saisie libre) —
 * aucun statut à 3 valeurs `StatutVerification` ici, aucune équivalence algébrique à tester (spec,
 * section "Vérification").
 *
 * **N'importe jamais `src/generateurs/sectionPlaneSolide/polygoneSection.ts`** (règle Couche A↔B
 * non négociable, voir Architecture/CLAUDE.md) — ce module écrit sa PROPRE logique, structurellement
 * proche par endroits de celle de la Couche A pour des raisons différentes :
 * - `facesPretesPourSegment` (écran A) ne fait QUE filtrer/grouper les champs déjà stockés sur le
 *   contrat (`point.faces`) croisés avec l'état vivant de la session (`connus`/`segmentsTraces`,
 *   propriété EXCLUSIVE de la Couche B, jamais présente sur `ExerciceSectionPlaneSolide`) — pas une
 *   duplication de géométrie, une simple dérivation Couche-B-native depuis contrat+état, exactement
 *   comme n'importe quel autre `verifierXxx` du projet dérive sa cible attendue des champs du
 *   contrat.
 * - `ciblesAuxiliaires` (écran B) a, elle, réellement besoin de RECALCULER géométriquement
 *   l'intersection des 2 droites choisies par l'élève (jamais une confiance dans un candidat
 *   précalculé) — via les primitives déjà dupliquées côté Couche B dans `geometrieEspace.ts`, même
 *   principe exact que `verifierReponseParallele`/`verifierReponseSecante` de "Position droite/plan".
 */

/** Clé stable d'un segment déjà tracé — même convention `"a-b"` (a<b) que
 * `generateurs/sectionPlaneSolide/polygoneSection.ts`, réimplémentée ici (petite fonction pure,
 * jamais importée à travers la frontière Couche A↔B). */
export function cleSegment(a: number, b: number): string {
  return a < b ? `${a}-${b}` : `${b}-${a}`;
}

/** Identifiant d'un segment de section déjà tracé, résoluble par `resoudreLigne` au même titre
 * qu'une arête/diagonale statique du solide. */
export function cleLigneSegmentTrace(a: number, b: number): string {
  return `segment:${cleSegment(a, b)}`;
}

// --- Écran A — segment direct --------------------------------------------------------------------

export interface FacePreteSegment {
  face: number;
  pointA: number;
  pointB: number;
}

/** Faces croisées ayant leurs 2 points de section déjà CONNUS (état vivant), dont le segment n'est
 * pas encore TRACÉ — chacune un candidat valide pour l'écran A. Jamais plus de 2 points connus par
 * face croisée (invariant garanti par la Couche A, voir `polygoneSection.ts`), donc jamais de
 * troisième point à départager ici. */
export function facesPretesPourSegment(
  exercice: ExerciceSectionPlaneSolide,
  connus: ReadonlySet<number>,
  segmentsTraces: ReadonlySet<string>,
): FacePreteSegment[] {
  const resultat: FacePreteSegment[] = [];
  for (const face of exercice.facesCroisees) {
    const pointsConnusDeLaFace = exercice.points.filter((p) => p.faces.includes(face) && connus.has(p.id));
    if (pointsConnusDeLaFace.length !== 2) continue;
    const [a, b] = pointsConnusDeLaFace;
    if (segmentsTraces.has(cleSegment(a.id, b.id))) continue;
    resultat.push({ face, pointA: a.id, pointB: b.id });
  }
  return resultat;
}

/** Écran A : la face choisie doit réellement figurer parmi les faces prêtes — jamais une face à 0
 * ou 1 seul point connu (piège central de la spec), jamais une face déjà tracée. */
export function verifierSegmentDirect(
  exercice: ExerciceSectionPlaneSolide,
  connus: ReadonlySet<number>,
  segmentsTraces: ReadonlySet<string>,
  faceChoisie: number,
): boolean {
  return facesPretesPourSegment(exercice, connus, segmentsTraces).some((f) => f.face === faceChoisie);
}

// --- Écran B — point auxiliaire --------------------------------------------------------------------

/** Résout un identifiant de droite candidate (statique — arête/diagonale — ou segment déjà tracé de
 * la section) vers ses 2 points 3D réels. `null` si l'identifiant ne correspond à rien de connu —
 * jamais une exception, un identifiant invalide est simplement une réponse à rejeter comme une
 * autre. */
export function resoudreLigne(
  exercice: ExerciceSectionPlaneSolide,
  identifiant: string,
): [Point3D, Point3D] | null {
  const statique = exercice.lignesStatiques.find((l) => l.cle === identifiant);
  if (statique) return statique.points;

  if (identifiant.startsWith("segment:")) {
    const [a, b] = identifiant.slice("segment:".length).split("-").map(Number);
    const pointA = exercice.points.find((p) => p.id === a);
    const pointB = exercice.points.find((p) => p.id === b);
    if (pointA && pointB) return [pointA.position, pointB.position];
  }

  return null;
}

export interface CibleAuxiliaire {
  face: number;
  pointConnu: number;
  pointCible: number;
}

/** Pour une paire de droites données (déjà résolues en coordonnées 3D), les faces à moitié connues
 * (exactement 1 des 2 points de la face déjà connu) que cette paire permet de débloquer — le point
 * auxiliaire I (intersection des 2 droites) doit tomber sur la MÊME droite que le point déjà connu Y
 * et le point cible X, jamais une simple coïncidence de plan, ET être DISTINCT de Y
 * (`points3AlignesDistincts(Y,I,X)`, audit chapitre 8, point 17) : un I confondu avec Y — ex. le
 * segment [PQ] avec l'arête qui porte P, qui se coupent en P — ne construit rien. `[]` si les 2
 * droites sont parallèles/non coplanaires (`intersectionDeuxDroites3D` retourne `null`) ou si
 * aucune face à moitié connue n'est concernée. */
export function ciblesAuxiliaires(
  exercice: ExerciceSectionPlaneSolide,
  connus: ReadonlySet<number>,
  ligne1: [Point3D, Point3D],
  ligne2: [Point3D, Point3D],
): CibleAuxiliaire[] {
  const intersection = intersectionDeuxDroites3D(ligne1, ligne2);
  if (!intersection) return [];

  const resultat: CibleAuxiliaire[] = [];
  for (const face of exercice.facesCroisees) {
    const pointsDeFace = exercice.points.filter((p) => p.faces.includes(face));
    if (pointsDeFace.length !== 2) continue; // ne devrait jamais arriver (invariant Couche A)
    const [a, b] = pointsDeFace;
    const aConnu = connus.has(a.id);
    const bConnu = connus.has(b.id);
    if (aConnu === bConnu) continue; // face totalement connue ou totalement inconnue : jamais une cible
    const connu = aConnu ? a : b;
    const cible = aConnu ? b : a;
    if (points3AlignesDistincts(connu.position, intersection, cible.position)) {
      resultat.push({ face, pointConnu: connu.id, pointCible: cible.id });
    }
  }
  return resultat;
}

/** Écran B, étape 1 : les 2 droites choisies doivent être DISTINCTES et débloquer réellement au
 * moins une face (leur intersection, une fois calculée, doit être colinéaire avec un point déjà
 * connu et le point cible d'au moins une face à moitié connue). */
export function verifierLignesAuxiliaires(
  exercice: ExerciceSectionPlaneSolide,
  connus: ReadonlySet<number>,
  identifiantLigne1: string,
  identifiantLigne2: string,
): boolean {
  if (identifiantLigne1 === identifiantLigne2) return false;
  const ligne1 = resoudreLigne(exercice, identifiantLigne1);
  const ligne2 = resoudreLigne(exercice, identifiantLigne2);
  if (!ligne1 || !ligne2) return false;
  return ciblesAuxiliaires(exercice, connus, ligne1, ligne2).length > 0;
}

/** Écran B, étape 2 : la face choisie doit réellement être débloquée par la paire de droites déjà
 * validée à l'étape 1. */
export function verifierFaceAuxiliaire(
  exercice: ExerciceSectionPlaneSolide,
  connus: ReadonlySet<number>,
  identifiantLigne1: string,
  identifiantLigne2: string,
  faceChoisie: number,
): boolean {
  const ligne1 = resoudreLigne(exercice, identifiantLigne1);
  const ligne2 = resoudreLigne(exercice, identifiantLigne2);
  if (!ligne1 || !ligne2) return false;
  return ciblesAuxiliaires(exercice, connus, ligne1, ligne2).some((c) => c.face === faceChoisie);
}

/** Point de section réellement débloqué par cette paire de droites pour cette face — `null` si la
 * combinaison n'est en réalité pas valide (ne devrait jamais être appelée hors de ce cas par la
 * Couche B, qui vérifie toujours `verifierFaceAuxiliaire` avant). Séparée de la vérification pure
 * pour que l'appelant (session) puisse mettre à jour l'état sans redupliquer ce calcul. */
export function pointDebloqueParFaceAuxiliaire(
  exercice: ExerciceSectionPlaneSolide,
  connus: ReadonlySet<number>,
  identifiantLigne1: string,
  identifiantLigne2: string,
  faceChoisie: number,
): number | null {
  const ligne1 = resoudreLigne(exercice, identifiantLigne1);
  const ligne2 = resoudreLigne(exercice, identifiantLigne2);
  if (!ligne1 || !ligne2) return null;
  const cible = ciblesAuxiliaires(exercice, connus, ligne1, ligne2).find((c) => c.face === faceChoisie);
  return cible ? cible.pointCible : null;
}

/** Point auxiliaire I de 2 droites (identifiants), `null` si elles ne se coupent pas. */
export function pointAuxiliaireDesLignes(exercice: ExerciceSectionPlaneSolide, identifiantLigne1: string, identifiantLigne2: string): Point3D | null {
  const ligne1 = resoudreLigne(exercice, identifiantLigne1);
  const ligne2 = resoudreLigne(exercice, identifiantLigne2);
  if (!ligne1 || !ligne2) return null;
  return intersectionDeuxDroites3D(ligne1, ligne2);
}

/** Faces du solide dont le PLAN contient la droite (identifiant) — une arête est dans 2 faces, une
 * diagonale ou un segment de section dans 1. Sert aux aides (« ces 2 droites sont dans la face… »). */
export function facesContenantLigne(exercice: ExerciceSectionPlaneSolide, identifiant: string): number[] {
  const ligne = resoudreLigne(exercice, identifiant);
  if (!ligne) return [];
  const { solide } = exercice;
  const resultat: number[] = [];
  solide.faces.forEach((face, index) => {
    const [a, b, c] = face.map((nom) => solide.sommets[nom]);
    const normale = normalePlan(a, b, c);
    const n = Math.sqrt(normeCarree3D(normale));
    if (ligne.every((p) => Math.abs(produitScalaire3D(normale, soustraire3D(p, a))) / n < 1e-6)) resultat.push(index);
  });
  return resultat;
}

/** Toutes les paires de droites (statiques + segments déjà tracés) qui débloquent une face, avec
 * leur point auxiliaire — classées de la plus « lisible » à la moins lisible : 2 droites d'une même
 * face du solide (méthode du cours) d'abord, puis le point auxiliaire le plus proche du centre du
 * solide (donc visible sur le croquis). Sert à la réponse révélée et à l'aide 2. */
export function pairesLignesValides(
  exercice: ExerciceSectionPlaneSolide,
  connus: ReadonlySet<number>,
  segmentsTraces: ReadonlySet<string>,
): { ligne1: string; ligne2: string; pointAuxiliaire: Point3D; faceCommune: number | null }[] {
  const candidats = [...exercice.lignesStatiques.map((l) => l.cle), ...[...segmentsTraces].map((s) => `segment:${s}`)];
  const sommets = Object.values(exercice.solide.sommets);
  const centre = {
    x: sommets.reduce((s, p) => s + p.x, 0) / sommets.length,
    y: sommets.reduce((s, p) => s + p.y, 0) / sommets.length,
    z: sommets.reduce((s, p) => s + p.z, 0) / sommets.length,
  };
  const paires: { ligne1: string; ligne2: string; pointAuxiliaire: Point3D; faceCommune: number | null; rang: number }[] = [];
  for (let i = 0; i < candidats.length; i++) {
    for (let j = i + 1; j < candidats.length; j++) {
      if (!verifierLignesAuxiliaires(exercice, connus, candidats[i], candidats[j])) continue;
      const pointAuxiliaire = pointAuxiliaireDesLignes(exercice, candidats[i], candidats[j])!;
      const faces1 = facesContenantLigne(exercice, candidats[i]);
      const faceCommune = facesContenantLigne(exercice, candidats[j]).find((f) => faces1.includes(f)) ?? null;
      const rang = (faceCommune === null ? 1000 : 0) + Math.sqrt(normeCarree3D(soustraire3D(pointAuxiliaire, centre)));
      paires.push({ ligne1: candidats[i], ligne2: candidats[j], pointAuxiliaire, faceCommune, rang });
    }
  }
  return paires.sort((a, b) => a.rang - b.rang).map(({ rang: _rang, ...p }) => p);
}

// --- Condition d'arrêt ------------------------------------------------------------------------------

/** Le polygone de section est fermé dès que tous ses `k` segments (un par face croisée) sont tracés
 * — condition nécessaire ET suffisante, un segment ne pouvant être ajouté à `segmentsTraces` que via
 * `facesPretesPourSegment`, dont chaque résultat correspond toujours à une arête RÉELLE du polygone
 * cyclique (jamais un segment parasite). */
export function polygoneFerme(exercice: ExerciceSectionPlaneSolide, segmentsTraces: ReadonlySet<string>): boolean {
  return segmentsTraces.size >= exercice.points.length;
}
