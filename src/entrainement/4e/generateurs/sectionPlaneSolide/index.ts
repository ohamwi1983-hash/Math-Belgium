import type { NomSolide3D, Point3D, Solide3D } from "../../core/geometrieEspace.types";
import type { ExerciceSectionPlaneSolide, LigneCandidateExercice, PointSectionExercice, VarianteManuelSection } from "../../core/sectionPlaneSolide.types";
import { construireVarianteManuel } from "./variantesManuel";
import { distance3D, EPSILON_3D } from "../solide3D/geometrieEspace";
import { GABARITS_SOLIDE3D, GABARITS_TOUS, tirerNomGabarit } from "../solide3D/gabarits";
import { faceEstVisible } from "../../ui/solide3DSketch";
import { calculerPolygoneSection, lignesCandidatesStatiques, type PlanPoints3D, resolutionReference } from "./polygoneSection";

/**
 * Couche A — "Section plane d'un solide" (40e générateur, chapitre "Géométrie dans l'espace").
 * **Aucun tirage-puis-classification** : 3 points de départ P, Q, R sont tirés d'abord (un par
 * arête, 3 arêtes DISTINCTES du solide), le plan de coupe en est directement déduit — puis
 * l'instance est retenue ou rejetée selon 2 contraintes de génération explicites :
 * 1. Le polygone de section doit croiser AU MOINS `K_MIN=4` faces — une section triangulaire
 *    (k=3) ne nécessite jamais de point auxiliaire, ce qui viderait l'exercice de son intérêt
 *    pédagogique central (spec : "piège central à cibler... construire un point auxiliaire").
 *    La section triangulaire a sa PROPRE variante, ajoutée en fin de catalogue (audit 4e ch. 8, G9 :
 *    0 triangle sur 8 000 tirages, alors que le cours, l'atelier et le quiz en parlent).
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
  return assemblerDepuisPlan(solide, plan, K_MIN);
}

/** Instance complète depuis 3 points P, Q, R (dans cet ordre) — `null` si la section a moins de
 * `kMin` côtés, si un sommet de section colle à un sommet du solide, ou si elle n'est pas résoluble. */
function assemblerDepuisPlan(solide: Solide3D, plan: PlanPoints3D, kMin: number): ExerciceSectionPlaneSolide | null {
  const polygone = calculerPolygoneSection(solide, plan);
  if (!polygone) return null;
  if (polygone.points.length < kMin) return null;

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

// --- Variante « triangle » (audit 4e ch. 8, lot C, G9) -------------------------------------------

/** Les 3 arêtes issues d'un sommet (tous les sommets des 4 gabarits sont de degré 3). */
function aretesIssuesDe(solide: Solide3D, sommet: string): [string, string][] {
  return toutesLesAretesNommees(solide).filter(([a, b]) => a === sommet || b === sommet);
}

/** Point de l'arête issue de `sommet`, à une fraction `t` de sa longueur depuis ce sommet. */
function pointDepuisSommet(solide: Solide3D, sommet: string, arete: [string, string], t: number): Point3D {
  const a = solide.sommets[sommet];
  const b = solide.sommets[arete[0] === sommet ? arete[1] : arete[0]];
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, z: a.z + (b.z - a.z) * t };
}

/** Sommets dont les trois faces sont VISIBLES sur le dessin (décision de l'utilisateur : aucun côté du
 * triangle en pointillés). Un gabarit qui n'en a aucun (le tétraèdre) ne sert pas à la variante. */
function sommetsVisibles(solide: Solide3D): string[] {
  return Object.keys(solide.sommets).filter((n) => {
    const faces = solide.faces.filter((f) => f.includes(n));
    return faces.length === 3 && faces.every((f) => faceEstVisible(solide, f));
  });
}

const GABARITS_TRIANGLE: NomSolide3D[] = GABARITS_TOUS.filter((n) => sommetsVisibles(GABARITS_SOLIDE3D[n]).length > 0);

