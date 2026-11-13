import type { Composantes, Point } from "../core/vecteur.types";
import type { Deplacement, Direction, ExerciceDeplacementsSuccessifs, SituationDeplacements } from "../core/deplacementsSuccessifs.types";

/**
 * Modèle de gen86 : traduction des instructions en vecteurs, positions successives, vecteurs et
 * distances attendus à chaque écran. Une seule source pour l'écran, les aides, la vérification, la
 * figure et l'adaptateur de feuilles.
 */

export type Ecran = "traduire" | "total" | "distance" | "retour" | "cible" | "k";

const UNITAIRES: Record<Direction, Composantes> = {
  E: { x: 1, y: 0 },
  O: { x: -1, y: 0 },
  N: { x: 0, y: 1 },
  S: { x: 0, y: -1 },
  NE: { x: 1, y: 1 },
  NO: { x: -1, y: 1 },
  SE: { x: 1, y: -1 },
  SO: { x: -1, y: -1 },
};

export function estDiagonale(d: Direction): boolean {
  return d.length === 2;
}

export function unitaire(d: Direction): Composantes {
  return UNITAIRES[d];
}

/** −0 → 0. */
function net(n: number): number {
  return n === 0 ? 0 : n;
}

export function composantes(d: Deplacement): Composantes {
  const u = UNITAIRES[d.direction];
  return { x: net(u.x * d.longueur), y: net(u.y * d.longueur) };
}

/** Longueur réellement parcourue pendant un déplacement (diagonale : √2 par pas). */
export function longueurParcourue(d: Deplacement): number {
  return estDiagonale(d.direction) ? d.longueur * Math.SQRT2 : d.longueur;
}

export function somme(vecteurs: Composantes[]): Composantes {
  return vecteurs.reduce((s, v) => ({ x: net(s.x + v.x), y: net(s.y + v.y) }), { x: 0, y: 0 });
}

export function oppose(v: Composantes): Composantes {
  return { x: net(-v.x), y: net(-v.y) };
}

export function difference(arrivee: Point, depart: Point): Composantes {
  return { x: net(arrivee.x - depart.x), y: net(arrivee.y - depart.y) };
}

export function norme(v: Composantes): number {
  return Math.hypot(v.x, v.y);
}

export function carreNorme(v: Composantes): number {
  return v.x * v.x + v.y * v.y;
}

/** Vecteurs des déplacements successifs u1, u2… */
export function vecteursDeplacements(e: ExerciceDeplacementsSuccessifs): Composantes[] {
  return e.deplacements.map(composantes);
}

/** Positions successives après chaque déplacement (la dernière est A, P ou R). */
export function positions(e: ExerciceDeplacementsSuccessifs): Point[] {
  const resultat: Point[] = [];
  let courant: Point = { x: 0, y: 0 };
  for (const v of vecteursDeplacements(e)) {
    courant = { x: net(courant.x + v.x), y: net(courant.y + v.y) };
    resultat.push(courant);
  }
  return resultat;
}

/** Déplacement total DA / DP / DR (Chasles). */
export function total(e: ExerciceDeplacementsSuccessifs): Composantes {
  return somme(vecteursDeplacements(e));
}

/** Nom du point d'arrivée des instructions : A (retour), P (dernier), R (rocher, repetition). */
export function nomArrivee(e: ExerciceDeplacementsSuccessifs): string {
  return e.question === "retour" ? "A" : e.question === "dernier" ? "P" : "R";
}

/** Nom de la cible : C (dernier) ou T (trésor, repetition) ; `null` pour le retour. */
export function nomCible(e: ExerciceDeplacementsSuccessifs): string | null {
  return e.question === "dernier" ? "C" : e.question === "repetition" ? "T" : null;
}

/** Vecteur de l'arrivée à la cible : PC ou RT. */
export function vecteurCible(e: ExerciceDeplacementsSuccessifs): Composantes {
  return difference(e.cible ?? { x: 0, y: 0 }, total(e));
}

/** Vecteur de retour AD (opposé de DA). */
export function vecteurRetour(e: ExerciceDeplacementsSuccessifs): Composantes {
  return oppose(total(e));
}

/** Vecteur dont on demande la norme : DA (retour), PC (dernier), RT (repetition). */
export function vecteurDistance(e: ExerciceDeplacementsSuccessifs): Composantes {
  return e.question === "retour" ? total(e) : vecteurCible(e);
}

export function distance(e: ExerciceDeplacementsSuccessifs): number {
  return norme(vecteurDistance(e));
}

/** Ordre des écrans selon la question. */
export function ecrans(e: ExerciceDeplacementsSuccessifs): Ecran[] {
  if (e.question === "retour") return ["traduire", "total", "distance", "retour"];
  if (e.question === "dernier") return ["traduire", "total", "cible", "distance"];
  return ["traduire", "total", "cible", "k", "distance"];
}

export function nombreEcrans(e: ExerciceDeplacementsSuccessifs): number {
  return ecrans(e).length;
}

/** Lettre d'étape (« a », « b »…) d'un écran. */
export function lettreEcran(e: ExerciceDeplacementsSuccessifs, ecran: Ecran): string {
  return "abcde"[ecrans(e).indexOf(ecran)]!;
}

/**
 * Valeur du piège « distance parcourue » pour la distance demandée : somme des longueurs des étapes
 * (retour), trajet en suivant le quadrillage (dernier : |a| + |b| ; repetition : k fois le grand pas
 * marché case par case).
 */
export function distanceParcourue(e: ExerciceDeplacementsSuccessifs): number {
  if (e.question === "retour") return e.deplacements.reduce((s, d) => s + longueurParcourue(d), 0);
  const v = vecteurDistance(e);
  return Math.abs(v.x) + Math.abs(v.y);
}

/** Échelle de la figure : une case = 1 pas, 1 km ou 100 m. */
export function echelle(situation: SituationDeplacements): number {
  return situation === "drone" ? 100 : 1;
}

/** Précision de l'arrondi : 0,1 pas, 0,1 km ou 1 m. */
export function pasArrondi(situation: SituationDeplacements): number {
  return situation === "drone" ? 1 : 0.1;
}

/** Distance arrondie à la précision de la consigne. */
export function distanceArrondie(e: ExerciceDeplacementsSuccessifs): number {
  const p = pasArrondi(e.situation);
  return Math.round(Math.round(distance(e) / p) * p * 1000) / 1000;
}

/** Racine simplifiée : n = a²·b avec b sans facteur carré. */
export function simplifierRacine(n: number): { a: number; b: number } {
  let a = 1;
  let b = n;
  for (let f = 2; f * f <= b; f++) {
    while (b % (f * f) === 0) {
      b /= f * f;
      a *= f;
    }
  }
  return { a, b };
}

/** La distance demandée est-elle entière (vecteur sur un axe) ? */
export function distanceEntiere(e: ExerciceDeplacementsSuccessifs): boolean {
  return simplifierRacine(carreNorme(vecteurDistance(e))).b === 1;
}

/** Cas particulier : le vecteur dont on demande la norme est porté par un axe (distance immédiate). */
export function surUnAxe(e: ExerciceDeplacementsSuccessifs): boolean {
  const v = vecteurDistance(e);
  return v.x === 0 || v.y === 0;
}
