import type {
  Cible,
  Coefficients,
  ExerciceDemontrerVecteurs,
  FigureBase,
  IdConclusion,
  OptionBase,
  PointDefini,
  Rationnel,
  TypeConclusion,
  VecteurNomme,
} from "../../core/demontrerVecteurs.types";
import {
  UN,
  baseAdaptee,
  cMoins,
  cPlus,
  cFois,
  cEgaux,
  coefficientColinearite,
  coefficientsVecteur,
  colineaires,
  det,
  divise,
  egaux,
  estNul,
  oppose,
  positions,
  pointDessin,
  positionsSommets,
  q,
  sommets,
  valeur,
} from "../../moteur/modeleDemontrerVecteurs";

/**
 * Générateur de « Démontrer avec des vecteurs » (gen85). Tout le hasard passe par `Math.random` :
 * `genererAvecCode` (`export/codeExercice.ts`) le remplace par une graine, et le QR code d'une
 * feuille rouvre ainsi le MÊME exercice.
 *
 * Construction (la propriété à démontrer est VRAIE : on démontre, on ne devine pas) :
 * 1. une figure de base (parallélogramme ABCD, triangle ABC, trapèze ABCD avec DC = t·AB) ;
 * 2. E défini sur une droite joignant deux sommets : vecteur PE = k·PR, k simple (1/2, 1/3, 2, −1…) ;
 * 3. F défini de la même façon (deux autres sommets, jamais la même droite que E), son coefficient
 *    étant CALCULÉ pour que la propriété voulue soit vraie — et retenu seulement s'il est simple.
 * Les relations n'utilisent que les sommets : la définition de F ne mentionne jamais E, la
 * propriété n'est donc jamais lisible dans l'énoncé.
 *
 * Garanties (vérifiées par tirages massifs) : points distincts et bien séparés sur la figure,
 * coefficients des positions et des vecteurs utiles à dénominateur ≤ 6, coefficient de
 * colinéarité simple ; parallèles : droites DISTINCTES et k ≠ ±1 ; alignés : le sommet commun
 * n'est pas sur la droite qui définit E ; parallélogramme : non aplati.
 */

function choisir<T>(liste: readonly T[]): T {
  return liste[Math.floor(Math.random() * liste.length)]!;
}

function melanger<T>(liste: readonly T[]): T[] {
  const copie = [...liste];
  for (let i = copie.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copie[i], copie[j]] = [copie[j]!, copie[i]!];
  }
  return copie;
}

const COEFFICIENTS_E: Rationnel[] = [q(1, 2), q(1, 3), q(2, 3), q(1, 4), q(3, 4), q(3, 2), q(2), q(-1, 2), q(-1), q(-1, 3)];
const RAPPORTS_TRAPEZE: Rationnel[] = [q(1, 2), q(2, 3)];
const FIGURES: FigureBase[] = ["parallelogramme", "triangle", "trapeze"];

/** Coefficient d'une relation lisible ; k = 1 n'a de sens qu'avec une autre origine (CF = AB). */
function coefficientSimple(k: Rationnel, memeOrigine: boolean): boolean {
  return k.d <= 4 && Math.abs(k.n) <= 3 && Math.abs(valeur(k)) <= 3 && !estNul(k) && !(memeOrigine && egaux(k, UN));
}

function rationnelBorne(r: Rationnel, dMax = 6, nMax = 8): boolean {
  return r.d <= dMax && Math.abs(r.n) <= nMax;
}

/** Le point X est sur la droite (P, R). */
function surDroite(X: Coefficients, P: Coefficients, R: Coefficients): boolean {
  return estNul(det(cMoins(R, P), cMoins(X, P)));
}

type Relation = Omit<PointDefini, "k" | "nom">;

interface Droite {
  point: Coefficients;
  direction: Coefficients;
}

function droiteDe(relation: Relation, s: Record<string, Coefficients>): Droite {
  return { point: s[relation.origine]!, direction: cMoins(s[relation.vers]!, s[relation.de]!) };
}

function memeDroite(a: Droite, b: Droite): boolean {
  return estNul(det(a.direction, b.direction)) && estNul(det(a.direction, cMoins(b.point, a.point)));
}

