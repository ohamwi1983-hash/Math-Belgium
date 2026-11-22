import type { PointExtraSolide3D, SegmentExtraSolide3D } from "../components/Solide3DSketch";
import type { Point3D, Solide3D } from "../core/geometrieEspace.types";
import type {
  CadrageScene,
  ErreurPointOmbre,
  DirectionCandidate,
  ExerciceOmbreSoleil,
  ExerciceOmbreSoleilDirectionInconnue,
  ExerciceOmbreSoleilObstacle,
  ExerciceOmbreSoleilSimple,
  ObstacleOmbreSoleil,
  Piquet,
  PiquetAResoudre,
} from "../core/ombreSoleil.types";
import { additionner3D, multiplierScalaire3D, produitScalaire3D, soustraire3D } from "../moteur/geometrieEspace";
import { sommetPiquet } from "../moteur/verificationOmbreSoleil";
import { calculerEchelleProjection, DIRECTION_VUE_3D, HAUTEUR_SVG, LARGEUR_SVG, projeter3DVersPixel } from "./solide3DSketch";

/**
 * Présentation — "Ombre au soleil" (41e générateur, chapitre "Géométrie dans l'espace").
 *
 * **La direction de lumière n'est JAMAIS montrée numériquement.** Chaque écran propose 4 candidats
 * dessinés EN MÊME TEMPS sur le croquis, numérotés 1 à 4 dans un ordre mélangé à chaque écran
 * (le numéro du bouton correspond au numéro du dessin). La scène entière (sol, obstacles, bâtons)
 * est dessinée ici en segments/points annexes : le solide passé à `Solide3DSketch` ne sert qu'au
 * cadrage (aucune face), sauf pour le campanile, dessiné par le composant lui-même. La visibilité
 * des arêtes d'un obstacle est calculée obstacle par obstacle (normales extérieures réelles, escalier
 * concave compris), plus avec le centre de toute la scène.
 */

export type ExerciceOmbreSoleilBoucle = ExerciceOmbreSoleilObstacle | ExerciceOmbreSoleilDirectionInconnue;

export interface ElementsCroquis {
  points: PointExtraSolide3D[];
  segments: SegmentExtraSolide3D[];
}

export const COULEURS_OMBRE = {
  arete: "#495057",
  areteCachee: "#adb5bd",
  sol: "#ced4da",
  baton: "#495057",
  exemple: "#868e96",
  candidat: "#4263eb",
  selection: "#f08c00",
  correct: "#2f9e44",
  refuse: "#e03131",
  aide: "#d6336c",
} as const;

export function fusionner(...elements: ElementsCroquis[]): ElementsCroquis {
  return { points: elements.flatMap((e) => e.points), segments: elements.flatMap((e) => e.segments) };
}

// --- Cadrage et scène ----------------------------------------------------------------------------

/** Solide transmis à `Solide3DSketch` : seulement des sommets virtuels (cadrage figé à la
 * génération), aucune face — sauf pour le campanile, affiché avec ses vraies arêtes. */
export function solidePourAffichage(exercice: ExerciceOmbreSoleil): Solide3D {
  const sommets: Record<string, Point3D> = {};
  exercice.cadrage.points.forEach((p, i) => {
    sommets[`cadrage${i}`] = p;
  });
  if (exercice.variante === "directionInconnue") {
    return { ...exercice.solide, sommets: { ...sommets, ...exercice.solide.sommets } };
  }
  return { id: "cube", label: "", sommets, faces: [] };
}

function elementsSol(cadrage: CadrageScene): ElementsCroquis {
  const s = cadrage.sol;
  return { points: [], segments: s.map((a, i) => ({ a, b: s[(i + 1) % 4], couleur: COULEURS_OMBRE.sol })) };
}

const AXES = ["x", "y", "z"] as const;

function dansObstacleStrict(p: Point3D, obstacle: ObstacleOmbreSoleil): boolean {
  return obstacle.boites.some((b) => AXES.every((a) => p[a] > b.min[a] + 1e-9 && p[a] < b.max[a] - 1e-9));
}

