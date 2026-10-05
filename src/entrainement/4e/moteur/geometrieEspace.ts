import type { DroiteSolide3D, PlanSolide3D, Point3D, Solide3D } from "../core/geometrieEspace.types";

/**
 * Moteur de vérité terrain — géométrie 3D partagée par les 3 générateurs du chapitre "Géométrie
 * dans l'espace" (import moteur→moteur depuis leurs propres modules `verificationXxx.ts`, comme
 * `moteur/verificationTriangle.ts` pour le chapitre 3). Arithmétique 3D interne, jamais montrée à
 * l'élève sous forme numérique NI nommée mathématiquement dans le texte affiché — les fonctions
 * `produitVectoriel3D`/`produitScalaire3D` restent des primitives de CALCUL, jamais mentionnées
 * comme "produit vectoriel"/"produit scalaire" côté présentation (même convention que
 * `produitPourOrthogonalite`, chapitre 4).
 */

export const EPSILON_3D = 1e-6;

export function soustraire3D(a: Point3D, b: Point3D): Point3D {
  return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
}

export function additionner3D(a: Point3D, b: Point3D): Point3D {
  return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z };
}

export function multiplierScalaire3D(v: Point3D, k: number): Point3D {
  return { x: v.x * k, y: v.y * k, z: v.z * k };
}

export function produitVectoriel3D(a: Point3D, b: Point3D): Point3D {
  return {
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x,
  };
}

export function produitScalaire3D(a: Point3D, b: Point3D): number {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}

export function normeCarree3D(v: Point3D): number {
  return produitScalaire3D(v, v);
}

export function distance3D(a: Point3D, b: Point3D): number {
  return Math.sqrt(normeCarree3D(soustraire3D(a, b)));
}

function sommet(solide: Solide3D, nom: string): Point3D {
  const point = solide.sommets[nom];
  if (!point) throw new Error(`Sommet inconnu : ${nom}`);
  return point;
}

/** Normale (non normalisée) du plan défini par 3 sommets — direction seulement, jamais montrée. */
export function normalePlan(p1: Point3D, p2: Point3D, p3: Point3D): Point3D {
  return produitVectoriel3D(soustraire3D(p2, p1), soustraire3D(p3, p1));
}

/** Deux vecteurs colinéaires (parallèles), y compris de sens opposé — produit vectoriel ≈ nul. */
export function sontParalleles3D(v1: Point3D, v2: Point3D): boolean {
  return normeCarree3D(produitVectoriel3D(v1, v2)) < EPSILON_3D;
}

/** Un point appartient au plan défini par 3 sommets (test par produit mixte : le point et les 3
 * sommets sont coplanaires ssi (p2-p1, p3-p1, point-p1) a un produit mixte nul). */
export function pointAppartientAuPlan(point: Point3D, plan: [Point3D, Point3D, Point3D]): boolean {
  const [p1, p2, p3] = plan;
  const normale = normalePlan(p1, p2, p3);
  return Math.abs(produitScalaire3D(normale, soustraire3D(point, p1))) < EPSILON_3D;
}

/** Une droite (direction) est parallèle au plan ssi sa direction est orthogonale à la normale du
 * plan — équivalent à "parallèle à une droite du plan", jamais testé littéralement ainsi (plus
 * direct et robuste). */
export function droiteParalleleAuPlan(direction: Point3D, plan: [Point3D, Point3D, Point3D]): boolean {
  const [p1, p2, p3] = plan;
  const normale = normalePlan(p1, p2, p3);
  return Math.abs(produitScalaire3D(normale, direction)) < EPSILON_3D;
}

export type ClassificationDroitePlan = "incluse" | "parallele" | "secante";

/**
 * Classification en 3 étapes, exactement la décomposition pédagogique du générateur "Position
 * d'une droite par rapport à un plan" : (1) les 2 points de la droite appartiennent-ils tous deux
 * au plan ? → incluse. (2) Sinon, la direction de la droite est-elle parallèle au plan ? →
 * parallèle. (3) Sinon → sécante.
 */
export function classifierDroitePlan(solide: Solide3D, droite: DroiteSolide3D, plan: PlanSolide3D): ClassificationDroitePlan {
  const [nomA, nomB] = droite;
  const a = sommet(solide, nomA);
  const b = sommet(solide, nomB);
  const planPoints: [Point3D, Point3D, Point3D] = [sommet(solide, plan[0]), sommet(solide, plan[1]), sommet(solide, plan[2])];

  if (pointAppartientAuPlan(a, planPoints) && pointAppartientAuPlan(b, planPoints)) return "incluse";

  const direction = soustraire3D(b, a);
  if (droiteParalleleAuPlan(direction, planPoints)) return "parallele";

  return "secante";
}

/**
 * Intersection d'une droite (2 points) avec un plan (3 points) — `null` si la droite est parallèle
 * au plan (incluse ou strictement parallèle, jamais de point unique dans les deux cas). Le plan
 * est considéré INFINI (jamais borné aux faces du solide) — c'est précisément le piège ciblé par
 * la spec : une droite peut être sécante hors du solide lui-même.
 */
export function intersectionDroitePlan(droite: [Point3D, Point3D], plan: [Point3D, Point3D, Point3D]): Point3D | null {
  const [a, b] = droite;
  const [p1] = plan;
  const normale = normalePlan(...plan);
  const direction = soustraire3D(b, a);
  const denominateur = produitScalaire3D(normale, direction);
  if (Math.abs(denominateur) < EPSILON_3D) return null;
  const t = produitScalaire3D(normale, soustraire3D(p1, a)) / denominateur;
  return additionner3D(a, multiplierScalaire3D(direction, t));
}

