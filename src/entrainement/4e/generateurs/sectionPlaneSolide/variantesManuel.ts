import type { NomSolide3D, Point3D, Solide3D } from "../../core/geometrieEspace.types";
import {
  ID_APPUI_BASE,
  type ExerciceSectionPlaneSolide,
  type LigneCandidateExercice,
  type PlanParalleleExercice,
  type PointAppuiExercice,
  type PointSectionExercice,
  type VarianteManuelSection,
} from "../../core/sectionPlaneSolide.types";
import { distance3D, EPSILON_3D, normalePlan, normeCarree3D, produitScalaire3D, sontParalleles3D, soustraire3D } from "../solide3D/geometrieEspace";
import { GABARITS_SOLIDE3D, GABARITS_TOUS, tirerNomGabarit } from "../solide3D/gabarits";
import { faceEstVisible } from "../../ui/solide3DSketch";
import {
  calculerPolygoneSection,
  distanceSegment2D,
  distanceSilhouette,
  lignesCandidatesStatiques,
  projectionCroquis,
  resolutionReference,
  tailleCroquis,
  type EtapeResolutionReference,
  type PlanPoints3D,
  type PolygoneSection,
} from "./polygoneSection";

/**
 * Couche A — trois variantes de gen40 inspirées du manuel (exercices 4 a, 6 b 3–4, 7 b 2–3 ;
 * 25/11/2026), AJOUTÉES EN FIN de catalogue (`index.ts`) : les indices — donc les `?code=` — des
 * variantes historiques ne bougent pas. Petits outils (arêtes, mélange) dupliqués d'`index.ts` pour
 * éviter un import circulaire.
 *
 * 1. « faceInterieure » : un point donné à l'intérieur d'une face VISIBLE (loin des bords), un autre
 *    sur une arête de cette face, le troisième sur une arête hors de la face. On commence par la face
 *    qui contient deux points connus : la droite qui les joint, prolongée jusqu'au bord de la face,
 *    donne le côté et un nouveau point.
 * 2. « prolongement » : un ou deux points donnés sur la DROITE d'une arête, au-delà d'un sommet (hors
 *    du solide, dessinés hors de sa silhouette, dans le cadre du croquis, la droite prolongée tracée).
 *    Un tel point est dans le plan des deux faces de cette arête : relié à un point de section connu
 *    d'une de ces faces, il donne le côté. Chaque point donné hors du solide sert dans la résolution.
 * 3. « parallele » : cube ou pavé, K, L, M sur les trois arêtes du sommet visible (triangle KLM, sa
 *    section), P sur une arête ; section par le plan π parallèle à (KLM) passant par P. Chaque face
 *    d'un pavé est l'une des trois faces de KLM ou leur est parallèle : le côté de la section dans
 *    une face est parallèle au côté de KLM de cette face (ou de la face parallèle).
 *
 * Contraintes communes (même esprit que les variantes historiques) : section à au moins 3 côtés,
 * aucun sommet de section à moins de 10 % d'une extrémité de son arête, résolution de référence
 * complète, étiquettes lisibles (distances mesurées dans le repère du croquis).
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

function aretesNommees(solide: Solide3D): [string, string][] {
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

function lignesStatiquesAvecLabel(solide: Solide3D): LigneCandidateExercice[] {
  return lignesCandidatesStatiques(solide).map((ligne) => {
    const [prefixe, sommets] = ligne.cle.split(":");
    return { ...ligne, label: `${prefixe === "arete" ? "arête" : "diagonale"} [${sommets}]` };
  });
}

function pointSurDroite(solide: Solide3D, arete: [string, string], t: number): Point3D {
  const a = solide.sommets[arete[0]];
  const b = solide.sommets[arete[1]];
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, z: a.z + (b.z - a.z) * t };
}

const T_MIN_SUR_ARETE = 0.1;

function margesRespectees(solide: Solide3D, polygone: PolygoneSection): boolean {
  return polygone.points.every((p) => {
    const a = solide.sommets[p.arete[0]];
    const b = solide.sommets[p.arete[1]];
    const t = distance3D(a, p.position) / distance3D(a, b);
    return t >= T_MIN_SUR_ARETE && t <= 1 - T_MIN_SUR_ARETE;
  });
}

function facesDeLArete(solide: Solide3D, arete: [string, string]): number[] {
  return solide.faces.map((f, i) => (f.includes(arete[0]) && f.includes(arete[1]) ? i : -1)).filter((i) => i >= 0);
}

/** Distance (repère du croquis) d'un point projeté aux arêtes et aux sommets projetés. */
function degagementCroquis(solide: Solide3D, p: Point3D): { aretes: number; sommets: number } {
  const q = projectionCroquis(p);
  let aretes = Infinity;
  for (const [a, b] of aretesNommees(solide)) aretes = Math.min(aretes, distanceSegment2D(q, projectionCroquis(solide.sommets[a]), projectionCroquis(solide.sommets[b])));
  let sommets = Infinity;
  for (const s of Object.values(solide.sommets)) {
    const r = projectionCroquis(s);
    sommets = Math.min(sommets, Math.hypot(q.x - r.x, q.y - r.y));
  }
  return { aretes, sommets };
}