/** Normale extérieure d'une face axis-aligned d'un obstacle (union de boîtes, éventuellement
 * concave) : sens choisi en testant de quel côté de la face se trouve la matière. */
function normaleExterieure(obstacle: ObstacleOmbreSoleil, face: string[]): Point3D | null {
  const points = face.map((n) => obstacle.solide.sommets[n]);
  const axe = AXES.find((a) => points.every((p) => Math.abs(p[a] - points[0][a]) < 1e-9));
  if (!axe) return null;
  const centre = multiplierScalaire3D(points.reduce((acc, p) => additionner3D(acc, p), { x: 0, y: 0, z: 0 }), 1 / points.length);
  const valeurs = obstacle.boites.flatMap((b) => [b.min[axe], b.max[axe]]);
  const unite: Point3D = { x: 0, y: 0, z: 0, [axe]: 1 };
  if (Math.abs(points[0][axe] - Math.min(...valeurs)) < 1e-9) return multiplierScalaire3D(unite, -1);
  if (Math.abs(points[0][axe] - Math.max(...valeurs)) < 1e-9) return unite;
  // Face intérieure à la boîte englobante (contremarche, giron) : la matière est du côté opposé.
  return dansObstacleStrict(additionner3D(centre, multiplierScalaire3D(unite, 0.01)), obstacle) ? multiplierScalaire3D(unite, -1) : unite;
}

/** Arêtes d'un obstacle, visibles en trait plein, cachées en pointillé clair — ou toutes dans
 * `couleurMiseEnEvidence` (obstacle touché, dans la correction). */
export function aretesObstacle(obstacle: ObstacleOmbreSoleil, couleurMiseEnEvidence?: string): SegmentExtraSolide3D[] {
  const parCle = new Map<string, { a: Point3D; b: Point3D; visible: boolean }>();
  for (const face of obstacle.solide.faces) {
    const normale = normaleExterieure(obstacle, face);
    const visible = normale !== null && produitScalaire3D(normale, DIRECTION_VUE_3D) > 0;
    for (let i = 0; i < face.length; i++) {
      const [n1, n2] = [face[i], face[(i + 1) % face.length]].sort();
      const cle = `${n1}-${n2}`;
      const existante = parCle.get(cle);
      if (existante) existante.visible = existante.visible || visible;
      else parCle.set(cle, { a: obstacle.solide.sommets[n1], b: obstacle.solide.sommets[n2], visible });
    }
  }
  return [...parCle.values()].map(({ a, b, visible }) => ({
    a,
    b,
    couleur: couleurMiseEnEvidence ?? (visible ? COULEURS_OMBRE.arete : COULEURS_OMBRE.areteCachee),
    pointille: !visible,
  }));
}

export function elementsBaton(piquet: Piquet, couleur: string = COULEURS_OMBRE.baton): ElementsCroquis {
  return {
    points: [{ position: sommetPiquet(piquet), label: piquet.id, couleur }],
    segments: [{ a: piquet.base, b: sommetPiquet(piquet), couleur }],
  };
}

/** L'exemple : le bâton E, son rayon (pointillé) et son ombre au sol (segment du pied à l'ombre). */
export function elementsExemple(piquet: Piquet, ombre: Point3D): ElementsCroquis {
  const baton = elementsBaton(piquet, COULEURS_OMBRE.exemple);
  return {
    points: [...baton.points, { position: ombre, label: "E′", couleur: COULEURS_OMBRE.exemple }],
    segments: [
      ...baton.segments,
      { a: sommetPiquet(piquet), b: ombre, couleur: COULEURS_OMBRE.exemple, pointille: true },
      { a: piquet.base, b: ombre, couleur: COULEURS_OMBRE.exemple },
    ],
  };
}

/** La paire donnée de la variante `directionInconnue` : sommet connu, ombre connue, rayon et trace
 * au sol (du pied du sommet à son ombre). */