/** Relations possibles à partir des sommets : même origine (origine = de), ou origine hors de (de, vers). */
function relationsPossibles(noms: string[]): Relation[] {
  const liste: Relation[] = [];
  for (const origine of noms) {
    for (const de of noms) {
      for (const vers of noms) {
        if (de === vers || vers === origine) continue;
        liste.push({ origine, de, vers });
      }
    }
  }
  return liste;
}

/** Relation tirée pour F : même origine trois fois sur quatre environ. */
function tirerRelation(noms: string[]): Relation {
  const toutes = relationsPossibles(noms);
  return Math.random() < 0.75 ? choisir(toutes.filter((r) => r.de === r.origine)) : choisir(toutes.filter((r) => r.de !== r.origine));
}

/** Coefficient k tel que F = origine + k·(vers − de) vérifie det(F − X, dir) = 0 ; `null` si
 * impossible ou si k n'est pas simple. */
function resoudre(relation: Relation, s: Record<string, Coefficients>, X: Coefficients, dir: Coefficients): Rationnel | null {
  const { point, direction } = droiteDe(relation, s);
  const den = det(direction, dir);
  if (estNul(den)) return null;
  const k = oppose(divise(det(cMoins(point, X), dir), den));
  return coefficientSimple(k, relation.de === relation.origine) ? k : null;
}

/** Une relation à partir des sommets qui décrit T avec un coefficient simple (même origine de
 * préférence), ou `null`. */
function relationPour(T: Coefficients, s: Record<string, Coefficients>): PointDefini | null {
  const trouvees: PointDefini[] = [];
  for (const r of relationsPossibles(Object.keys(s))) {
    const { point, direction } = droiteDe(r, s);
    const ecart = cMoins(T, point);
    if (!estNul(det(direction, ecart))) continue;
    const k = estNul(direction.x) ? divise(ecart.y, direction.y) : divise(ecart.x, direction.x);
    if (coefficientSimple(k, r.de === r.origine)) trouvees.push({ nom: "F", ...r, k });
  }
  if (trouvees.length === 0) return null;
  const memeOrigine = trouvees.filter((r) => r.de === r.origine);
  return memeOrigine.length > 0 && Math.random() < 0.75 ? choisir(memeOrigine) : choisir(trouvees);
}

function tirerE(figure: FigureBase): PointDefini {
  const noms = sommets(figure);
  const origine = choisir(noms);
  const vers = choisir(noms.filter((n) => n !== origine));
  return { nom: "E", origine, de: origine, vers, k: choisir(COEFFICIENTS_E) };
}

interface Brouillon {
  F: PointDefini;
  cible: Cible;
  w: VecteurNomme;
  v: VecteurNomme;
}

function brouillonAlignes(figure: FigureBase, t: Rationnel | null, E: PointDefini): Brouillon | null {
  const s = positionsSommets(figure, t);
  const pE = positions({ figure, t, definis: [E] }).E!;
  const noms = sommets(figure);
  const X = choisir(noms);
  // Le sommet commun n'est pas sur la droite qui définit E (sinon l'alignement se lit presque).
  if (surDroite(s[X]!, s[E.origine]!, s[E.vers]!)) return null;
  const relation = tirerRelation(noms);
  const k = resoudre(relation, s, s[X]!, cMoins(pE, s[X]!));
  if (!k) return null;
  return {
    F: { nom: "F", ...relation, k },
    cible: { type: "alignes", points: [X, "E", "F"] },
    w: { de: X, vers: "E" },
    v: { de: X, vers: "F" },
  };
}

function brouillonParalleles(figure: FigureBase, t: Rationnel | null, E: PointDefini): Brouillon | null {
  const s = positionsSommets(figure, t);
  const pE = positions({ figure, t, definis: [E] }).E!;
  const noms = sommets(figure);
  const relation = tirerRelation(noms);
  if (Math.random() < 0.5) {
    // (EF) // (QR), Q et R deux sommets ; E n'est pas sur (QR) : droites distinctes.
    const Q = choisir(noms);
    const R = choisir(noms.filter((n) => n !== Q));
    if (surDroite(pE, s[Q]!, s[R]!)) return null;
    const k = resoudre(relation, s, pE, cMoins(s[R]!, s[Q]!));
    if (!k) return null;
    return {
      F: { nom: "F", ...relation, k },
      cible: { type: "paralleles", droite1: ["E", "F"], droite2: [Q, R] },
      w: { de: Q, vers: R },
      v: { de: "E", vers: "F" },
    };
  }
  // (XE) // (YF), X et Y deux sommets ; Y n'est pas sur (XE) : droites distinctes.
  const X = choisir(noms);
  const Y = choisir(noms.filter((n) => n !== X));
  if (surDroite(s[Y]!, s[X]!, pE)) return null;
  const k = resoudre(relation, s, s[Y]!, cMoins(pE, s[X]!));
  if (!k) return null;
  return {
    F: { nom: "F", ...relation, k },
    cible: { type: "paralleles", droite1: [X, "E"], droite2: [Y, "F"] },
    w: { de: X, vers: "E" },
    v: { de: Y, vers: "F" },
  };
}