function distanceProjetee(a: Point3D, b: Point3D): number {
  const p = projectionCroquis(a);
  const q = projectionCroquis(b);
  return Math.hypot(p.x - q.x, p.y - q.y);
}

/** Le point projeté reste dans le cadre du croquis, étiquette comprise (marge plus étroite que
 * celle des points auxiliaires : l'étiquette est posée au-dessus du point). */
function dansCadre(solide: Solide3D, p: Point3D, marge: number): boolean {
  const projetes = Object.values(solide.sommets).map(projectionCroquis);
  const t = tailleCroquis(solide);
  const q = projectionCroquis(p);
  return (
    q.x >= Math.min(...projetes.map((r) => r.x)) - marge * t &&
    q.x <= Math.max(...projetes.map((r) => r.x)) + marge * t &&
    q.y >= Math.min(...projetes.map((r) => r.y)) - marge * t &&
    q.y <= Math.max(...projetes.map((r) => r.y)) + (marge - 0.02) * t
  );
}

type PointDonne = { position: Point3D; appui: Omit<PointAppuiExercice, "id"> | null };

const LABELS_DEPART = ["P", "Q", "R"] as const;

/** Instance depuis les trois points donnés (dans l'ordre des lettres P, Q, R) : sommets de section
 * pour les points d'arête, points d'appui sinon — `null` si une contrainte commune échoue ou si un
 * point d'appui ne sert pas dans la résolution de référence. */
function assemblerManuel(solide: Solide3D, donnes: PointDonne[], variante: VarianteManuelSection): ExerciceSectionPlaneSolide | null {
  const plan = donnes.map((d) => d.position) as PlanPoints3D;
  const polygone = calculerPolygoneSection(solide, plan);
  if (!polygone || polygone.points.length < 3 || !margesRespectees(solide, polygone)) return null;

  const idsDepart: number[] = [];
  const pointsAppui: PointAppuiExercice[] = [];
  for (let i = 0; i < donnes.length; i++) {
    const d = donnes[i];
    if (d.appui) {
      const id = ID_APPUI_BASE + i;
      pointsAppui.push({ id, ...d.appui });
      idsDepart.push(id);
      continue;
    }
    const sommet = polygone.points.find((p) => distance3D(p.position, d.position) < EPSILON_3D);
    if (!sommet) return null;
    idsDepart.push(sommet.id);
  }
  const departSommets = idsDepart.filter((id) => id < ID_APPUI_BASE);
  if (departSommets.length === 0) return null;

  // Aucune face traversée dont le plan contient deux points d'appui (sa section viendrait d'un coup).
  for (const face of polygone.facesCroisees) {
    if (pointsAppui.filter((x) => x.facesPlan.includes(face)).length >= 2) return null;
  }

  const resolution = resolutionReference(
    solide,
    polygone,
    idsDepart,
    pointsAppui.map((x) => ({ id: x.id, position: x.position })),
  );
  if (!resolution) return null;
  for (const x of pointsAppui) {
    if (!resolution.some((e) => e.type === "appui" && e.appui === x.id)) return null;
  }

  return exerciceDepuis(solide, plan, polygone, idsDepart, resolution, { variante, pointsAppui });
}

