/**
 * Couche A — "Comparaison visuelle de vecteurs sur figure" (chapitre "Calcul vectoriel, deuxième
 * générateur). Tire 2 ou 3 vecteurs de base, puis dérive tous les autres vecteurs affichés par des
 * transformations garanties exactes (translation = mêmes composantes, nouvel ancrage ; multiple
 * scalaire) — jamais un vecteur construit indépendamment, pour que toute relation demandée soit
 * vraie par construction (spec, section "Génération de la figure").
 */
import type {
  ExerciceComparaisonVecteurs,
  GenerateurExerciceComparaisonVecteurs,
  ProprieteComparaison,
  VecteurFigureCompare,
} from "../../core/comparaisonVecteurs.types";
import { randomInt } from "./aleatoire";

const ALPHABET = "abcdefghijklmnopqrstuvwxyz";
const MULTIPLES_NON_TRIVIAUX = [-3, -2, -1, 2, 3];
const PROPRIETES: ProprieteComparaison[] = ["longueur", "direction", "sens"];

/** Lisibilité de la figure (audit chapitre 6, gen28) : composantes de base dans [−3 ; 3] et de
 * longueur au moins 3 (un vecteur plus court se réduisait à sa tête de flèche sur smartphone),
 * aucune composante affichée au-delà de 6 en valeur absolue, et toute la figure tient dans
 * [−BORNE_X ; BORNE_X] × [−BORNE_Y ; BORNE_Y] — un rectangle au format 3:2 du graphe, pour ne pas
 * gaspiller de largeur — avec un quadrillage au pas de 1 sur les deux axes (`VecteurGraph.pasGrille`),
 * les longueurs se comptent réellement en carrés. */
const COMPOSANTE_BASE_MAX = 3;
const NORME_CARREE_BASE_MIN = 9;
const COMPOSANTE_MAX = 6;
const BORNE_X = 8;
const BORNE_Y = 5;
/** Deux segments parallèles plus proches que cette distance (et qui se recouvrent en projection)
 * se confondent visuellement — rejetés au placement, comme deux segments colinéaires sur la même
 * droite qui se touchent ou se recouvrent. */
const ECART_PARALLELE_MIN = 1;
/** Écart minimal entre deux segments quelconques (jamais de croisement) et entre leurs milieux, là
 * où se placent les étiquettes : sans lui, les étiquettes s'empilaient à 390 px. */
const ECART_SEGMENTS_MIN = 1.5;
const ECART_MILIEUX_MIN = 3;
const ESSAIS_PLACEMENT = 200;

type Vec = { x: number; y: number };

function produitEnCroix(u: Vec, v: Vec): number {
  return u.x * v.y - u.y * v.x;
}

function produitScalaire(u: Vec, v: Vec): number {
  return u.x * v.x + u.y * v.y;
}

function vecteurAleatoire(): Vec {
  let v = { x: 0, y: 0 };
  while (produitScalaire(v, v) < NORME_CARREE_BASE_MIN) {
    v = { x: randomInt(-COMPOSANTE_BASE_MAX, COMPOSANTE_BASE_MAX), y: randomInt(-COMPOSANTE_BASE_MAX, COMPOSANTE_BASE_MAX) };
  }
  return v;
}

/** Deux segments [o1 ; o1+v1] et [o2 ; o2+v2] se confondraient à l'œil : colinéaires sur la même
 * droite avec moins d'une unité d'écart entre eux (ou un recouvrement), ou parallèles à moins de
 * `ECART_PARALLELE_MIN` avec un recouvrement en projection. Deux flèches identiques (même origine,
 * mêmes composantes) tombent dans le premier cas. */
function seConfondent(o1: Vec, v1: Vec, o2: Vec, v2: Vec): boolean {
  if (produitEnCroix(v1, v2) !== 0) return false;
  const longueur = Math.hypot(v1.x, v1.y);
  const ux = v1.x / longueur;
  const uy = v1.y / longueur;
  const d = { x: o2.x - o1.x, y: o2.y - o1.y };
  const distanceDroites = Math.abs(produitEnCroix({ x: ux, y: uy }, d));
  const projeter = (p: Vec) => (p.x - o1.x) * ux + (p.y - o1.y) * uy;
  const a1 = 0;
  const b1 = longueur;
  const p2a = projeter(o2);
  const p2b = projeter({ x: o2.x + v2.x, y: o2.y + v2.y });
  const a2 = Math.min(p2a, p2b);
  const b2 = Math.max(p2a, p2b);
  if (distanceDroites < 1e-9) {
    // Même droite : il faut au moins une unité d'écart entre les deux segments.
    return a2 < b1 + 1 && a1 < b2 + 1;
  }
  if (distanceDroites < ECART_PARALLELE_MIN) {
    return a2 < b1 && a1 < b2;
  }
  return false;
}