function brouillonMilieu(figure: FigureBase, t: Rationnel | null, E: PointDefini): Brouillon | null {
  const s = positionsSommets(figure, t);
  const pE = positions({ figure, t, definis: [E] }).E!;
  const X = choisir(sommets(figure));
  const forme = choisir(["E-milieu", "sommet-milieu", "F-milieu"] as const);
  let T: Coefficients;
  let cible: Cible;
  if (forme === "E-milieu") {
    T = cMoins(cFois(q(2), pE), s[X]!);
    cible = { type: "milieu", milieu: "E", extremites: [X, "F"] };
  } else if (forme === "sommet-milieu") {
    T = cMoins(cFois(q(2), s[X]!), pE);
    cible = { type: "milieu", milieu: X, extremites: ["E", "F"] };
  } else {
    T = cFois(q(1, 2), cPlus(pE, s[X]!));
    cible = { type: "milieu", milieu: "F", extremites: ["E", X] };
  }
  const F = relationPour(T, s);
  if (!F) return null;
  return { F, cible, w: { de: cible.extremites[0], vers: cible.milieu }, v: { de: cible.milieu, vers: cible.extremites[1] } };
}

function brouillonParallelogramme(figure: FigureBase, t: Rationnel | null, E: PointDefini): Brouillon | null {
  const s = positionsSommets(figure, t);
  const pE = positions({ figure, t, definis: [E] }).E!;
  const noms = sommets(figure);
  const X = choisir(noms);
  const Y = choisir(noms.filter((n) => n !== X));
  // Quadrilatère X E F Y avec vecteur XE = vecteur YF : non aplati si Y n'est pas sur (XE).
  if (surDroite(s[Y]!, s[X]!, pE)) return null;
  const T = cPlus(s[Y]!, cMoins(pE, s[X]!));
  const F = relationPour(T, s);
  if (!F) return null;
  return { F, cible: { type: "parallelogramme", sommets: [X, "E", "F", Y] }, w: { de: X, vers: "E" }, v: { de: Y, vers: "F" } };
}

const BROUILLONS: Record<TypeConclusion, typeof brouillonAlignes> = {
  alignes: brouillonAlignes,
  paralleles: brouillonParalleles,
  milieu: brouillonMilieu,
  parallelogramme: brouillonParallelogramme,
};

/** Points distincts, dans le cadre, bien séparés sur la figure ; coefficients bornés. */
function figureLisible(figure: FigureBase, pos: Record<string, Coefficients>): boolean {
  const noms = Object.keys(pos);
  for (const n of ["E", "F"]) {
    const p = pos[n]!;
    if (!rationnelBorne(p.x) || !rationnelBorne(p.y)) return false;
    if (valeur(p.x) < -1 || valeur(p.x) > 2 || valeur(p.y) < -1 || valeur(p.y) > 2) return false;
  }
  for (let i = 0; i < noms.length; i++) {
    for (let j = i + 1; j < noms.length; j++) {
      const a = pointDessin(figure, pos[noms[i]!]!);
      const b = pointDessin(figure, pos[noms[j]!]!);
      if (Math.hypot(a[0] - b[0], a[1] - b[1]) < 0.9) return false;
    }
  }
  return true;
}