function exerciceDepuis(
  solide: Solide3D,
  plan: PlanPoints3D,
  polygone: PolygoneSection,
  idsDepart: number[],
  resolution: EtapeResolutionReference[],
  extra: Pick<ExerciceSectionPlaneSolide, "variante" | "pointsAppui" | "planParallele">,
): ExerciceSectionPlaneSolide {
  const points: PointSectionExercice[] = polygone.points.map((p) => {
    const rang = idsDepart.indexOf(p.id);
    return { id: p.id, position: p.position, arete: p.arete, faces: p.faces, labelDepart: rang >= 0 ? LABELS_DEPART[rang] : null };
  });
  return {
    solide,
    plan,
    points,
    ordreCyclique: polygone.ordreCyclique,
    facesCroisees: polygone.facesCroisees,
    idsDepart,
    lignesStatiques: lignesStatiquesAvecLabel(solide),
    resolutionReference: resolution,
    ...extra,
  };
}

// --- 1. Un point dans une face -------------------------------------------------------------------

/** Point bien à l'intérieur d'une face : rectangle u, v ∈ [0,25 ; 0,75], triangle barycentres ≥ 0,2. */
function pointInterieurFace(solide: Solide3D, face: string[]): Point3D | null {
  const s = face.map((n) => solide.sommets[n]);
  if (s.length === 4) {
    const u = 0.25 + Math.random() * 0.5;
    const v = 0.25 + Math.random() * 0.5;
    return { x: s[0].x + u * (s[1].x - s[0].x) + v * (s[3].x - s[0].x), y: s[0].y + u * (s[1].y - s[0].y) + v * (s[3].y - s[0].y), z: s[0].z + u * (s[1].z - s[0].z) + v * (s[3].z - s[0].z) };
  }
  for (let essai = 0; essai < 40; essai++) {
    const [a, b] = [Math.random(), Math.random()].sort((x, y) => x - y);
    const w = [a, b - a, 1 - b];
    if (w.some((x) => x < 0.2)) continue;
    return { x: w[0] * s[0].x + w[1] * s[1].x + w[2] * s[2].x, y: w[0] * s[0].y + w[1] * s[1].y + w[2] * s[2].y, z: w[0] * s[0].z + w[1] * s[1].z + w[2] * s[2].z };
  }
  return null;
}

function tenterFaceInterieure(): ExerciceSectionPlaneSolide | null {
  const solide = GABARITS_SOLIDE3D[tirerNomGabarit(GABARITS_TOUS)];
  const visibles = solide.faces.map((_, i) => i).filter((i) => faceEstVisible(solide, solide.faces[i]));
  const f = visibles[randomInt(0, visibles.length - 1)];
  const face = solide.faces[f];
  const interieur = pointInterieurFace(solide, face);
  if (!interieur) return null;
  const aretesFace = face.map((n, i) => [n, face[(i + 1) % face.length]] as [string, string]);
  const areteDansFace = aretesFace[randomInt(0, aretesFace.length - 1)];
  const horsFace = aretesNommees(solide).filter(([a, b]) => !(face.includes(a) && face.includes(b)));
  const areteHors = horsFace[randomInt(0, horsFace.length - 1)];
  const donnes = melanger<PointDonne>([
    { position: pointSurDroite(solide, areteDansFace, 0.15 + Math.random() * 0.7), appui: null },
    { position: pointSurDroite(solide, areteHors, 0.15 + Math.random() * 0.7), appui: null },
    { position: interieur, appui: { position: interieur, nature: "face", face: f, arete: null, auDelaDe: null, facesPlan: [f] } },
  ]);
  const exercice = assemblerManuel(solide, donnes, "faceInterieure");
  if (!exercice) return null;

  // Lisibilité du point intérieur : loin des arêtes et des sommets DESSINÉS, et des points de section.
  const taille = tailleCroquis(solide);
  const degagement = degagementCroquis(solide, interieur);
  if (degagement.aretes < 0.09 * taille || degagement.sommets < 0.12 * taille) return null;
  // Face fuyante (dessus, côté) : la face est mince sur le dessin, les étiquettes se chevaucheraient.
  if (exercice.points.some((p) => distanceProjetee(p.position, interieur) < 0.13 * taille)) return null;
  // Le point intérieur partage la droite du côté de sa face, loin de ses deux extrémités.
  const cote = exercice.points.filter((p) => p.faces.includes(f));
  if (cote.length !== 2) return null;
  const longueur = distance3D(cote[0].position, cote[1].position);
  if (cote.some((p) => distance3D(p.position, interieur) < 0.25 * longueur)) return null;
  return exercice;
}