export function elementsPaireConnue(exercice: ExerciceOmbreSoleilDirectionInconnue): ElementsCroquis {
  const sommet = sommetPiquet(exercice.piquetConnu);
  return {
    points: [
      { position: sommet, label: exercice.piquetConnu.id, couleur: COULEURS_OMBRE.exemple },
      { position: exercice.ombreConnue, label: `${exercice.piquetConnu.id}′`, couleur: COULEURS_OMBRE.exemple },
    ],
    segments: [
      { a: sommet, b: exercice.ombreConnue, couleur: COULEURS_OMBRE.exemple, pointille: true },
      { a: exercice.piquetConnu.base, b: exercice.ombreConnue, couleur: COULEURS_OMBRE.exemple, pointille: true },
    ],
  };
}

/** Fond de l'écran (tout ce qui ne dépend pas des candidats). */
export function elementsScene(exercice: ExerciceOmbreSoleil, indexObstacleMisEnEvidence: number | null = null): ElementsCroquis {
  const sol = elementsSol(exercice.cadrage);
  if (exercice.variante === "simple") {
    return fusionner(sol, elementsExemple(exercice.piquetExemple, exercice.ombreExemple), elementsBaton(exercice.piquet.piquet));
  }
  if (exercice.variante === "obstacle") {
    const obstacles: ElementsCroquis = {
      points: [],
      segments: exercice.obstacles.flatMap((o, i) => aretesObstacle(o, i === indexObstacleMisEnEvidence ? COULEURS_OMBRE.correct : undefined)),
    };
    return fusionner(sol, obstacles, { points: etiquettesObstacles(exercice), segments: [] }, elementsExemple(exercice.piquetExemple, exercice.ombreExemple), elementsBaton(exercice.baton));
  }
  return fusionner(sol, elementsPaireConnue(exercice));
}

// --- Candidats ------------------------------------------------------------------------------------

export type EtatCandidat = "neutre" | "selectionne" | "correct" | "refuse";

export function couleurCandidat(etat: EtatCandidat): string {
  if (etat === "selectionne") return COULEURS_OMBRE.selection;
  if (etat === "correct") return COULEURS_OMBRE.correct;
  if (etat === "refuse") return COULEURS_OMBRE.refuse;
  return COULEURS_OMBRE.candidat;
}

/** Aperçu d'une direction candidate : segment pointillé depuis le sommet, numéro à son extrémité. */
export function dessinDirection(origine: Point3D, candidat: DirectionCandidate, numero: number, etat: EtatCandidat): ElementsCroquis {
  const couleur = couleurCandidat(etat);
  return {
    points: [{ position: candidat.extremiteApercu, label: String(numero), couleur }],
    segments: [{ a: origine, b: candidat.extremiteApercu, couleur, pointille: true }],
  };
}

export function dessinPoint(position: Point3D, numero: number, etat: EtatCandidat): ElementsCroquis {
  return { points: [{ position, label: String(numero), couleur: couleurCandidat(etat) }], segments: [] };
}

/** Fisher-Yates — ordre d'affichage des candidats (numéros 1 à 4), refait à chaque écran. */
export function melangerCandidats<T>(candidats: readonly T[]): T[] {
  const copie = [...candidats];
  for (let i = copie.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copie[i], copie[j]] = [copie[j], copie[i]];
  }
  return copie;
}

// --- Aides dessinées ---------------------------------------------------------------------------------

/** Rayon issu de `sommet`, prolongé au-delà du sol (jusqu'à 1,4 fois sa longueur) pour que son
 * extrémité ne désigne jamais la réponse. */
export function rayonProlonge(sommet: Point3D, direction: Point3D, couleur: string = COULEURS_OMBRE.aide): SegmentExtraSolide3D {
  const tSol = -sommet.z / direction.z;
  return { a: sommet, b: additionner3D(sommet, multiplierScalaire3D(direction, 1.4 * tSol)), couleur, pointille: true };
}

