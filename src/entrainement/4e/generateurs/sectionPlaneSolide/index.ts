import type { NomSolide3D, Point3D, Solide3D } from "../../core/geometrieEspace.types";
import type { ExerciceSectionPlaneSolide, LigneCandidateExercice, PointSectionExercice } from "../../core/sectionPlaneSolide.types";
import { distance3D, EPSILON_3D } from "../solide3D/geometrieEspace";
import { GABARITS_SOLIDE3D, GABARITS_TOUS, tirerNomGabarit } from "../solide3D/gabarits";
import { calculerPolygoneSection, lignesCandidatesStatiques, type PlanPoints3D, resolutionReference } from "./polygoneSection";

/**
 * Couche A — "Section plane d'un solide" (40e générateur, chapitre "Géométrie dans l'espace").
 * **Aucun tirage-puis-classification** : 3 points de départ P, Q, R sont tirés d'abord (un par
 * arête, 3 arêtes DISTINCTES du solide), le plan de coupe en est directement déduit — puis
 * l'instance est retenue ou rejetée selon 2 contraintes de génération explicites :
 * 1. Le polygone de section doit croiser AU MOINS `K_MIN=4` faces — une section triangulaire
 *    (k=3) ne nécessite jamais de point auxiliaire, ce qui viderait l'exercice de son intérêt
 *    pédagogique central (spec : "piège central à cibler... construire un point auxiliaire").
 * 2. `resolutionReference` doit confirmer que l'instance est réellement résoluble en un nombre
 *    borné d'itérations depuis {P,Q,R} — voir `polygoneSection.ts` pour la garantie de
 *    terminaison complète. Depuis l'audit du chapitre 8 (points 17-18), seules les constructions
 *    auxiliaires NON creuses comptent : environ 6,5 % des pavés/cubes, qui ne se résolvaient que
 *    grâce à un point auxiliaire confondu avec un point connu, sont désormais rejetés ici.
 * 3. Aucun sommet de la section à moins de 10 % d'une extrémité de son arête (point 25).
 */

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function melanger<T>(liste: T[]): T[] {
  const copie = [...liste];
  for (let i = copie.length - 1; i > 0; i--) {
    const j = randomInt(0, i);
    [copie[i], copie[j]] = [copie[j], copie[i]];
  }
  return copie;
}

/** Toutes les arêtes DISTINCTES du solide (dédupliquées), dérivées de `solide.faces` — jamais
 * saisies à la main. */
function toutesLesAretesNommees(solide: Solide3D): [string, string][] {
  const vues = new Set<string>();
  const aretes: [string, string][] = [];
  for (const face of solide.faces) {
    for (let i = 0; i < face.length; i++) {
      const a = face[i];
      const b = face[(i + 1) % face.length];
      const cle = a < b ? `${a}|${b}` : `${b}|${a}`;
      if (vues.has(cle)) continue;
      vues.add(cle);
      aretes.push(a < b ? [a, b] : [b, a]);
    }
  }
  return aretes;
}

/** Point aléatoire STRICTEMENT intérieur d'une arête — jamais collé à une extrémité (`t` borné à
 * `[0,15 ; 0,85]`), pour que P/Q/R restent visuellement clairement DISTINCTS des sommets du solide. */
function tirerPointSurArete(solide: Solide3D, arete: [string, string]): Point3D {
  const t = 0.15 + Math.random() * 0.7;
  const a = solide.sommets[arete[0]];
  const b = solide.sommets[arete[1]];
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, z: a.z + (b.z - a.z) * t };
}

/** Dérive le libellé affiché ("arête [AB]" / "diagonale [AC]") depuis la clé stable produite par
 * `lignesCandidatesStatiques` — jamais un second champ redondant côté `polygoneSection.ts`, qui
 * ne connaît rien de la présentation. */
function libelleDepuisCle(cle: string): string {
  const [prefixe, sommets] = cle.split(":");
  const mot = prefixe === "arete" ? "arête" : "diagonale";
  return `${mot} [${sommets}]`;
}

function lignesStatiquesAvecLabel(solide: Solide3D): LigneCandidateExercice[] {
  return lignesCandidatesStatiques(solide).map((ligne) => ({ ...ligne, label: libelleDepuisCle(ligne.cle) }));
}

const K_MIN = 4;