// --- 2. Points sur le prolongement d'une arête ---------------------------------------------------

function tenterProlongement(): ExerciceSectionPlaneSolide | null {
  const solide = GABARITS_SOLIDE3D[tirerNomGabarit(GABARITS_TOUS)];
  const aretes = melanger(aretesNommees(solide)).slice(0, 3);
  // Deux points hors du solide passent beaucoup plus rarement les contraintes : tirés 4 fois sur 5.
  const nombreHors = Math.random() < 0.2 ? 1 : 2;
  const taille = tailleCroquis(solide);
  const donnesOrdre: PointDonne[] = aretes.map((arete, i) => {
    if (i >= nombreHors) return { position: pointSurDroite(solide, arete, 0.15 + Math.random() * 0.7), appui: null };
    const auDelaDeA = Math.random() < 0.5;
    const t = auDelaDeA ? -(0.2 + Math.random() * 0.35) : 1.2 + Math.random() * 0.35;
    const position = pointSurDroite(solide, arete, t);
    return { position, appui: { position, nature: "prolongement", face: null, arete, auDelaDe: auDelaDeA ? arete[0] : arete[1], facesPlan: facesDeLArete(solide, arete) } };
  });

  // Chaque point hors du solide : dans le cadre, hors de la silhouette, prolongement dessiné hors du
  // solide (sinon il passerait sur les faces), loin des sommets et des arêtes dessinés.
  for (const d of donnesOrdre) {
    if (!d.appui) continue;
    const x = d.position;
    if (!dansCadre(solide, x, 0.07)) return null;
    if (distanceSilhouette(solide, projectionCroquis(x)) < 0.06 * taille) return null;
    const sommet = solide.sommets[d.appui.auDelaDe!];
    for (const s of [0.3, 0.6]) {
      const m = { x: sommet.x + (x.x - sommet.x) * s, y: sommet.y + (x.y - sommet.y) * s, z: sommet.z + (x.z - sommet.z) * s };
      if (distanceSilhouette(solide, projectionCroquis(m)) <= 0.005 * taille) return null;
    }
    const degagement = degagementCroquis(solide, x);
    if (degagement.sommets < 0.09 * taille || degagement.aretes < 0.05 * taille) return null;
  }
  const hors = donnesOrdre.filter((d) => d.appui);
  if (hors.length === 2 && distanceProjetee(hors[0].position, hors[1].position) < 0.15 * taille) return null;

  const exercice = assemblerManuel(solide, melanger(donnesOrdre), "prolongement");
  if (!exercice) return null;
  // Les points hors du solide restent loin des points de section (étiquettes).
  for (const d of hors) if (exercice.points.some((p) => distanceProjetee(p.position, d.position) < 0.1 * taille)) return null;
  return exercice;
}

// --- 3. Plan parallèle à (KLM) passant par P ----------------------------------------------------

const GABARITS_PARALLELE: NomSolide3D[] = ["cube", "parallelepipede"];

function sommetsVisibles(solide: Solide3D): string[] {
  return Object.keys(solide.sommets).filter((n) => {
    const faces = solide.faces.filter((f) => f.includes(n));
    return faces.length === 3 && faces.every((f) => faceEstVisible(solide, f));
  });
}

function faceCommune(solide: Solide3D, noms: string[]): number {
  return solide.faces.findIndex((f) => noms.every((n) => f.includes(n)));
}