/** Trace au sol issue du pied, parallèle à l'ombre de l'exemple, prolongée de la même façon. */
export function traceProlongee(piquet: Piquet, direction: Point3D, couleur: string = COULEURS_OMBRE.aide): SegmentExtraSolide3D {
  const tSol = -piquet.hauteur / direction.z;
  const horizontale: Point3D = { x: direction.x, y: direction.y, z: 0 };
  return { a: piquet.base, b: additionner3D(piquet.base, multiplierScalaire3D(horizontale, 1.4 * tSol)), couleur, pointille: true };
}

/** Copie du rayon de référence (même direction), tracée depuis un pied — compare l'inclinaison
 * sans se superposer aux candidats, qui partent du sommet. */
export function copieRayonDepuisPied(pied: Point3D, sommetReference: Point3D, ombreReference: Point3D): SegmentExtraSolide3D {
  const vecteur = soustraire3D(ombreReference, sommetReference);
  return { a: pied, b: additionner3D(pied, multiplierScalaire3D(vecteur, 0.6)), couleur: COULEURS_OMBRE.aide, pointille: true };
}

// --- Textes -----------------------------------------------------------------------------------------

export const CONSIGNE_POINT_SIMPLE =
  "Le soleil éclaire le bâton A comme le bâton E de l'exemple (rayon pointillé, ombre au sol jusqu'à E′). Choisis le point A′ où tombe l'ombre du sommet de A.";

export const AIDE_POINT_SIMPLE = [
  "Méthode : l'ombre du sommet est à l'intersection de deux droites — le rayon issu du sommet de A, parallèle au rayon de l'exemple, et la trace au sol issue du pied de A, parallèle à l'ombre de E (du pied de E à son ombre).",
  "Le rayon issu du sommet de A est tracé en rose. Parmi les points qui sont sur lui, l'ombre est celui qui est aussi sur la trace au sol issue du pied de A.",
];

export const CONSIGNE_DIRECTION_OBSTACLE =
  "Tous les rayons du soleil sont parallèles. Choisis le rayon qui part du sommet du bâton A dans la même direction que le rayon de l'exemple (du sommet de E à son ombre E′).";

export const AIDE_DIRECTION_OBSTACLE = [
  "Méthode : des droites parallèles restent parallèles sur le dessin. Le bon rayon a exactement la même inclinaison que le rayon pointillé de l'exemple, et part du même côté.",
  "Le rayon de l'exemple a été recopié en rose, parallèlement, depuis le pied du bâton A : compare-lui l'inclinaison de chaque candidat.",
];

export const CONSIGNE_POINT_OBSTACLE =
  "Le début du rayon issu du sommet du bâton A est tracé. Choisis le point A′ où l'ombre du sommet de A s'arrête réellement : sur un obstacle, ou sur le sol.";

export const AIDE_POINT_OBSTACLE = [
  "Méthode : suis la trace au sol issue du pied de A (parallèle à l'ombre de E). Pour chaque obstacle qu'elle traverse, regarde si le rayon passe au-dessus ou s'il le heurte. L'ombre s'arrête sur la PREMIÈRE surface que le rayon touche.",
  "La trace au sol et le rayon sont tracés en rose. Le premier obstacle que le rayon heurte arrête l'ombre ; s'il passe au-dessus de tous, l'ombre atteint le sol.",
];

export const CONSIGNE_DIRECTION_INCONNUE =
  "La direction de la lumière est inconnue, mais l'ombre {connu}′ du sommet {connu} du campanile est donnée (trait pointillé). Choisis le rayon qui part du sommet {id} dans la même direction que la lumière.";

export const AIDE_DIRECTION_INCONNUE = [
  "Méthode : la lumière va du sommet {connu} vers son ombre {connu}′. Le bon rayon est parallèle au trait pointillé qui les relie : même inclinaison sur le dessin, et même sens (vers le bas, du côté de l'ombre).",
  "Le trait pointillé a été recopié en rose, parallèlement, depuis le pied du sommet {id} (le point du sol à sa verticale) : compare-lui l'inclinaison et le sens de chaque candidat.",
];

export const CONSIGNE_POINT_SOMMET = "Choisis le point {id}′ où tombe l'ombre du sommet {id} du campanile.";