function basesProposees(e: Pick<ExerciceDemontrerVecteurs, "figure" | "t" | "definis">): OptionBase[] {
  const adaptee = baseAdaptee(e.figure);
  const E = e.definis[0]!;
  if (e.figure !== "triangle") {
    return [adaptee, { id: "colineaire", u: { de: "A", vers: "B" }, v: { de: "D", vers: "C" } }, { id: "maladroite", u: { de: "A", vers: "C" }, v: { de: "B", vers: "D" } }];
  }
  const colineaire: OptionBase = { id: "colineaire", u: { de: E.origine, vers: E.vers }, v: { de: E.origine, vers: "E" } };
  const candidats: [VecteurNomme, VecteurNomme][] = [
    [{ de: "B", vers: "C" }, { de: "A", vers: "E" }],
    [{ de: "B", vers: "C" }, { de: "A", vers: "F" }],
    [{ de: "A", vers: "E" }, { de: "A", vers: "F" }],
  ];
  const [u, v] = candidats.find(([a, b]) => !colineaires(e, a, b)) ?? candidats[0]!;
  return [adaptee, colineaire, { id: "maladroite", u, v }];
}

export function genererDemontrerVecteurs(conclusion: TypeConclusion, figureImposee?: FigureBase): ExerciceDemontrerVecteurs {
  for (;;) {
    const figure = figureImposee ?? choisir(FIGURES);
    const t = figure === "trapeze" ? choisir(RAPPORTS_TRAPEZE) : null;
    const E = tirerE(figure);
    const b = BROUILLONS[conclusion](figure, t, E);
    if (!b) continue;
    // Autre origine et k < 0 : on retourne le vecteur (BF = −CA s'écrit BF = AC).
    const F = b.F.de !== b.F.origine && b.F.k.n < 0 ? { ...b.F, de: b.F.vers, vers: b.F.de, k: oppose(b.F.k) } : b.F;
    const definis = [E, F];
    const s = positionsSommets(figure, t);
    // Jamais E et F sur la même droite de définition (la propriété se lirait dans l'énoncé).
    if (memeDroite(droiteDe(E, s), droiteDe(F, s))) continue;
    const pos = positions({ figure, t, definis });
    if (Object.keys(s).some((n) => cEgaux(s[n]!, pos.E!) || cEgaux(s[n]!, pos.F!)) || cEgaux(pos.E!, pos.F!)) continue;
    if (!figureLisible(figure, pos)) continue;
    const base = { figure, t, definis };
    const w = coefficientsVecteur(base, b.w);
    const v = coefficientsVecteur(base, b.v);
    if (![w.x, w.y, v.x, v.y].every((r) => rationnelBorne(r))) continue;
    if (estNul(w.x) && estNul(w.y)) continue;
    const brut: ExerciceDemontrerVecteurs = { ...base, cible: b.cible, w: b.w, v: b.v, bases: [], ordreConclusions: [] };
    const k = coefficientColinearite(brut);
    if (k.d > 4 || Math.abs(k.n) > 4 || Math.abs(valeur(k)) > 4 || estNul(k)) continue;
    if (conclusion === "paralleles" && (egaux(k, UN) || egaux(k, q(-1)))) continue;
    return {
      ...brut,
      bases: melanger(basesProposees(base)),
      ordreConclusions: melanger<IdConclusion>(["juste", "piege", "piege2", "rien"]),
    };
  }
}

// ---------------------------------------------------------------------------------------------
// Catalogue de variantes (SelecteurVarianteDev, `?code=`, adaptateur de feuilles)
// ---------------------------------------------------------------------------------------------

const CONCLUSIONS: TypeConclusion[] = ["alignes", "paralleles", "milieu", "parallelogramme"];

export const CATALOGUE_VARIANTES: { id: string; label: string }[] = [
  { id: "alignes", label: "Trois points alignés" },
  { id: "paralleles", label: "Deux droites parallèles" },
  { id: "milieu", label: "Un point milieu d'un segment" },
  { id: "parallelogramme", label: "Un quadrilatère parallélogramme" },
];

export function construireAvecVariante(id: string): ExerciceDemontrerVecteurs {
  const conclusion = CONCLUSIONS.find((c) => c === id);
  return conclusion ? genererDemontrerVecteurs(conclusion) : genererExerciceDemontrerVecteurs();
}

/** Tirage libre : une des quatre propriétés, une des trois figures. */
export function genererExerciceDemontrerVecteurs(): ExerciceDemontrerVecteurs {
  return genererDemontrerVecteurs(choisir(CONCLUSIONS));
}