/** Aucun sommet de la section collé à un sommet du solide (audit chapitre 8, point 25) : sinon
 * polygone en « lame » et étiquettes superposées aux sommets. Même marge que P, Q, R. */
const T_MIN_SUR_ARETE = 0.1;

function positionRelativeSurArete(solide: Solide3D, arete: [string, string], point: Point3D): number {
  const a = solide.sommets[arete[0]];
  const b = solide.sommets[arete[1]];
  return distance3D(a, point) / distance3D(a, b);
}

function tenterGenererPourGabarit(nomGabarit: NomSolide3D): ExerciceSectionPlaneSolide | null {
  const solide = GABARITS_SOLIDE3D[nomGabarit];
  const aretes = melanger(toutesLesAretesNommees(solide));
  if (aretes.length < 3) return null; // ne devrait jamais arriver (les 4 gabarits ont ≥6 arêtes)

  const plan: PlanPoints3D = [
    tirerPointSurArete(solide, aretes[0]),
    tirerPointSurArete(solide, aretes[1]),
    tirerPointSurArete(solide, aretes[2]),
  ];

  const polygone = calculerPolygoneSection(solide, plan);
  if (!polygone) return null;
  if (polygone.points.length < K_MIN) return null;

  // P, Q, R sont, par construction, 3 des sommets du polygone (chaque point de `plan` appartient
  // trivialement au plan qu'il définit) — retrouvés par coïncidence EXACTE de position, jamais par
  // une ré-identification approximative.
  const idsDepart = plan.map((p) => polygone.points.find((sp) => distance3D(sp.position, p) < EPSILON_3D)?.id);
  if (idsDepart.some((id) => id === undefined)) return null; // garde défensive, ne devrait jamais arriver
  const [idP, idQ, idR] = idsDepart as [number, number, number];

  if (polygone.points.some((p) => {
    const t = positionRelativeSurArete(solide, p.arete, p.position);
    return t < T_MIN_SUR_ARETE || t > 1 - T_MIN_SUR_ARETE;
  })) return null;

  const resolution = resolutionReference(solide, polygone, [idP, idQ, idR]);
  if (!resolution) return null;

  const points: PointSectionExercice[] = polygone.points.map((p) => ({
    id: p.id,
    position: p.position,
    arete: p.arete,
    faces: p.faces,
    labelDepart: p.id === idP ? "P" : p.id === idQ ? "Q" : p.id === idR ? "R" : null,
  }));

  return {
    solide,
    plan,
    points,
    ordreCyclique: polygone.ordreCyclique,
    facesCroisees: polygone.facesCroisees,
    idsDepart: [idP, idQ, idR],
    lignesStatiques: lignesStatiquesAvecLabel(solide),
    resolutionReference: resolution,
  };
}

const MAX_TENTATIVES = 2000;

/** Convention CLAUDE.md — catalogue `{id,label}` + `construireAvecVarianteId` : le seul axe
 * discret pertinent pour ce générateur est le GABARIT lui-même (la section elle-même n'a pas de
 * "catégorie" comparable aux autres exercices — sa variété vient uniquement des points de départ
 * tirés). */
export const CATALOGUE_VARIANTES: { id: NomSolide3D; label: string }[] = GABARITS_TOUS.map((id) => ({
  id,
  label: GABARITS_SOLIDE3D[id].label,
}));

export function construireAvecVarianteId(varianteId: NomSolide3D): ExerciceSectionPlaneSolide {
  for (let tentative = 0; tentative < MAX_TENTATIVES; tentative++) {
    const resultat = tenterGenererPourGabarit(varianteId);
    if (resultat) return resultat;
  }
  throw new Error(`construireAvecVarianteId : aucune instance résoluble trouvée pour "${varianteId}" après ${MAX_TENTATIVES} tentatives`);
}

export function genererExerciceSectionPlaneSolide(): ExerciceSectionPlaneSolide {
  for (let tentative = 0; tentative < MAX_TENTATIVES; tentative++) {
    const nomGabarit = tirerNomGabarit(GABARITS_TOUS);
    const resultat = tenterGenererPourGabarit(nomGabarit);
    if (resultat) return resultat;
  }
  throw new Error(`genererExerciceSectionPlaneSolide : aucune instance résoluble trouvée après ${MAX_TENTATIVES} tentatives`);
}