function distancePointSegment(p: Vec, a: Vec, b: Vec): number {
  const ab = { x: b.x - a.x, y: b.y - a.y };
  const t = Math.max(0, Math.min(1, produitScalaire({ x: p.x - a.x, y: p.y - a.y }, ab) / produitScalaire(ab, ab)));
  return Math.hypot(p.x - (a.x + t * ab.x), p.y - (a.y + t * ab.y));
}

function segmentsSeCoupent(a: Vec, b: Vec, c: Vec, d: Vec): boolean {
  const cote = (p: Vec, q: Vec, r: Vec) => Math.sign(produitEnCroix({ x: q.x - p.x, y: q.y - p.y }, { x: r.x - p.x, y: r.y - p.y }));
  return cote(a, b, c) * cote(a, b, d) < 0 && cote(c, d, a) * cote(c, d, b) < 0;
}

/** Distance entre les segments [a ; b] et [c ; d] (0 s'ils se coupent). */
function distanceSegments(a: Vec, b: Vec, c: Vec, d: Vec): number {
  if (segmentsSeCoupent(a, b, c, d)) return 0;
  return Math.min(distancePointSegment(a, c, d), distancePointSegment(b, c, d), distancePointSegment(c, a, b), distancePointSegment(d, a, b));
}

function tropProches(o1: Vec, v1: Vec, o2: Vec, v2: Vec): boolean {
  const e1 = { x: o1.x + v1.x, y: o1.y + v1.y };
  const e2 = { x: o2.x + v2.x, y: o2.y + v2.y };
  const milieux = Math.hypot(o1.x + v1.x / 2 - (o2.x + v2.x / 2), o1.y + v1.y / 2 - (o2.y + v2.y / 2));
  return distanceSegments(o1, e1, o2, e2) < ECART_SEGMENTS_MIN || milieux < ECART_MILIEUX_MIN;
}

/** Ancrage aléatoire tel que tout le vecteur tienne dans la figure, ne se confonde avec aucun
 * vecteur déjà placé et ne s'en approche pas trop — `null` si aucun essai ne convient (l'appelant
 * recommence l'exercice). */
function placer(composantes: Vec, deja: VecteurFigureCompare[]): Vec | null {
  for (let essai = 0; essai < ESSAIS_PLACEMENT; essai++) {
    const xMin = Math.max(-BORNE_X, -BORNE_X - composantes.x);
    const xMax = Math.min(BORNE_X, BORNE_X - composantes.x);
    const yMin = Math.max(-BORNE_Y, -BORNE_Y - composantes.y);
    const yMax = Math.min(BORNE_Y, BORNE_Y - composantes.y);
    if (xMin > xMax || yMin > yMax) return null;
    const origine = { x: randomInt(xMin, xMax), y: randomInt(yMin, yMax) };
    if (deja.every((v) => !seConfondent(v.origine, v.composantes, origine, composantes) && !tropProches(v.origine, v.composantes, origine, composantes))) {
      return origine;
    }
  }
  return null;
}

/** Satisfait `propriete` par rapport à la référence — calculé à partir des COMPOSANTES réelles
 * (audit chapitre 6 : l'ancienne règle « issu de la même base » excluait des vecteurs d'autres
 * bases qui partagent pourtant la propriété, ex. (0 ; 2) et (2 ; 0) de même longueur). */
function satisfaitPropriete(v: Vec, reference: Vec, propriete: ProprieteComparaison): boolean {
  if (propriete === "longueur") return produitScalaire(v, v) === produitScalaire(reference, reference);
  if (produitEnCroix(v, reference) !== 0) return false;
  return propriete === "direction" || produitScalaire(v, reference) > 0;
}

function coefficientForcePour(propriete: ProprieteComparaison): number {
  if (propriete === "longueur") return Math.random() < 0.5 ? 1 : -1;
  if (propriete === "sens") return [1, 2, 3][randomInt(0, 2)];
  return [1, ...MULTIPLES_NON_TRIVIAUX][randomInt(0, MULTIPLES_NON_TRIVIAUX.length)];
}

function multipleLisible(base: Vec, coefficient: number): boolean {
  return Math.abs(coefficient * base.x) <= COMPOSANTE_MAX && Math.abs(coefficient * base.y) <= COMPOSANTE_MAX;
}

