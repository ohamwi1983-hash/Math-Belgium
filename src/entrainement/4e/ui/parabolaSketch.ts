import type { Crochet, ExerciceInequation, ReponseRacines, SigneA } from "../core/inequation.types";

export interface PointCroquis {
  x: number;
  y: number;
}

export interface PointRacine extends PointCroquis {
  /** vraie valeur numérique de la racine (pour l'étiquette affichée sous le point) */
  valeur: number;
}

export interface CroquisParabole {
  points: PointCroquis[];
  pointsRacines: PointRacine[];
  largeur: number;
  axeY: number;
}

const LARGEUR = 300;
const AXE_Y = 100;
const CENTRE_X = 150;
const ECART_RACINES = 50;
const COEFF = 0.03;
const DECALAGE_VIDE = 35;
/** Échantillonnage dense (51 points, pas de 6) pour une courbe lisse, pas une ligne brisée en V. */
const XS = Array.from({ length: 51 }, (_, i) => i * 6);

/**
 * Croquis schématique (pas à l'échelle numérique réelle) de la parabole, à partir de la saisie
 * de l'élève (juste ou fausse — purement illustratif, jamais utilisé pour la correction).
 *
 * Toutes les formes utilisent la même famille : y(x) = AXE_Y + décalage + s·COEFF·(x-r1)(x-r2).
 * s = signeA==="+" ? -1 : 1 (dérivation vérifiée à la main) :
 * - a>0, deux racines distinctes : entre les racines (produit négatif) y = AXE_Y - s·COEFF·|...|
 *   = AXE_Y + COEFF·|...| > AXE_Y (sommet SOUS l'axe, en SVG y croît vers le bas) ; à l'extérieur
 *   (produit positif) y = AXE_Y + s·COEFF·(...) = AXE_Y - COEFF·(...) < AXE_Y (au-dessus de
 *   l'axe) — arcs qui montent de part et d'autre, cohérent avec une parabole qui "ouvre vers le
 *   haut" mathématiquement. a<0 : signe inversé, cohérent symétriquement.
 * - r1=r2 (racine double) : produit toujours ≥0, donc le signe ne change jamais — tangence exacte
 *   en x=r1, jamais de passage de l'autre côté.
 * - "aucune" réutilise r1=r2=CENTRE_X mais avec un décalage vertical non nul du même signe que le
 *   terme en (x-centre)², garantissant qu'elle ne touche jamais l'axe.
 */
export function calculerCroquisParabole(racines: ReponseRacines, signeA: SigneA): CroquisParabole {
  const s = signeA === "+" ? -1 : 1;

  if (racines.type === "aucune") {
    const decalage = signeA === "+" ? -DECALAGE_VIDE : DECALAGE_VIDE;
    const points = XS.map((x) => ({ x, y: AXE_Y + decalage + s * COEFF * (x - CENTRE_X) ** 2 }));
    return { points, pointsRacines: [], largeur: LARGEUR, axeY: AXE_Y };
  }

  if (racines.x1 === racines.x2) {
    const points = XS.map((x) => ({ x, y: AXE_Y + s * COEFF * (x - CENTRE_X) ** 2 }));
    return {
      points,
      pointsRacines: [{ x: CENTRE_X, y: AXE_Y, valeur: racines.x1 }],
      largeur: LARGEUR,
      axeY: AXE_Y,
    };
  }

  const [valeurGauche, valeurDroite] = racines.x1 < racines.x2 ? [racines.x1, racines.x2] : [racines.x2, racines.x1];
  const r1 = CENTRE_X - ECART_RACINES;
  const r2 = CENTRE_X + ECART_RACINES;
  const points = XS.map((x) => ({ x, y: AXE_Y + s * COEFF * (x - r1) * (x - r2) }));
  return {
    points,
    pointsRacines: [
      { x: r1, y: AXE_Y, valeur: valeurGauche },
      { x: r2, y: AXE_Y, valeur: valeurDroite },
    ],
    largeur: LARGEUR,
    axeY: AXE_Y,
  };
}

/**
 * Seule source de vérité pour convertir les racines de l'exercice (Couche A) vers la forme
 * attendue par calculerCroquisParabole — jamais dérivée d'une saisie de l'élève. Toute fonction
 * de ce fichier qui a besoin des "vraies" racines doit passer par ici, pas par un état résiduel
 * d'une étape précédente (voir bug corrigé : le croquis de l'étape signe_a utilisait par erreur
 * la dernière saisie de l'élève à l'étape racines au lieu des racines confirmées).
 */
function reponseRacinesVraie(exercice: ExerciceInequation): ReponseRacines {
  return exercice.racines === undefined
    ? { type: "aucune" }
    : { type: "deux", x1: exercice.racines[0], x2: exercice.racines[1] };
}

/**
 * Croquis construit depuis les vraies valeurs confirmées de l'exercice (racines et signe de a),
 * jamais depuis une saisie de l'élève — utilisé sur l'écran de construction de l'intervalle, une
 * fois les étapes racines/signe de a passées, où il faut un croquis stable et correct plutôt
 * qu'illustratif.
 */
