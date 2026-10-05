/**
 * Couche A — géométrie conique partagée pour "Lieux géométriques : intersection". N'importe jamais
 * `src/moteur/` (règle d'architecture non négociable, voir CLAUDE.md).
 *
 * Réutilise/porte la technique de `intersectionDroiteCercle`/`coefficientsQuadratiqueDroiteCercle`
 * de l'ANCIEN contenu du cinquante-troisième exercice ("Construction d'une parabole par foyer et
 * directrice — méthode cercle-droite", remplacé depuis — voir `docs/historique-chapitre6.md`) :
 * paramétrer la droite par un point d'ancrage + un vecteur direction, substituer dans l'équation de
 * la cible, résoudre le second degré résultant en `t`. Généralisée ici à un CERCLE, une PARABOLE OU
 * une DROITE (`coniqueDepuisDroite`, cas dégénéré `A=B=C=0`) via une représentation conique commune
 * `Ax²+Bxy+Cy²+Dx+Ey+F=0` — les 3 grandes variantes du générateur (cercle-droite, cercle-cercle,
 * droite-parabole) se ramènent ainsi toutes à la MÊME primitive `intersectionDroiteConique` :
 * cercle-cercle en substituant l'axe radical (`axeRadicalDeuxCercles`) dans l'un des deux cercles.
 * INCHANGÉ depuis la version précédente de ce générateur, sauf l'ajout de `coniqueDepuisDroite`/
 * `coniqueDepuisLieu` (vérification d'appartenance générique, écran "résolution" de la refonte
 * `promptgen54refontecomplete.md`) et l'adaptation des types `Lieu*` (`core/lieuxGeometriques.types.ts`).
 */
import type { LieuCercle, LieuDroite, LieuParabole, Lieu, CoefficientsQuadratiqueT } from "../../core/lieuxGeometriques.types";
import type { DroiteImplicite } from "../../core/droite.types";
import type { Point, Composantes } from "../../core/vecteur.types";

/** Conique générale `Ax²+Bxy+Cy²+Dx+Ey+F=0` — représentation commune à la droite (cas dégénéré,
 * `A=B=C=0`), au cercle et à la parabole. */
export interface Conique {
  A: number;
  B: number;
  C: number;
  D: number;
  E: number;
  F: number;
}

export function coniqueDepuisCercle(cercle: LieuCercle): Conique {
  const { centre, rayon } = cercle;
  return { A: 1, B: 0, C: 1, D: -2 * centre.x, E: -2 * centre.y, F: centre.x * centre.x + centre.y * centre.y - rayon * rayon };
}

/**
 * `(x-Fx)²+(y-Fy)² = (y-d)²` (directrice horizontale, orientation verticale) développe en
 * `x² -2Fx x -2Fy y +2d y +(Fx²+Fy²-d²) = 0`. Orientation horizontale : symétrique x↔y.
 */
export function coniqueDepuisParabole(parabole: LieuParabole): Conique {
  const { foyer, directrice, orientation } = parabole;
  const F = foyer.x * foyer.x + foyer.y * foyer.y - directrice * directrice;
  if (orientation === "vertical") {
    return { A: 1, B: 0, C: 0, D: -2 * foyer.x, E: 2 * directrice - 2 * foyer.y, F };
  }
  return { A: 0, B: 0, C: 1, D: 2 * directrice - 2 * foyer.x, E: -2 * foyer.y, F };
}

/** Cas dégénéré (degré 1) de la représentation conique — `y=mx+p` s'écrit `-mx+y-p=0`, soit
 * `D=-m, E=1, F=-p` avec `A=B=C=0`. Permet à `intersectionDroiteConique`/l'appartenance générique de
 * traiter une droite comme n'importe quelle autre cible, sans branchement séparé. */
export function coniqueDepuisDroite(droite: LieuDroite): Conique {
  return { A: 0, B: 0, C: 0, D: -droite.m, E: 1, F: -droite.p };
}

export function coniqueDepuisLieu(lieu: Lieu): Conique {
  switch (lieu.type) {
    case "droite":
      return coniqueDepuisDroite(lieu);
    case "cercle":
      return coniqueDepuisCercle(lieu);
    case "parabole":
      return coniqueDepuisParabole(lieu);
  }
}

/** Forme implicite `a·x+b·y+c=0` d'un `LieuDroite` — `y=mx+p` ⟺ `m·x-y+p=0`. */
export function impliciteDepuisLieuDroite(droite: LieuDroite): DroiteImplicite {
  return { a: droite.m, b: -1, c: droite.p };
}

/** Un point quelconque de la droite `d` — même formule que `pointSurDroite`/`pointDepuisImplicite`
 * déjà utilisées ailleurs sur la plateforme (`generateurs/droite/geometrieDroite.ts`,
 * `moteur/verificationDroite.ts`), reformulée localement (aucun import Couche A → Couche A hors
 * générateurs pairs, et ce module reste indépendant de `generateurs/droite/`). */