export const AIDE_POINT_SOMMET = [
  "Méthode : l'ombre de {id} est à l'intersection du rayon issu de {id} (parallèle au trait pointillé {connu} → {connu}′) et de la trace au sol issue du pied de {id} (le point du sol à sa verticale), parallèle à la trace au sol qui mène à {connu}′.",
  "Le rayon issu de {id} est tracé en rose. Parmi les points qui sont sur lui, l'ombre est celui qui est aussi sur la trace au sol issue du pied de {id}.",
];

export function avecId(texte: string, id: string, connu = ""): string {
  return texte.split("{id}").join(id).split("{connu}").join(connu);
}

export function libelleDirection(numero: number): string {
  return `Rayon ${numero}`;
}

export function libellePoint(numero: number): string {
  return `Point ${numero}`;
}

// --- Conclusion ----------------------------------------------------------------------------------

/** Noms des obstacles d'une scène qui en a plusieurs (audit 4e ch. 8, G11) : dans l'ordre où la
 * trace au sol issue du pied de A les rencontre (ordre du tableau, posé le long de la trace). */
const NOMS_OBSTACLES = ["K", "L", "M"];

export function nomObstacle(exercice: ExerciceOmbreSoleilObstacle, index: number): string | null {
  return exercice.obstacles.length >= 2 ? (NOMS_OBSTACLES[index] ?? null) : null;
}

/** « la caisse », « l'escalier » ; « la caisse K » quand la scène a plusieurs obstacles. */
export function libelleObstacle(exercice: ExerciceOmbreSoleilObstacle, index: number): string {
  const base = exercice.obstacles[index]!.type === "escalier" ? "l'escalier" : "la caisse";
  const nom = nomObstacle(exercice, index);
  return nom ? `${base} ${nom}` : base;
}

interface Px {
  x: number;
  y: number;
}

/** Distance d'un point à un segment (pixels). */
function distanceSegment(c: Px, a: Px, b: Px): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const t = Math.max(0, Math.min(1, ((c.x - a.x) * dx + (c.y - a.y) * dy) / (dx * dx + dy * dy || 1)));
  return Math.hypot(a.x + t * dx - c.x, a.y + t * dy - c.y);
}

/** Décalages candidats d'une étiquette : 16 directions, rayons de 11 à 26 px. */
const DECALAGES_ETIQUETTE: Px[] = [11, 15, 19, 23, 26].flatMap((r) =>
  Array.from({ length: 16 }, (_, k) => ({ x: Math.round(r * Math.cos((k * Math.PI) / 8)), y: Math.round(r * 0.9 * Math.sin((k * Math.PI) / 8)) })),
);

/** Meilleur décalage d'une étiquette (≈ 10 × 14 px, centrée) posée près de `ancre` : le plus de
 * dégagement possible (distance du bord de l'étiquette à tout trait, point ou étiquette déjà posée,
 * plafonnée à 8 px), puis le plus court. `garde` : contrainte supplémentaire (ex. rester plus près de
 * son obstacle que des autres). Partagé avec la figure du corrigé (`ombreSoleil/figure.ts`). */
export function meilleurDecalageEtiquette(ancres: Px[], traits: [Px, Px][], points: Px[], etiquettes: Px[], garde: (c: Px, ancre: Px) => boolean = () => true): { ancre: number; d: Px; degagement: number } {
  let meilleur = { ancre: 0, d: { x: 0, y: -14 }, degagement: -Infinity, score: -Infinity };
  ancres.forEach((a, i) => {
    for (const d of DECALAGES_ETIQUETTE) {
      const c = { x: a.x + d.x, y: a.y + d.y };
      if (c.x < 8 || c.x > LARGEUR_SVG - 8 || c.y < 10 || c.y > HAUTEUR_SVG - 8) continue;
      if (!garde(c, a)) continue;
      // Boîte de l'étiquette ≈ demi-largeur 5, demi-hauteur 7 : on retire ≈ 6 px au dégagement.
      let min = Infinity;
      for (const [p, q] of traits) min = Math.min(min, distanceSegment(c, p, q) - 6);
      for (const q of points) min = Math.min(min, Math.hypot(q.x - c.x, q.y - c.y) - 9);
      for (const q of etiquettes) min = Math.min(min, Math.hypot(q.x - c.x, q.y - c.y) - 13);
      const score = Math.min(min, 8) * 10 - Math.hypot(d.x, d.y) * 0.2;
      if (score > meilleur.score) meilleur = { ancre: i, d, degagement: min, score };
    }
  });
  return { ancre: meilleur.ancre, d: meilleur.d, degagement: meilleur.degagement };
}

