import type { Composantes, ExerciceConstruireSomme, MethodeConstruireSomme, Point, VarianteConstruireSomme } from "../../core/construireSomme.types";
import { coefficientsEffectifs, distanceSegment, ecrans, etendue, memePoint, plus, poigneeInitiale, pointsAVoir, pointsABC, pointFinal } from "../../moteur/modeleConstruireSomme";

/**
 * Générateur de « Construire une somme, une différence, un point » (gen83). Tout le hasard passe
 * par `Math.random` : `genererAvecCode` (`export/codeExercice.ts`) le remplace par une graine, et le
 * QR code d'une feuille rouvre ainsi le MÊME exercice.
 *
 * Garanties (vérifiées par tirages massifs) :
 * - tout vecteur donné fait au moins 3 carreaux de déplacement (2 s'il est à composantes paires) ;
 * - toutes les composantes, tous les points (données, étapes, extrémités) sont des entiers ;
 * - tout ce qui doit être vu ou atteint tient dans 11 × 7 carreaux (quadrillage lisible à 390 px) ;
 * - u et v nettement non colinéaires (angle d'au moins 15° environ), sauf le cas particulier
 *   (≈ 1/8 en somme, différence, combinaison) ;
 * - un vecteur dessiné « ailleurs » (méthode du triangle, de l'opposé, combinaison, lecture) ne part
 *   ni de O, ni de l'extrémité de u, ne croise pas l'autre vecteur donné et passe à au moins un
 *   carreau des points ET des flèches de la construction (aucune origine suggérée) ;
 * - variante point : AB et AC d'au moins 2,5 carreaux, bien écartés ; P distinct de A, B, C ; M à
 *   au moins 2 carreaux de A, B, C ; la flèche PM passe à au moins 0,9 carreau des points donnés ;
 * - aucune construction n'aboutit à son origine (vecteur nul).
 */