function tenterParallele(): ExerciceSectionPlaneSolide | null {
  const solide = GABARITS_SOLIDE3D[tirerNomGabarit(GABARITS_PARALLELE)];
  const visibles = sommetsVisibles(solide);
  const sommet = visibles[randomInt(0, visibles.length - 1)];
  const issues = melanger(aretesNommees(solide).filter(([a, b]) => a === sommet || b === sommet));
  if (issues.length !== 3) return null;
  const autre = (arete: [string, string]) => (arete[0] === sommet ? arete[1] : arete[0]);
  const noms = ["K", "L", "M"] as const;
  const pointsKLM = issues.map((arete, i) => ({
    nom: noms[i],
    position: pointSurDroite(solide, [sommet, autre(arete)], 0.3 + Math.random() * 0.4),
    arete,
  }));
  const cotes = ([[0, 1], [1, 2], [0, 2]] as const).map(([a, b]) => ({ a, b, face: faceCommune(solide, [sommet, autre(issues[a]), autre(issues[b])]) }));
  if (cotes.some((c) => c.face < 0)) return null;

  // P jamais sur une arête de K, L, M (étiquettes serrées près du sommet, vu sur le papier).
  const aretesP = aretesNommees(solide).filter(([a, b]) => a !== sommet && b !== sommet);
  const areteP = aretesP[randomInt(0, aretesP.length - 1)];
  const P = pointSurDroite(solide, areteP, 0.15 + Math.random() * 0.7);
  const [K, L, M] = pointsKLM.map((p) => p.position);
  const u = soustraire3D(L, K);
  const v = soustraire3D(M, K);
  const plan: PlanPoints3D = [P, { x: P.x + u.x, y: P.y + u.y, z: P.z + u.z }, { x: P.x + v.x, y: P.y + v.y, z: P.z + v.z }];

  // π nettement distinct de (KLM) : distance entre les deux plans ≥ 0,6 (arêtes de 3 à 6).
  const n = normalePlan(K, L, M);
  if (Math.abs(produitScalaire3D(n, soustraire3D(P, K))) / Math.sqrt(normeCarree3D(n)) < 0.6) return null;

  const polygone = calculerPolygoneSection(solide, plan);
  if (!polygone || polygone.points.length < 3 || !margesRespectees(solide, polygone)) return null;
  const depart = polygone.points.find((p) => distance3D(p.position, P) < EPSILON_3D);
  if (!depart) return null;
  const taille = tailleCroquis(solide);
  if (polygone.points.some((p) => pointsKLM.some((k) => distanceProjetee(p.position, k.position) < 0.12 * taille))) return null;

  // Parcours depuis P : chaque côté est parallèle au côté de KLM de sa face (ou de la face parallèle).
  const indexP = polygone.ordreCyclique.indexOf(depart.id);
  const ordre = [...polygone.ordreCyclique.slice(indexP), ...polygone.ordreCyclique.slice(0, indexP)];
  const k = ordre.length;
  const etapes: EtapeResolutionReference[] = [];
  for (let i = 0; i < k; i++) {
    const depuis = polygone.points[ordre[i]];
    const vers = polygone.points[ordre[(i + 1) % k]];
    const face = depuis.faces.find((f) => vers.faces.includes(f));
    if (face === undefined) return null;
    const direction = soustraire3D(vers.position, depuis.position);
    const paralleles = cotes.map((c, j) => (sontParalleles3D(direction, soustraire3D(pointsKLM[c.b].position, pointsKLM[c.a].position)) ? j : -1)).filter((j) => j >= 0);
    if (paralleles.length !== 1) return null;
    etapes.push(i < k - 1 ? { type: "parallele", face, cote: paralleles[0], pointConnu: depuis.id, pointCible: vers.id } : { type: "segment", face, pointA: depuis.id, pointB: vers.id });
  }

  const planParallele: PlanParalleleExercice = { sommet, points: pointsKLM, cotes };
  return exerciceDepuis(solide, plan, polygone, [depart.id], etapes, { variante: "parallele", planParallele });
}

const MAX_TENTATIVES = 4000;

const TENTATIVES: Record<VarianteManuelSection, () => ExerciceSectionPlaneSolide | null> = {
  faceInterieure: tenterFaceInterieure,
  prolongement: tenterProlongement,
  parallele: tenterParallele,
};

export function construireVarianteManuel(variante: VarianteManuelSection): ExerciceSectionPlaneSolide {
  for (let tentative = 0; tentative < MAX_TENTATIVES; tentative++) {
    const resultat = TENTATIVES[variante]();
    if (resultat) return resultat;
  }
  throw new Error(`construireVarianteManuel : aucune instance « ${variante} » trouvée après ${MAX_TENTATIVES} tentatives`);
}