/** Étiquettes K, L, M des obstacles (scène à plusieurs obstacles), placées en PIXELS réels près d'un
 * coin du dessus de leur obstacle, là où elles touchent le moins de traits, de points ou d'étiquettes
 * (sol, obstacles, bâtons, exemple, candidats, aperçus de direction, rayons et traces du corrigé), et
 * plus près de leur obstacle que de tout autre. Aucun disque (`rayon: 0`) : ce n'est pas un point. */
function etiquettesObstacles(exercice: ExerciceOmbreSoleilObstacle): PointExtraSolide3D[] {
  if (exercice.obstacles.length < 2) return [];
  const echelle = calculerEchelleProjection(solidePourAffichage(exercice));
  const px = (p: Point3D): Px => projeter3DVersPixel(p, echelle);
  const sommetA = sommetPiquet(exercice.baton);
  const sommetE = sommetPiquet(exercice.piquetExemple);
  const s = exercice.cadrage.sol;
  const segments3D: [Point3D, Point3D][] = [
    ...s.map((a, i): [Point3D, Point3D] => [a, s[(i + 1) % 4]!]),
    [exercice.baton.base, sommetA],
    [exercice.piquetExemple.base, sommetE],
    [sommetE, exercice.ombreExemple],
    [exercice.piquetExemple.base, exercice.ombreExemple],
    [sommetA, exercice.ombreSansObstacle],
    [exercice.baton.base, exercice.ombreSansObstacle],
    [sommetA, exercice.ombre],
    [exercice.baton.base, exercice.ombre],
    ...exercice.directionsCandidates.map((d): [Point3D, Point3D] => [sommetA, d.extremiteApercu]),
  ];
  const traits: [Px, Px][] = segments3D.map(([a, b]) => [px(a), px(b)]);
  const traitsObstacles = exercice.obstacles.map((o) => aretesObstacle(o).map((sg): [Px, Px] => [px(sg.a), px(sg.b)]));
  const tousTraits = [...traits, ...traitsObstacles.flat()];
  const pts3D = [...exercice.pointsCandidats.map((c) => c.position), ...exercice.directionsCandidates.map((d) => d.extremiteApercu), exercice.ombre, sommetA, sommetE, exercice.ombreExemple];
  // Un point dessiné porte aussi son étiquette (≈ 11 px au-dessus) : on évite les deux.
  const points: Px[] = pts3D.flatMap((p) => {
    const q = px(p);
    return [q, { x: q.x, y: q.y - 11 }];
  });
  const posees: Px[] = [];
  return exercice.obstacles.map((o, i) => {
    const coins = o.boites.flatMap((b) => [
      { x: b.min.x, y: b.min.y, z: b.max.z },
      { x: b.max.x, y: b.min.y, z: b.max.z },
      { x: b.max.x, y: b.max.y, z: b.max.z },
      { x: b.min.x, y: b.max.y, z: b.max.z },
      { x: b.min.x, y: b.min.y, z: b.min.z },
      { x: b.max.x, y: b.min.y, z: b.min.z },
    ]);
    const distanceObstacle = (c: Px, j: number) => Math.min(...traitsObstacles[j]!.map(([a, b]) => distanceSegment(c, a, b)));
    const garde = (c: Px) => exercice.obstacles.every((_, j) => j === i || distanceObstacle(c, i) < distanceObstacle(c, j));
    const choix = meilleurDecalageEtiquette(coins.map(px), tousTraits, points, posees, garde);
    const coin = coins[choix.ancre]!;
    const p = px(coin);
    posees.push({ x: p.x + choix.d.x, y: p.y + choix.d.y });
    return { position: coin, label: NOMS_OBSTACLES[i]!, couleur: COULEURS_OMBRE.arete, rayon: 0, decalageLabel: choix.d };
  });
}

