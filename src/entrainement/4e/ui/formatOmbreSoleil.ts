import type { PointExtraSolide3D, SegmentExtraSolide3D } from "../components/Solide3DSketch";
import type { Point3D, Solide3D } from "../core/geometrieEspace.types";
import type {
  CadrageScene,
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
import { DIRECTION_VUE_3D } from "./solide3DSketch";

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
  aide: "#7048e8",
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
    points: [...baton.points, { position: ombre, label: "Ombre de E", couleur: COULEURS_OMBRE.exemple }],
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
      { position: exercice.ombreConnue, label: "Ombre connue", couleur: COULEURS_OMBRE.exemple },
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
    return fusionner(sol, obstacles, elementsExemple(exercice.piquetExemple, exercice.ombreExemple), elementsBaton(exercice.baton));
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
  "Le soleil éclaire le bâton A comme le bâton E de l'exemple (rayon pointillé, ombre au sol). Choisis le point où tombe l'ombre du sommet de A.";

export const AIDE_POINT_SIMPLE = [
  "Méthode : l'ombre du sommet est à l'intersection de deux droites — le rayon issu du sommet de A, parallèle au rayon de l'exemple, et la trace au sol issue du pied de A, parallèle à l'ombre de E (du pied de E à son ombre).",
  "Le rayon issu du sommet de A est tracé en violet. Parmi les points qui sont sur lui, l'ombre est celui qui est aussi sur la trace au sol issue du pied de A.",
];

export const CONSIGNE_DIRECTION_OBSTACLE =
  "Tous les rayons du soleil sont parallèles. Choisis le rayon qui part du sommet du bâton A dans la même direction que le rayon de l'exemple E.";

export const AIDE_DIRECTION_OBSTACLE = [
  "Méthode : des droites parallèles restent parallèles sur le dessin. Le bon rayon a exactement la même inclinaison que le rayon pointillé de l'exemple, et part du même côté.",
  "Le rayon de l'exemple a été recopié en violet, parallèlement, depuis le pied du bâton A : compare-lui l'inclinaison de chaque candidat.",
];

export const CONSIGNE_POINT_OBSTACLE =
  "Le rayon issu du sommet du bâton A est tracé. Choisis le point où l'ombre du sommet de A s'arrête réellement : sur un obstacle, ou sur le sol.";

export const AIDE_POINT_OBSTACLE = [
  "Méthode : suis la trace au sol issue du pied de A (parallèle à l'ombre de E). Pour chaque obstacle qu'elle traverse, regarde si le rayon passe au-dessus ou s'il le heurte. L'ombre s'arrête sur la PREMIÈRE surface que le rayon touche.",
  "La trace au sol et le rayon sont tracés en violet. Le premier obstacle que le rayon heurte arrête l'ombre ; s'il passe au-dessus de tous, l'ombre atteint le sol.",
];

export const CONSIGNE_DIRECTION_INCONNUE =
  "La lumière est inconnue, mais l'ombre d'un sommet du campanile est donnée (trait pointillé). Choisis le rayon qui part du sommet {id} dans la même direction que la lumière.";

export const AIDE_DIRECTION_INCONNUE = [
  "Méthode : la lumière va du sommet connu vers son ombre. Le bon rayon est parallèle au trait pointillé qui les relie : même inclinaison sur le dessin, et même sens (vers le bas, du côté de l'ombre).",
  "Le trait pointillé a été recopié en violet, parallèlement, depuis le pied du sommet {id} : compare-lui l'inclinaison et le sens de chaque candidat.",
];

export const CONSIGNE_POINT_SOMMET = "Choisis le point où tombe l'ombre du sommet {id} du campanile.";

export const AIDE_POINT_SOMMET = [
  "Méthode : l'ombre de {id} est à l'intersection du rayon issu de {id} (parallèle au trait pointillé de l'ombre connue) et de la trace au sol issue du pied de {id} (le point du sol à sa verticale), parallèle à la trace de l'ombre connue.",
  "Le rayon issu de {id} est tracé en violet. Parmi les points qui sont sur lui, l'ombre est celui qui est aussi sur la trace au sol issue du pied de {id}.",
];

export function avecId(texte: string, id: string): string {
  return texte.split("{id}").join(id);
}

export function libelleDirection(numero: number): string {
  return `Rayon ${numero}`;
}

export function libellePoint(numero: number): string {
  return `Point ${numero}`;
}

// --- Conclusion ----------------------------------------------------------------------------------

export function libelleObstacle(obstacle: ObstacleOmbreSoleil): string {
  return obstacle.type === "escalier" ? "l'escalier" : "la caisse";
}

export function texteConclusion(exercice: ExerciceOmbreSoleil): string {
  if (exercice.variante === "simple") {
    return "L'ombre du bâton A est le segment qui va de son pied jusqu'à l'ombre de son sommet, parallèle à l'ombre de E.";
  }
  if (exercice.variante === "obstacle") {
    if (exercice.indexObstacleTouche === null) {
      return "Le rayon issu du sommet de A passe au-dessus (ou à côté) de tous les obstacles : l'ombre du sommet atteint le sol.";
    }
    return `Le rayon issu du sommet de A heurte d'abord ${libelleObstacle(exercice.obstacles[exercice.indexObstacleTouche])} (en vert) : l'ombre du sommet s'arrête sur sa surface, elle n'atteint pas le sol.`;
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
    return fusionner(elementsScene(exercice), elementsOmbreSommet(sommetPiquet(p.piquet), p.ombre, "Ombre de A"), {
      points: [],
      segments: [{ a: p.piquet.base, b: p.ombre, couleur: COULEURS_OMBRE.correct }],
    });
  }
  if (exercice.variante === "obstacle") {
    const auSol = exercice.indexObstacleTouche === null;
    return fusionner(
      elementsScene(exercice, exercice.indexObstacleTouche),
      elementsOmbreSommet(sommetPiquet(exercice.baton), exercice.ombre, "Ombre de A"),
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