function entier(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function choisir<T>(liste: readonly T[]): T {
  return liste[Math.floor(Math.random() * liste.length)]!;
}

const LARGEUR_MAX = 11;
const HAUTEUR_MAX = 7;
const PROBA_COLINEAIRES = 1 / 8;

const COEFFICIENTS_COMBINAISON = [-3, -2, -1.5, -1, -0.5, 0.5, 1, 1.5, 2, 3] as const;
const COEFFICIENTS_POINT = [-2, -1, -0.5, 0.5, 1, 2, 3] as const;

function estDemi(k: number): boolean {
  return !Number.isInteger(k);
}

/** Vecteur à composantes entières de [−max ; max], « assez long » (au moins 2 carreaux en tout) ;
 * `pair` : composantes paires (pour un coefficient demi-entier). */
function vecteurAleatoire(max: number, pair: boolean, sansZero = false): Composantes {
  for (;;) {
    let x = entier(-max, max);
    let y = entier(-max, max);
    if (pair) {
      x = 2 * entier(-Math.floor(max / 2), Math.floor(max / 2));
      y = 2 * entier(-Math.floor(max / 2), Math.floor(max / 2));
    }
    if (sansZero && (x === 0 || y === 0)) continue;
    if (Math.abs(x) + Math.abs(y) < (pair ? 2 : 3)) continue;
    return { x, y };
  }
}

function det(a: Composantes, b: Composantes): number {
  return a.x * b.y - a.y * b.x;
}

/** Directions trop proches (angle < 15° environ, ou presque opposées) : flèches qui se
 * superposent, parallélogramme aplati. Hors cas particulier, u et v sont nettement non colinéaires. */
function presqueColineaires(u: Composantes, v: Composantes): boolean {
  return Math.abs(det(u, v)) / (Math.hypot(u.x, u.y) * Math.hypot(v.x, v.y)) < 0.26;
}

function pgcd(a: number, b: number): number {
  return b === 0 ? Math.abs(a) : pgcd(b, a % b);
}

/** Couple colinéaire (cas particulier) : u = a·w, v = b·w, w primitif, a ≠ b. */
function coupleColineaire(pairU: boolean, pairV: boolean, accepter: (a: number, b: number) => boolean): { u: Composantes; v: Composantes } | null {
  for (let essai = 0; essai < 200; essai++) {
    const w = { x: entier(-2, 2), y: entier(-2, 2) };
    if (w.x === 0 && w.y === 0) continue;
    if (pgcd(w.x, w.y) !== 1) continue;
    const a = choisir([-3, -2, -1, 1, 2, 3]);
    const b = choisir([-3, -2, -1, 1, 2, 3]);
    if (a === b || !accepter(a, b)) continue;
    const u = { x: a * w.x, y: a * w.y };
    const v = { x: b * w.x, y: b * w.y };
    if ((pairU && (u.x % 2 !== 0 || u.y % 2 !== 0)) || (pairV && (v.x % 2 !== 0 || v.y % 2 !== 0))) continue;
    if (Math.abs(u.x) > 4 || Math.abs(u.y) > 4 || Math.abs(v.x) > 4 || Math.abs(v.y) > 4) continue;
    // Même longueur minimale que `vecteurAleatoire` (une flèche trop courte se lit mal).
    if (Math.abs(u.x) + Math.abs(u.y) < (pairU ? 2 : 3) || Math.abs(v.x) + Math.abs(v.y) < (pairV ? 2 : 3)) continue;
    return { u, v };
  }
  return null;
}

/** Les segments [P ; P+w] et [Q ; Q+z] se touchent-ils (croisement ou contact) ? */
function segmentsSeTouchent(p: Point, w: Composantes, q: Point, z: Composantes): boolean {
  const d = det(w, z);
  const pq = { x: q.x - p.x, y: q.y - p.y };
  if (d === 0) {
    // Parallèles : se touchent s'ils sont sur la même droite et se chevauchent (ou à < 1 carreau).
    return distanceSegment(q, p, w) < 1 || distanceSegment(plus(q, z), p, w) < 1 || distanceSegment(p, q, z) < 1 || distanceSegment(plus(p, w), q, z) < 1;
  }
  const t = det(pq, z) / d;
  const s = det(pq, w) / d;
  if (t >= -0.05 && t <= 1.05 && s >= -0.05 && s <= 1.05) return true;
  return distanceSegment(q, p, w) < 0.9 || distanceSegment(plus(q, z), p, w) < 0.9 || distanceSegment(p, q, z) < 0.9 || distanceSegment(plus(p, w), q, z) < 0.9;
}

/** Un vecteur dessiné « ailleurs » (origine libre de l'énoncé) passe loin des points de la
 * construction et de l'autre vecteur donné. */
function dessinLibreAcceptable(e: ExerciceConstruireSomme, origine: Point, w: Composantes, autres: { origine: Point; w: Composantes }[]): boolean {
  const pointsConstruction = ecrans(e).flatMap((ec) => (ec.type === "construction" ? [ec.origine, ec.attendu] : []));
  const aEviter = [e.O, ...pointsConstruction];
  if (aEviter.some((q) => distanceSegment(q, origine, w) < 1)) return false;
  // Ni contact avec une flèche de la construction (elle se lirait comme une étape).
  const fleches = ecrans(e).flatMap((ec) => (ec.type === "construction" ? [{ origine: ec.origine, w: { x: ec.attendu.x - ec.origine.x, y: ec.attendu.y - ec.origine.y } }] : []));
  return [...autres, ...fleches].every((a) => !segmentsSeTouchent(origine, w, a.origine, a.w));
}

function tientDansLaGrille(e: ExerciceConstruireSomme): boolean {
  const { largeur, hauteur } = etendue(pointsAVoir(e));
  return largeur <= LARGEUR_MAX && hauteur <= HAUTEUR_MAX;
}

/** Recentre l'exercice (aucun axe affiché : seule la forme compte) pour des coordonnées modérées. */
function recentrer(e: ExerciceConstruireSomme): ExerciceConstruireSomme {
  const { largeur, hauteur, minX, minY } = etendue(pointsAVoir(e));
  const d = { x: -minX - Math.floor(largeur / 2), y: -minY - Math.floor(hauteur / 2) };
  const t = (p: Point) => plus(p, d);
  return { ...e, O: t(e.O), origineU: t(e.origineU), origineV: t(e.origineV) };
}

/** Place un dessin libre : origine tirée au hasard parmi celles qui gardent tout dans la grille
 * (points de la construction, poignées, autres dessins déjà placés) ; `null` si aucune ne convient. */
function placerLibre(e: ExerciceConstruireSomme, w: Composantes, autres: { origine: Point; w: Composantes }[]): Point | null {
  const fixes = [
    e.O,
    ...ecrans(e).flatMap((ec) => (ec.type === "construction" ? [ec.origine, ec.attendu, poigneeInitiale(ec)] : [])),
    ...autres.flatMap((a) => [a.origine, plus(a.origine, a.w)]),
  ];
  const { largeur, hauteur, minX, minY } = etendue(fixes);
  const maxX = minX + largeur;
  const maxY = minY + hauteur;
  const candidats: Point[] = [];
  for (let x = maxX - LARGEUR_MAX; x <= minX + LARGEUR_MAX; x++) {
    for (let y = maxY - HAUTEUR_MAX; y <= minY + HAUTEUR_MAX; y++) {
      const fin = { x: x + w.x, y: y + w.y };
      const dansX = (p: Point) => p.x >= maxX - LARGEUR_MAX && p.x <= minX + LARGEUR_MAX;
      const dansY = (p: Point) => p.y >= maxY - HAUTEUR_MAX && p.y <= minY + HAUTEUR_MAX;
      if (dansX(fin) && dansY(fin)) candidats.push({ x, y });
    }
  }
  // Mélange (Fisher-Yates) puis premier candidat acceptable.
  for (let i = candidats.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [candidats[i], candidats[j]] = [candidats[j]!, candidats[i]!];
  }
  return candidats.find((origine) => dessinLibreAcceptable(e, origine, w, autres)) ?? null;
}

const O0: Point = { x: 0, y: 0 };

function exerciceDeBase(variante: VarianteConstruireSomme, methode: MethodeConstruireSomme, u: Composantes, v: Composantes, k: number, l: number, colineaires: boolean): ExerciceConstruireSomme {
  return { variante, methode, u, v, k, l, O: O0, origineU: O0, origineV: O0, colineaires };
}

/** Somme ou différence (k = 1, l = ±1). */
function genererSommeDifference(variante: "somme" | "difference", colineaires: boolean): ExerciceConstruireSomme {
  const l = variante === "somme" ? 1 : -1;
  // Méthode tirée une fois (avant les rejets) : les deux restent équiprobables.
  // Vecteurs colinéaires : jamais deux flèches de même origine (elles se superposeraient sur la
  // même droite, et le parallélogramme serait aplati) — v est alors toujours dessiné ailleurs.
  const methode: MethodeConstruireSomme = colineaires
    ? variante === "somme"
      ? "triangle"
      : "oppose"
    : variante === "somme"
      ? choisir(["triangle", "parallelogramme"] as const)
      : choisir(["oppose", "origineCommune"] as const);
  for (;;) {
    let u: Composantes;
    let v: Composantes;
    if (colineaires) {
      const couple = coupleColineaire(false, false, (a, b) => a + l * b !== 0);
      if (!couple) continue;
      ({ u, v } = couple);
    } else {
      u = vecteurAleatoire(4, false);
      v = vecteurAleatoire(4, false);
      if (presqueColineaires(u, v)) continue;
    }
    const e = exerciceDeBase(variante, methode, u, v, 1, l, colineaires);
    if (memePoint(pointFinal(e), e.O)) continue;
    if (methode === "triangle" || methode === "oppose") {
      const origineV = placerLibre(e, v, [{ origine: e.O, w: u }]);
      if (!origineV) continue;
      e.origineV = origineV;
    }
    if (!tientDansLaGrille(e)) continue;
    return recentrer(e);
  }
}

/** Un coefficient demi-entier au moins (une fois sur deux), sinon deux entiers : sans ce choix
 * préalable, les couples entiers (plus souvent trop grands pour la grille) deviendraient rares. */
function tirerCoefficients(pool: readonly number[], avecDemi: boolean): { k: number; l: number } {
  for (;;) {
    const k = choisir(pool);
    const l = choisir(pool);
    if ((estDemi(k) || estDemi(l)) === avecDemi) return { k, l };
  }
}

function genererCombinaison(colineaires: boolean): ExerciceConstruireSomme {
  const avecDemi = Math.random() < 0.5;
  for (;;) {
    const { k, l } = tirerCoefficients(COEFFICIENTS_COMBINAISON, avecDemi);
    if (Math.abs(k) === 1 && Math.abs(l) === 1) continue;
    let u: Composantes;
    let v: Composantes;
    if (colineaires) {
      const couple = coupleColineaire(estDemi(k), estDemi(l), (a, b) => k * a + l * b !== 0);
      if (!couple) continue;
      ({ u, v } = couple);
    } else {
      u = vecteurAleatoire(4, estDemi(k));
      v = vecteurAleatoire(4, estDemi(l));
      if (presqueColineaires(u, v)) continue;
    }
    const e = exerciceDeBase("combinaison", "chaine", u, v, k, l, colineaires);
    if (memePoint(pointFinal(e), e.O)) continue;
    const origineU = placerLibre(e, u, []);
    if (!origineU) continue;
    e.origineU = origineU;
    const origineV = placerLibre(e, v, [{ origine: origineU, w: u }]);
    if (!origineV) continue;
    e.origineV = origineV;
    if (!tientDansLaGrille(e)) continue;
    return recentrer(e);
  }
}

function genererPoint(methode: "AM" | "MA"): ExerciceConstruireSomme {
  const avecDemi = Math.random() < 0.5;
  for (;;) {
    const { k, l } = tirerCoefficients(COEFFICIENTS_POINT, avecDemi);
    const e0 = exerciceDeBase("point", methode, { x: 0, y: 0 }, { x: 0, y: 0 }, k, l, false);
    const eff = coefficientsEffectifs(e0);
    // Première étape « AP = AB » : P serait B lui-même (étape vide).
    if (eff.k === 1) continue;
    const u = vecteurAleatoire(4, estDemi(k));
    const v = vecteurAleatoire(4, estDemi(l));
    if (det(u, v) === 0) continue;
    const e = { ...e0, u, v };
    const { A, B, C } = pointsABC(e);
    const P = plus(A, u, eff.k);
    const M = pointFinal(e);
    if ([A, B, C].some((q) => memePoint(q, P) || memePoint(q, M)) || memePoint(P, M)) continue;
    // Figure lisible : AB et AC assez longs et assez écartés, M loin de A, B, C, et la flèche PM ne
    // frôle aucun des points donnés.
    if (Math.hypot(u.x, u.y) < 2.5 || Math.hypot(v.x, v.y) < 2.5) continue;
    if (Math.abs(det(u, v)) / (Math.hypot(u.x, u.y) * Math.hypot(v.x, v.y)) < 0.35) continue;
    if ([A, B, C].some((q) => Math.hypot(q.x - M.x, q.y - M.y) < 2)) continue;
    const pm = { x: M.x - P.x, y: M.y - P.y };
    if ([A, B, C].some((q) => !memePoint(q, P) && distanceSegment(q, P, pm) < 0.9)) continue;
    if (!tientDansLaGrille(e)) continue;
    return recentrer(e);
  }
}

function genererLecture(): ExerciceConstruireSomme {
  for (;;) {
    const u = vecteurAleatoire(5, false, true);
    const v = vecteurAleatoire(5, false, true);
    if (u.x === v.x && u.y === v.y) continue;
    const e = exerciceDeBase("lecture", "lecture", u, v, 1, 1, false);
    // u part d'un point quelconque (aucune origine n'est imposée : seule la lecture compte).
    const origineV = (() => {
      for (let essai = 0; essai < 60; essai++) {
        const o = { x: entier(-7, 7), y: entier(-6, 6) };
        if (!segmentsSeTouchent(o, v, e.origineU, u)) return o;
      }
      return null;
    })();
    if (!origineV) continue;
    e.origineV = origineV;
    if (!tientDansLaGrille(e)) continue;
    return recentrer(e);
  }
}

export function genererConstruireSomme(variante: VarianteConstruireSomme, colineaires?: boolean): ExerciceConstruireSomme {
  const avecColineaires = colineaires ?? Math.random() < PROBA_COLINEAIRES;
  switch (variante) {
    case "somme":
    case "difference":
      return genererSommeDifference(variante, avecColineaires);
    case "combinaison":
      return genererCombinaison(avecColineaires);
    case "point":
      return genererPoint(choisir(["AM", "MA"] as const));
    case "lecture":
      return genererLecture();
  }
}

// ---------------------------------------------------------------------------------------------
// Catalogue de variantes (SelecteurVarianteDev, `?code=`, adaptateur de feuilles)
// ---------------------------------------------------------------------------------------------

export const CATALOGUE_VARIANTES: { id: VarianteConstruireSomme; label: string }[] = [
  { id: "somme", label: "Construire u + v (triangle ou parallélogramme)" },
  { id: "difference", label: "Construire u − v" },
  { id: "combinaison", label: "Construire k·u + l·v" },
  { id: "point", label: "Placer un point défini par une relation" },
  { id: "lecture", label: "Lire les composantes de vecteurs tracés" },
];

export function construireAvecVariante(id: string): ExerciceConstruireSomme {
  const entree = CATALOGUE_VARIANTES.find((v) => v.id === id);
  if (!entree) return genererExerciceConstruireSomme();
  return genererConstruireSomme(entree.id);
}

/** Tirage libre : une des cinq variantes au hasard. */
export function genererExerciceConstruireSomme(): ExerciceConstruireSomme {
  return genererConstruireSomme(choisir(CATALOGUE_VARIANTES).id);
}