/** Section TRIANGULAIRE : P, Q, R sur les trois arêtes issues d'un même sommet VISIBLE (trois faces
 * visibles deux à deux adjacentes) — trois côtés tracés directement, en trait plein, aucun point
 * auxiliaire. Solide tiré parmi les gabarits qui ont un tel sommet ; t ∈ [0,25 ; 0,75] (triangle
 * lisible, jamais collé au sommet ni au bout). */
function tenterTriangle(): ExerciceSectionPlaneSolide | null {
  const nomGabarit = tirerNomGabarit(GABARITS_TRIANGLE);
  const solide = GABARITS_SOLIDE3D[nomGabarit];
  const sommets = sommetsVisibles(solide);
  const sommet = sommets[randomInt(0, sommets.length - 1)];
  const aretes = melanger(aretesIssuesDe(solide, sommet));
  if (aretes.length !== 3) return null;
  const plan = aretes.map((arete) => pointDepuisSommet(solide, sommet, arete, 0.25 + Math.random() * 0.5)) as PlanPoints3D;
  const instance = assemblerDepuisPlan(solide, plan, 3);
  return instance && instance.points.length === 3 ? instance : null;
}

export function construireTriangle(): ExerciceSectionPlaneSolide {
  for (let tentative = 0; tentative < MAX_TENTATIVES; tentative++) {
    const resultat = tenterTriangle();
    if (resultat) return resultat;
  }
  throw new Error(`construireTriangle : aucune section triangulaire trouvée après ${MAX_TENTATIVES} tentatives`);
}

export type VarianteSectionPlaneSolide = NomSolide3D | "triangle" | VarianteManuelSection;

/** Convention CLAUDE.md — catalogue `{id,label}` + `construireAvecVarianteId` : un gabarit par
 * variante (la section n'a pas de « catégorie » comparable aux autres exercices — sa variété vient
 * des points de départ tirés), puis la variante « triangle » AJOUTÉE EN FIN (audit 4e ch. 8, G9),
 * puis les trois variantes du manuel (25/11/2026, `variantesManuel.ts`), elles aussi EN FIN : les
 * indices des variantes précédentes, donc les `?code=` déjà imprimés, ne changent pas. */
export const CATALOGUE_VARIANTES: { id: VarianteSectionPlaneSolide; label: string }[] = [
  ...GABARITS_TOUS.map((id) => ({ id, label: GABARITS_SOLIDE3D[id].label })),
  { id: "triangle", label: "Section triangulaire (P, Q, R autour d'un sommet visible)" },
  { id: "faceInterieure", label: "Un point donné dans une face" },
  { id: "prolongement", label: "Points donnés sur le prolongement d'une arête" },
  { id: "parallele", label: "Plan parallèle à un plan donné passant par un point" },
];

export function construireAvecVarianteId(varianteId: VarianteSectionPlaneSolide): ExerciceSectionPlaneSolide {
  if (varianteId === "triangle") return construireTriangle();
  if (varianteId === "faceInterieure" || varianteId === "prolongement" || varianteId === "parallele") return construireVarianteManuel(varianteId);
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

/** Tirage libre de l'APPLI : la section triangulaire une fois sur six (inchangé), chacune des trois
 * variantes du manuel une fois sur neuf, sinon (une fois sur deux) le tirage libre historique. Le
 * tirage libre de l'adaptateur et des `?code=` reste `genererExerciceSectionPlaneSolide` (codes
 * libres déjà imprimés inchangés). */
export function genererExerciceSectionPlaneSolideLibre(): ExerciceSectionPlaneSolide {
  const u = Math.random();
  if (u < 1 / 6) return construireTriangle();
  if (u < 1 / 6 + 1 / 9) return construireVarianteManuel("faceInterieure");
  if (u < 1 / 6 + 2 / 9) return construireVarianteManuel("prolongement");
  if (u < 1 / 2) return construireVarianteManuel("parallele");
  return genererExerciceSectionPlaneSolide();
}