function pointSurDroite(d: DroiteImplicite): Point {
  if (d.b !== 0) return { x: 0, y: -d.c / d.b };
  return { x: -d.c / d.a, y: 0 };
}

function directionDroite(d: DroiteImplicite): Composantes {
  return { x: -d.b, y: d.a };
}

/** Coefficients `A_t·t²+B_t·t+C_t=0` de la substitution `(x,y)=origine+t·direction` dans la conique. */
export function substituerLigne(conique: Conique, origine: Point, direction: Composantes): CoefficientsQuadratiqueT {
  const { A, B, C, D, E, F } = conique;
  const { x: ox, y: oy } = origine;
  const { x: dx, y: dy } = direction;
  return {
    A: A * dx * dx + B * dx * dy + C * dy * dy,
    B: 2 * A * ox * dx + B * (ox * dy + oy * dx) + 2 * C * oy * dy + D * dx + E * dy,
    C: A * ox * ox + B * ox * oy + C * oy * oy + D * ox + E * oy + F,
  };
}

/** Coefficients `A·t²+B·t+C=0` de la substitution de la droite `d` dans la conique — même
 * paramétrage (point d'ancrage + direction) que `intersectionDroiteConique`, exposé séparément pour
 * que la génération puisse précalculer `exercice.quadratique` sans dupliquer ce calcul. */
export function coefficientsQuadratiqueDroiteConique(conique: Conique, d: DroiteImplicite): CoefficientsQuadratiqueT {
  return substituerLigne(conique, pointSurDroite(d), directionDroite(d));
}

export interface ResultatIntersectionConique {
  nombreSolutions: 0 | 1 | 2;
  points: Point[];
}

const EPSILON_DISCRIMINANT = 1e-9;

/** Robuste à 0/1/2 solutions, jamais d'exception (défense en profondeur — même principe que
 * `intersectionDroiteCercle` dans l'ancien contenu du 53e exercice). */
export function intersectionDroiteConique(conique: Conique, d: DroiteImplicite): ResultatIntersectionConique {
  const origine = pointSurDroite(d);
  const direction = directionDroite(d);
  const { A, B, C } = substituerLigne(conique, origine, direction);

  const pointDepuisT = (t: number): Point => ({ x: origine.x + t * direction.x, y: origine.y + t * direction.y });

  if (Math.abs(A) <= 1e-12) {
    // Terme quadratique nul — la substitution dégénère en équation linéaire (arrive pour une
    // parabole dont l'axe est PARALLÈLE à la droite, ou pour la paire droite-droite dégénérée :
    // au plus 1 point, jamais 2).
    if (Math.abs(B) <= 1e-12) return { nombreSolutions: 0, points: [] };
    return { nombreSolutions: 1, points: [pointDepuisT(-C / B)] };
  }

  const discriminant = B * B - 4 * A * C;
  if (discriminant < -EPSILON_DISCRIMINANT) return { nombreSolutions: 0, points: [] };
  if (discriminant <= EPSILON_DISCRIMINANT) return { nombreSolutions: 1, points: [pointDepuisT(-B / (2 * A))] };

  const racine = Math.sqrt(discriminant);
  return { nombreSolutions: 2, points: [pointDepuisT((-B - racine) / (2 * A)), pointDepuisT((-B + racine) / (2 * A))] };
}

/** Droite tangente à la conique au point `point` (supposé appartenir à la conique) — via le
 * gradient de la forme implicite : `∇F(x0,y0)·(X-x0,Y-y0)=0`. */
export function tangenteEnPoint(conique: Conique, point: Point): DroiteImplicite {
  const { A, B, C, D, E } = conique;
  const { x, y } = point;
  const gx = 2 * A * x + B * y + D;
  const gy = B * x + 2 * C * y + E;
  return { a: gx, b: gy, c: -(gx * x + gy * y) };
}

/**
 * Soustraction des deux équations de cercle : `(x-x1)²+(y-y1)²-r1² - [(x-x2)²+(y-y2)²-r2²] = 0`
 * simplifie en `-2(x1-x2)x -2(y1-y2)y + (x1²+y1²-r1²)-(x2²+y2²-r2²) = 0`. Piège pédagogique central
 * du sous-cas cercle-cercle (voir CLAUDE.md, section dédiée) : substituer directement dans l'une des
 * deux équations de cercle plutôt que de passer par cet axe radical.
 */
export function axeRadicalDeuxCercles(c1: LieuCercle, c2: LieuCercle): DroiteImplicite {
  const k1 = coniqueDepuisCercle(c1);
  const k2 = coniqueDepuisCercle(c2);
  return { a: k1.D - k2.D, b: k1.E - k2.E, c: k1.F - k2.F };
}