/**
 * Intersection de 2 droites (2 points chacune) — `null` si parallèles OU non coplanaires (droites
 * "gauches" en 3D, qui ne se croisent jamais). Utilisée pour la construction d'un point auxiliaire
 * ("Section plane d'un solide") : prolonger 2 droites coplanaires jusqu'à leur point de croisement.
 */
export function intersectionDeuxDroites3D(d1: [Point3D, Point3D], d2: [Point3D, Point3D]): Point3D | null {
  const dir1 = soustraire3D(d1[1], d1[0]);
  const dir2 = soustraire3D(d2[1], d2[0]);
  const r = soustraire3D(d2[0], d1[0]);
  const croise = produitVectoriel3D(dir1, dir2);
  const normeCarreeCroise = normeCarree3D(croise);
  if (normeCarreeCroise < EPSILON_3D) return null; // droites parallèles (ou confondues)

  const t = produitScalaire3D(produitVectoriel3D(r, dir2), croise) / normeCarreeCroise;
  const point = additionner3D(d1[0], multiplierScalaire3D(dir1, t));

  // Vérifie que le point calculé appartient RÉELLEMENT aussi à d2 — sinon les 2 droites ne sont
  // pas coplanaires (droites gauches), aucune intersection valide n'existe.
  const versPoint = soustraire3D(point, d2[0]);
  const ecart = produitVectoriel3D(versPoint, dir2);
  if (normeCarree3D(ecart) > EPSILON_3D) return null;

  return point;
}

/** Le nom du sommet du solide qui coïncide exactement avec `point`, ou `null`. */
export function sommetCoincidant(solide: Solide3D, point: Point3D): string | null {
  for (const [nom, position] of Object.entries(solide.sommets)) {
    if (distance3D(position, point) < EPSILON_3D) return nom;
  }
  return null;
}

/** `point` appartient au segment [a,b] — colinéaire ET strictement entre les 2 bornes (ni
 * confondu avec une extrémité, ni au-delà). */
export function pointSurSegmentOuvert(point: Point3D, a: Point3D, b: Point3D): boolean {
  const direction = soustraire3D(b, a);
  const versPoint = soustraire3D(point, a);
  if (normeCarree3D(produitVectoriel3D(direction, versPoint)) > EPSILON_3D) return false; // pas colinéaire
  const longueurCarree = normeCarree3D(direction);
  const t = produitScalaire3D(versPoint, direction) / longueurCarree;
  return t > EPSILON_3D && t < 1 - EPSILON_3D;
}

/** 3 points colinéaires (a, b et c alignés) — utilisé par la vérification du point auxiliaire de
 * "Section plane d'un solide" pour vérifier qu'un point auxiliaire I, une fois relié à un point déjà
 * connu Y, tombe bien sur la même droite que le point de section manquant X (jamais une vérification
 * de "strictement entre" comme `pointSurSegmentOuvert` — I est typiquement HORS du segment [Y,X],
 * au-delà d'une extrémité). */
export function points3Colineaires(a: Point3D, b: Point3D, c: Point3D): boolean {
  return sontParalleles3D(soustraire3D(b, a), soustraire3D(c, a));
}

const AXES_3D = ["x", "y", "z"] as const;
type Axe3D = (typeof AXES_3D)[number];

/** Intersection d'un rayon (origine+direction) avec UNE face rectangulaire AXIS-ALIGNED (un seul
 * axe constant sur tous les sommets de la face, les 2 autres bornés) — jamais une face orientée
 * librement, hypothèse valable pour tous les gabarits du chapitre (cube, parallélépipède, escalier).
 * `null` si le rayon est parallèle à la face, si l'intersection est derrière l'origine
 * (`t<=EPSILON_3D`), ou si elle tombe hors des bornes finies du rectangle. */
export function intersectionAvecFaceRectangle(origine: Point3D, direction: Point3D, solide: Solide3D, face: string[]): Point3D | null {
  const points = face.map((nom) => sommet(solide, nom));
  const axeFixe = AXES_3D.find((axe) => points.every((p) => Math.abs(p[axe] - points[0][axe]) < EPSILON_3D));
  if (!axeFixe) return null;

  const d = direction[axeFixe];
  if (Math.abs(d) < EPSILON_3D) return null;
  const t = (points[0][axeFixe] - origine[axeFixe]) / d;
  if (t <= EPSILON_3D) return null;

  const candidat = additionner3D(origine, multiplierScalaire3D(direction, t));
  for (const axe of AXES_3D) {
    if (axe === axeFixe) continue;
    const valeurs = points.map((p) => p[axe]);
    const min = Math.min(...valeurs);
    const max = Math.max(...valeurs);
    if (candidat[axe] < min - EPSILON_3D || candidat[axe] > max + EPSILON_3D) return null;
  }
  return candidat;
}

/** Intersection d'un rayon avec un solide ENTIER — première face réellement touchée (t minimal
 * parmi toutes les faces), jamais une face arbitraire : un solide opaque bloque le rayon à sa
 * surface la plus proche. `null` si aucune face n'est touchée. */
export function intersectionAvecSolide(origine: Point3D, direction: Point3D, solide: Solide3D): Point3D | null {
  const axe: Axe3D | undefined = AXES_3D.find((a) => Math.abs(direction[a]) >= EPSILON_3D);
  if (!axe) return null;

  let meilleurT = Infinity;
  let meilleurPoint: Point3D | null = null;
  for (const face of solide.faces) {
    const point = intersectionAvecFaceRectangle(origine, direction, solide, face);
    if (!point) continue;
    const t = (point[axe] - origine[axe]) / direction[axe];
    if (t < meilleurT) {
      meilleurT = t;
      meilleurPoint = point;
    }
  }
  return meilleurPoint;
}