export function texteConclusion(exercice: ExerciceOmbreSoleil): string {
  if (exercice.variante === "simple") {
    return "L'ombre du bâton A est le segment qui va de son pied jusqu'à l'ombre de son sommet, parallèle à l'ombre de E.";
  }
  if (exercice.variante === "obstacle") {
    if (exercice.indexObstacleTouche === null) {
      return "Le rayon issu du sommet de A passe au-dessus (ou à côté) de tous les obstacles : l'ombre du sommet atteint le sol.";
    }
    return `Le rayon issu du sommet de A heurte d'abord ${libelleObstacle(exercice, exercice.indexObstacleTouche)} (en vert) : l'ombre du sommet s'arrête sur sa surface, elle n'atteint pas le sol.`;
  }
  return "L'ombre portée du campanile est reconstituée : son contour relie la base aux ombres des sommets. Les ombres des autres sommets s'obtiennent par le même procédé.";
}

function elementsOmbreSommet(sommet: Point3D, ombre: Point3D, label: string): ElementsCroquis {
  return {
    points: [{ position: ombre, label, couleur: COULEURS_OMBRE.correct }],
    segments: [{ a: sommet, b: ombre, couleur: COULEURS_OMBRE.correct, pointille: true }],
  };
}

/** Ombres des sommets déjà projetés (variante `directionInconnue`), avant le sommet `index`. */
export function ombresDejaTrouvees(exercice: ExerciceOmbreSoleilDirectionInconnue, index: number): ElementsCroquis {
  return fusionner(...exercice.piquets.slice(0, index).map((p) => elementsOmbreSommet(sommetPiquet(p.piquet), p.ombre, `${p.piquet.id}′`)));
}

/** Image finale (écran de conclusion et corrigé exporté). */
export function elementsConclusion(exercice: ExerciceOmbreSoleil): ElementsCroquis {
  if (exercice.variante === "simple") {
    const p: PiquetAResoudre = exercice.piquet;
    return fusionner(elementsScene(exercice), elementsOmbreSommet(sommetPiquet(p.piquet), p.ombre, "A′"), {
      points: [],
      segments: [{ a: p.piquet.base, b: p.ombre, couleur: COULEURS_OMBRE.correct }],
    });
  }
  if (exercice.variante === "obstacle") {
    const auSol = exercice.indexObstacleTouche === null;
    return fusionner(
      elementsScene(exercice, exercice.indexObstacleTouche),
      elementsOmbreSommet(sommetPiquet(exercice.baton), exercice.ombre, "A′"),
      { points: [], segments: auSol ? [{ a: exercice.baton.base, b: exercice.ombre, couleur: COULEURS_OMBRE.correct }] : [] },
    );
  }
  const ombres = [
    ...exercice.piquets.map((p) => ({ id: p.piquet.id, sommet: sommetPiquet(p.piquet), ombre: p.ombre })),
    ...exercice.ombresAutres,
  ];
  const contour = exercice.contourOmbre;
  return fusionner(
    elementsScene(exercice),
    ...ombres.map((o) => elementsOmbreSommet(o.sommet, o.ombre, `${o.id}′`)),
    { points: [], segments: contour.map((a, i) => ({ a, b: contour[(i + 1) % contour.length], couleur: COULEURS_OMBRE.correct })) },
  );
}

// --- Accès communs ---------------------------------------------------------------------------------

export function directionCorrecte(exercice: ExerciceOmbreSoleilBoucle): DirectionCandidate {
  const trouve = exercice.directionsCandidates.find((c) => Math.hypot(c.vecteur.x - exercice.direction.x, c.vecteur.y - exercice.direction.y, c.vecteur.z - exercice.direction.z) < 1e-9);
  if (!trouve) throw new Error("directionCorrecte : exercice mal formé");
  return trouve;
}

