import type { Droite, Point } from "../../core6e/pointsDroitesRemarquablesTriangle.types";

/**
 * Couche A (6e) — géométrie plane pure PARTAGÉE par les 8 familles de `6gen54` (module frère, même
 * principe que `generateurs6e/combinatoire.ts` pour "Analyse combinatoire" : une fondation
 * commune ré-exportée telle quelle, jamais réimplémentée par famille). Aucune trigonométrie/racine
 * carrée n'est nécessaire nulle part dans ce générateur — chaque construction (bissectrice,
 * perpendiculaire, symétrique, sommets d'un carré...) est choisie/paramétrée pour rester dans les
 * rationnels exacts (voir en-tête de chaque `familleX.ts` pour le détail par famille). Voir
 * `docs/historique-6e.md` pour la justification du choix de représentation d'une droite (forme
 * implicite `ax+by+c=0`, jamais `y=mx+p`).
 */

/** Droite passant par `P`, de normale `n` (perpendiculaire à la droite) — brique de base : TOUTES
 * les autres constructions de ce module s'y ramènent. */
export function lignePointNormale(P: Point, n: { x: number; y: number }): Droite {
  return { a: n.x, b: n.y, c: -(n.x * P.x + n.y * P.y) };
}

/** Droite passant par 2 points distincts. Normale = rotation de 90° du vecteur directeur (Q-P). */
export function ligneParDeuxPoints(P: Point, Q: Point): Droite {
  const d = { x: Q.x - P.x, y: Q.y - P.y };
  return lignePointNormale(P, { x: -d.y, y: d.x });
}

/** Droite perpendiculaire à `ligne`, passant par `P` — sa normale est la DIRECTION de `ligne`
 * (`(-ligne.b, ligne.a)`), puisque deux droites sont perpendiculaires ssi leurs normales le sont. */
export function perpendiculairePassantPar(ligne: Droite, P: Point): Droite {
  return lignePointNormale(P, { x: -ligne.b, y: ligne.a });
}

/** Droite parallèle à `ligne`, passant par `P` — même normale que `ligne`. */
export function parallelePassantPar(ligne: Droite, P: Point): Droite {
  return lignePointNormale(P, { x: ligne.a, y: ligne.b });
}

const EPSILON_INTERSECTION = 1e-9;

/** Intersection de deux droites (ou de 2 équations linéaires quelconques en (x,y), ex. le système
 * famille D) par la règle de Cramer — `null` si parallèles/confondues. */
export function intersectionDeuxDroites(d1: Droite, d2: Droite): Point | null {
  const det = d1.a * d2.b - d2.a * d1.b;
  if (Math.abs(det) < EPSILON_INTERSECTION) return null;
  return {
    x: (d1.b * d2.c - d2.b * d1.c) / det,
    y: (d2.a * d1.c - d1.a * d2.c) / det,
  };
}

export function milieu(P: Point, Q: Point): Point {
  return { x: (P.x + Q.x) / 2, y: (P.y + Q.y) / 2 };
}

export function distance(P: Point, Q: Point): number {
  return Math.hypot(Q.x - P.x, Q.y - P.y);
}

export function symetriquePointParRapportAPoint(P: Point, centre: Point): Point {
  return { x: 2 * centre.x - P.x, y: 2 * centre.y - P.y };
}

/** Rotation de +90° (sens trigonométrique). */
export function rotation90(v: { x: number; y: number }): { x: number; y: number } {
  return { x: -v.y, y: v.x };
}

export function determinant(u: { x: number; y: number }, v: { x: number; y: number }): number {
  return u.x * v.y - u.y * v.x;
}

export function pointSurDroite(P: Point, d: Droite, epsilon = 1e-6): boolean {
  return Math.abs(d.a * P.x + d.b * P.y + d.c) <= epsilon;
}

export function pointsEgaux(P: Point, Q: Point, epsilon = 1e-9): boolean {
  return Math.abs(P.x - Q.x) <= epsilon && Math.abs(P.y - Q.y) <= epsilon;
}

/** Pied de la perpendiculaire abaissée depuis `P` sur `ligne`, et l'équation de cette
 * perpendiculaire — brique réutilisée par la famille F (pied de la perpendiculaire vers (AB)) ET
 * par la famille G (pied de la perpendiculaire vers la diagonale/le côté donné, dans les 2
 * sous-types). Ne peut être dégénérée ici : `ligne` a toujours ses coefficients (a,b) non tous nuls
 * par construction dans tout appelant de ce générateur. */
export function piedPerpendiculaire(P: Point, ligne: Droite): { perpendiculaire: Droite; pied: Point } {
  const perpendiculaire = perpendiculairePassantPar(ligne, P);
  const pied = intersectionDeuxDroites(ligne, perpendiculaire);
  /* c8 ignore next */
  if (pied === null) throw new Error("piedPerpendiculaire : intersection dégénérée (ne devrait jamais se produire)");
  return { perpendiculaire, pied };
}

/** Vecteurs de longueur ENTIÈRE exacte (triplets pythagoriciens 3-4-5/6-8-10/5-12-13 + vecteurs
 * axiaux), toutes orientations (8 rotations/réflexions pour un triplet non dégénéré, 4 pour un
 * vecteur axial) — utilisé par la famille B pour garantir des longueurs AB/BC entières (sans quoi
 * le rapport de la bissectrice ne serait pas un rapport d'entiers "propre"). */
function variantesSignes(dx: number, dy: number, longueur: number): { dx: number; dy: number; longueur: number }[] {
  const base = dx === dy || dx === -dy ? [[dx, dy]] : [[dx, dy], [dy, dx]];
  const variantes = new Map<string, { dx: number; dy: number; longueur: number }>();
  for (const [x, y] of base) {
    for (const sx of [1, -1]) {
      for (const sy of [1, -1]) {
        const v = { dx: sx * x, dy: sy * y, longueur };
        variantes.set(`${v.dx},${v.dy}`, v);
      }
    }
  }
  return [...variantes.values()];
}

export const VECTEURS_LONGUEUR_ENTIERE: { dx: number; dy: number; longueur: number }[] = [
  ...variantesSignes(3, 4, 5),
  ...variantesSignes(6, 8, 10),
  ...variantesSignes(5, 12, 13),
  ...variantesSignes(0, 4, 4),
  ...variantesSignes(0, 5, 5),
  ...variantesSignes(0, 6, 6),
];

/** Directions à composantes entières COPREMIÈRES (dénominateurs "propres" pour un paramétrage
 * `C(t)=P0+t·dir`, famille C) — jamais axiales seules, pour varier la présentation. */
export const DIRECTIONS_COPREMIERES: { x: number; y: number }[] = [
  { x: 1, y: 0 },
  { x: 0, y: 1 },
  { x: 1, y: 1 },
  { x: 1, y: -1 },
  { x: 1, y: 2 },
  { x: 2, y: 1 },
  { x: 1, y: 3 },
  { x: 3, y: 1 },
  { x: 2, y: 3 },
  { x: 3, y: 2 },
];