export function calculerCroquisVrai(exercice: ExerciceInequation): CroquisParabole {
  const signeA: SigneA = exercice.enonce.a > 0 ? "+" : "-";
  return calculerCroquisParabole(reponseRacinesVraie(exercice), signeA);
}

/**
 * Croquis pour l'étape signe_a : racines toujours issues des vraies valeurs confirmées de
 * l'exercice (jamais de la saisie de l'élève à l'étape racines, correcte ou non), combinées au
 * signe choisi en direct par l'élève à CETTE étape (pas encore confirmé, c'est ce qui est en
 * cours de validation).
 */
export function calculerCroquisAvecRacinesVraies(exercice: ExerciceInequation, signeA: SigneA): CroquisParabole {
  return calculerCroquisParabole(reponseRacinesVraie(exercice), signeA);
}

export type CouleurSegment = "vert" | "rouge";

export interface SegmentColore {
  points: PointCroquis[];
  couleur: CouleurSegment;
}

export interface PointRacineColore extends PointRacine {
  couleur: CouleurSegment;
}

export interface CroquisColore {
  segments: SegmentColore[];
  pointsRacinesColores: PointRacineColore[];
}

/** Gauche : "[" = fermé. Droite : "]" = fermé — même convention que morceauIntervalle.ts. */
function estFerme(crochet: Crochet, cote: "gauche" | "droite"): boolean {
  return cote === "gauche" ? crochet === "[" : crochet === "]";
}

/** Découpe la courbe en 3 tronçons (extérieur gauche / intérieur / extérieur droit), en insérant
 * les points-racines exacts (y=axeY) comme jonctions pour éviter tout trou visuel entre segments. */
function diviserPoints(
  points: PointCroquis[],
  racineGauche: PointCroquis,
  racineDroite: PointCroquis,
): [PointCroquis[], PointCroquis[], PointCroquis[]] {
  const gauche = [...points.filter((p) => p.x <= racineGauche.x), racineGauche];
  const interieur = [racineGauche, ...points.filter((p) => p.x > racineGauche.x && p.x < racineDroite.x), racineDroite];
  const droite = [racineDroite, ...points.filter((p) => p.x > racineDroite.x)];
  return [gauche, interieur, droite];
}

/**
 * Colore le croquis (calculerCroquisVrai) pour le bouton "Aide" de l'étape intervalle : vert =
 * satisfait l'inégalité de l'énoncé, rouge = ne la satisfait pas. Réutilise TOUJOURS
 * exercice.solution (déjà calculé par classifierSolution, section 2 de la spec du générateur) —
 * ne redérive jamais le signe de tête, pour ne jamais désynchroniser cette coloration de la
 * classification qui sert par ailleurs à corriger la réponse de l'élève.
 */
export function calculerCroquisColore(exercice: ExerciceInequation): CroquisColore {
  const croquis = calculerCroquisVrai(exercice);
  const solution = exercice.solution;

  if (croquis.pointsRacines.length === 0) {
    const couleur: CouleurSegment = solution.forme === "reel" ? "vert" : "rouge";
    return { segments: [{ points: croquis.points, couleur }], pointsRacinesColores: [] };
  }

  if (croquis.pointsRacines.length === 1) {
    const resteVert = solution.forme === "reel" || solution.forme === "reel_sauf_point";
    const pointVert = solution.forme === "reel" || solution.forme === "point";
    return {
      segments: [{ points: croquis.points, couleur: resteVert ? "vert" : "rouge" }],
      pointsRacinesColores: [{ ...croquis.pointsRacines[0], couleur: pointVert ? "vert" : "rouge" }],
    };
  }

  const [racineGauche, racineDroite] = croquis.pointsRacines;
  const [gauche, interieur, droite] = diviserPoints(croquis.points, racineGauche, racineDroite);

  let interieurVert: boolean;
  let couleurRacineGauche: CouleurSegment;
  let couleurRacineDroite: CouleurSegment;
  if (solution.forme === "intervalle") {
    interieurVert = true;
    couleurRacineGauche = estFerme(solution.morceau.crochetGauche, "gauche") ? "vert" : "rouge";
    couleurRacineDroite = estFerme(solution.morceau.crochetDroit, "droite") ? "vert" : "rouge";
  } else if (solution.forme === "union") {
    interieurVert = false;
    couleurRacineGauche = estFerme(solution.morceau1.crochetDroit, "droite") ? "vert" : "rouge";
    couleurRacineDroite = estFerme(solution.morceau2.crochetGauche, "gauche") ? "vert" : "rouge";
  } else {
    throw new Error("calculerCroquisColore : 2 racines mais solution ni intervalle ni union — incohérent");
  }

  return {
    segments: [
      { points: gauche, couleur: interieurVert ? "rouge" : "vert" },
      { points: interieur, couleur: interieurVert ? "vert" : "rouge" },
      { points: droite, couleur: interieurVert ? "rouge" : "vert" },
    ],
    pointsRacinesColores: [
      { ...racineGauche, couleur: couleurRacineGauche },
      { ...racineDroite, couleur: couleurRacineDroite },
    ],
  };
}