/** Sommet d'où partent les aperçus de direction : le bâton A (obstacle) ou le premier sommet à
 * projeter (direction inconnue — jamais le sommet connu, dont le rayon est déjà dessiné). */
export function origineApercusDirection(exercice: ExerciceOmbreSoleilBoucle): Piquet {
  return exercice.variante === "obstacle" ? exercice.baton : exercice.piquets[0].piquet;
}

export type { ExerciceOmbreSoleilSimple };

// --- Choix fermés jugés (audit 4e ch. 8, lot B) : message propre au choix faux ----------------------

/** Rayon candidat faux : sens opposé, inclinaison différente, ou direction différente. */
export function messageDirectionFausse(correcte: Point3D, choisie: Point3D): string {
  const horizontal = correcte.x * choisie.x + correcte.y * choisie.y;
  const croix = correcte.x * choisie.y - correcte.y * choisie.x;
  const normeH = Math.hypot(correcte.x, correcte.y) * Math.hypot(choisie.x, choisie.y);
  const memeAxe = normeH > 0 && Math.abs(croix) < 1e-6 * normeH;
  if (memeAxe && horizontal < 0) return "Ce n'était pas le bon rayon : il part du mauvais côté. Les rayons du soleil sont parallèles ET de même sens : l'ombre tombe du même côté que l'ombre donnée.";
  if (memeAxe) return "Ce n'était pas le bon rayon : il part du bon côté, mais il est plus ou moins incliné que le rayon donné. Des droites parallèles gardent la même inclinaison sur le dessin.";
  return "Ce n'était pas le bon rayon : il n'est pas parallèle au rayon donné. Au soleil, tous les rayons sont parallèles (même inclinaison, même sens sur le dessin).";
}

/** Point candidat faux : le message dit l'erreur de construction qu'il incarne (jamais la réponse). */
export function messagePointFaux(erreur: ErreurPointOmbre, exercice?: ExerciceOmbreSoleilObstacle): string {
  const tete = "Ce n'était pas le bon point : ";
  const touche = exercice && exercice.indexObstacleTouche !== null ? libelleObstacle(exercice, exercice.indexObstacleTouche) : null;
  switch (erreur) {
    case "traceTropCourte":
      return `${tete}il est bien sur la trace au sol issue du pied, mais avant le rayon. L'ombre du sommet est là où le rayon rencontre cette trace.`;
    case "traceTropLongue":
      return `${tete}il est bien sur la trace au sol issue du pied, mais au-delà du rayon. L'ombre du sommet est là où le rayon rencontre cette trace.`;
    case "surRayonSansTrace":
      return `${tete}sur le dessin, il semble sur le rayon, mais il n'est pas sur la trace au sol issue du pied. L'ombre est à l'intersection des deux.`;
    case "sensOppose":
      return `${tete}il est du mauvais côté du bâton. L'ombre part dans le même sens que l'ombre donnée.`;
    case "composantesPermutees":
      return `${tete}la trace qui y mène n'est pas parallèle à l'ombre donnée. Au soleil, les ombres au sol de segments verticaux sont parallèles.`;
    case "traverseObstacle":
      return `${tete}pour l'atteindre, le rayon devrait traverser ${touche ?? "un obstacle"}. L'ombre s'arrête sur la première surface que le rayon touche.`;
    case "obstacleSuivant":
      return `${tete}avant d'arriver là, le rayon heurte déjà ${touche ?? "un autre obstacle"}. L'ombre s'arrête sur la première surface touchée.`;
    case "surObstacleSurvole":
      return `${tete}le rayon passe au-dessus de cet obstacle sans le toucher : l'ombre ne s'y arrête pas.`;
    case "surObstacleMauvaiseFace":
      return `${tete}il est bien sur ${touche ?? "l'obstacle touché"}, mais pas à l'endroit où le rayon le heurte (suis la trace au sol issue du pied, puis remonte jusqu'au rayon).`;
    default:
      return "Ce n'était pas le bon point.";
  }
}