/** Une tentative de construction — `null` si un placement échoue (l'appelant recommence). */
function tenterConstruction(propriete: ProprieteComparaison): ExerciceComparaisonVecteurs | null {
  const nombreBases = randomInt(2, 3);
  const bases: Vec[] = [];
  while (bases.length < nombreBases) {
    const candidat = vecteurAleatoire();
    // Bases deux à deux non colinéaires : seule la base 0 fournit des vecteurs colinéaires à la
    // référence, donc tout coefficient de l'étape « égalité » reste un entier lisible.
    if (bases.every((b) => produitEnCroix(b, candidat) !== 0)) bases.push(candidat);
  }

  const vecteurs: VecteurFigureCompare[] = [];
  for (let i = 0; i < nombreBases; i++) {
    const origine = placer(bases[i], vecteurs);
    if (!origine) return null;
    vecteurs.push({ label: ALPHABET[i], origine, composantes: bases[i], indexBase: i, coefficientBase: 1 });
  }

  const nombreDerives = randomInt(3, 5);
  for (let i = 0; i < nombreDerives; i++) {
    const indexBase = randomInt(0, nombreBases - 1);
    const base = bases[indexBase];
    let coefficientBase = 1;
    if (Math.random() >= 0.5) {
      const possibles = MULTIPLES_NON_TRIVIAUX.filter((k) => multipleLisible(base, k));
      coefficientBase = possibles[randomInt(0, possibles.length - 1)];
    }
    const composantes = { x: coefficientBase * base.x, y: coefficientBase * base.y };
    const origine = placer(composantes, vecteurs);
    if (!origine) return null;
    vecteurs.push({ label: ALPHABET[vecteurs.length], origine, composantes, indexBase, coefficientBase });
  }

  const reference = vecteurs[0];
  const labelReference = reference.label;
  const correctsColineaires = () =>
    vecteurs.filter(
      (v) =>
        v.label !== labelReference &&
        satisfaitPropriete(v.composantes, reference.composantes, propriete) &&
        produitEnCroix(v.composantes, reference.composantes) === 0,
    );

  // L'étape « égalité » exige un vecteur colinéaire à la référence parmi les bonnes réponses
  // (pour « longueur », un vecteur de même longueur d'une autre direction ne s'écrit pas k·a).
  if (correctsColineaires().length === 0) {
    const possibles = [coefficientForcePour(propriete)].filter((k) => multipleLisible(bases[0], k));
    const coefficientBase = possibles[0] ?? 1;
    const composantes = { x: coefficientBase * bases[0].x, y: coefficientBase * bases[0].y };
    const origine = placer(composantes, vecteurs);
    if (!origine) return null;
    vecteurs.push({ label: ALPHABET[vecteurs.length], origine, composantes, indexBase: 0, coefficientBase });
  }

  const labelsCorrects = vecteurs
    .filter((v) => v.label !== labelReference && satisfaitPropriete(v.composantes, reference.composantes, propriete))
    .map((v) => v.label);
  const candidatsEgalite = correctsColineaires();
  const cible = candidatsEgalite[randomInt(0, candidatsEgalite.length - 1)];

  return {
    vecteurs,
    labelReference,
    propriete,
    labelsCorrects,
    cibleEgalite: cible.label,
    coefficientEgalite: cible.coefficientBase,
  };
}

/**
 * Joue le rôle de `construireAvecVarianteId` pour ce générateur (convention RETROFIT-variantes-
 * generateurs.md) — `propriete` forcée plutôt que tirée aléatoirement.
 */
function construireAvecPropriete(propriete: ProprieteComparaison): ExerciceComparaisonVecteurs {
  for (;;) {
    const exercice = tenterConstruction(propriete);
    if (exercice) return exercice;
  }
}

export function construireAvecVarianteId(varianteId: ProprieteComparaison): ExerciceComparaisonVecteurs {
  return construireAvecPropriete(varianteId);
}

export const CATALOGUE_VARIANTES: { id: ProprieteComparaison; label: string }[] = [
  { id: "longueur", label: "Longueur" },
  { id: "direction", label: "Direction" },
  { id: "sens", label: "Sens" },
];

export function genererExerciceComparaisonVecteurs(): ExerciceComparaisonVecteurs {
  const propriete = PROPRIETES[randomInt(0, PROPRIETES.length - 1)];
  return construireAvecPropriete(propriete);
}

export const genererExercice: GenerateurExerciceComparaisonVecteurs = genererExerciceComparaisonVecteurs;
