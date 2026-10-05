/**
 * Couche A — géométrie pure partagée par les 4 générateurs sur les droites, module FRÈRE (même
 * principe que `generateurs/triangle/resoudreTriangle.ts` pour le chapitre 3 ou
 * `generateurs/vecteur/arithmetique.ts` pour le chapitre "Calcul vectoriel") : conversions
 * CONSTRUCTIVES entre un couple (point, vecteur directeur) et chacune des 4 formes de sortie —
 * jamais de test d'appartenance ici (une fonction qui répond "ce point est-il sur la droite ?"),
 * réservé à `moteur/verificationDroite.ts` (Couche B, dupliqué indépendamment — `src/moteur/`
 * n'importe jamais `src/generateurs/`, voir Architecture, CLAUDE.md).
 */
import type { Composantes, Point } from "../../core/vecteur.types";
import type { DroiteExpliciteX, DroiteExpliciteY, DroiteImplicite, DroiteParametrique } from "../../core/droite.types";

/** Vecteur directeur d'une droite implicite `ax+by+c=0` — `(-b, a)`. */
export function vecteurDepuisImplicite(d: DroiteImplicite): Composantes {
  return { x: -d.b, y: d.a };
}

/** Vecteur directeur d'une droite `y=mx+p` — `(1, m)`. */
export function vecteurDepuisExpliciteY(m: number): Composantes {
  return { x: 1, y: m };
}

/** Vecteur directeur d'une droite `x=ny+q` — `(n, 1)`. */
export function vecteurDepuisExpliciteX(n: number): Composantes {
  return { x: n, y: 1 };
}

/** Point d'une droite implicite — arbitraire, x=0 si b≠0 (y=-c/b), sinon y=0 (x=-c/a). */
export function pointDepuisImplicite(d: DroiteImplicite): Point {
  if (d.b !== 0) return { x: 0, y: -d.c / d.b };
  return { x: -d.c / d.a, y: 0 };
}

/** La forme `y=mx+p` est possible ssi le vecteur directeur n'est pas vertical (`a≠0`). */
export function formeExpliciteYPossible(v: Composantes): boolean {
  return v.x !== 0;
}

/** La forme `x=ny+q` est possible ssi le vecteur directeur n'est pas horizontal (`b≠0`). */
export function formeExpliciteXPossible(v: Composantes): boolean {
  return v.y !== 0;
}

/** `m = b/a`, `p = y0 - m·x0` — n'a de sens que si `formeExpliciteYPossible(v)`. */
export function expliciteYDepuisPointVecteur(point: Point, v: Composantes): DroiteExpliciteY {
  const m = v.y / v.x;
  return { m, p: point.y - m * point.x };
}

/** `n = a/b`, `q = x0 - n·y0` — n'a de sens que si `formeExpliciteXPossible(v)`. */
export function expliciteXDepuisPointVecteur(point: Point, v: Composantes): DroiteExpliciteX {
  const n = v.x / v.y;
  return { n, q: point.x - n * point.y };
}

/** `a=dy, b=-dx, c=-(a·x0+b·y0)` — cohérent avec l'inverse `vecteurDepuisImplicite`
 * (`vecteur=(-b,a)`) : `a=v.y`, `b=-v.x` redonne bien `(-b,a)=(v.x,v.y)=v`. Toujours possible,
 * quel que soit le vecteur (jamais de cas impossible pour la forme implicite). */
export function implicteDepuisPointVecteur(point: Point, v: Composantes): DroiteImplicite {
  const a = v.y;
  const b = -v.x;
  return { a, b, c: -(a * point.x + b * point.y) };
}

/** Toujours possible, quel que soit le vecteur. */
export function parametriqueDepuisPointVecteur(point: Point, v: Composantes): DroiteParametrique {
  return { x0: point.x, y0: point.y, a: v.x, b: v.y };
}

/** Valeurs remarquables de tan(α) pour les types de données "angle avec Ox/Oy" — `null` = tan(α)
 * non définie (α=90°). Restreint à {0°,45°,90°,135°} (tan rationnelle : 0, 1, indéfinie, -1) —
 * décision de scope délibérée : les angles remarquables usuels (30°,60°,120°,150°) ont une tangente
 * irrationnelle (`√3`, `√3/3`), ce qui exigerait un champ texte "radical-aware" plutôt qu'un simple
 * champ numérique pour ce type de donnée d'entrée — hors périmètre retenu pour ce générateur. */
export const TAN_REMARQUABLE: Record<number, number | null> = { 0: 0, 45: 1, 90: null, 135: -1 };

export const ANGLES_REMARQUABLES = [0, 45, 90, 135];

/** Type 3 — angle α avec Ox : vecteur = (1, tanα), ou (0,1) si α=90° (singularité). */
export function vecteurDepuisAngleOx(angleDeg: number): Composantes {
  const t = TAN_REMARQUABLE[angleDeg];
  return t === null ? { x: 0, y: 1 } : { x: 1, y: t };
}

/** Type 4 — angle α avec Oy : vecteur = (tanα, 1), ou (1,0) si α=90° (singularité — jamais α=0°,
 * qui donne déjà naturellement (0,1) avec cette même formule, cohérent, aucun cas particulier). */
export function vecteurDepuisAngleOy(angleDeg: number): Composantes {
  const t = TAN_REMARQUABLE[angleDeg];
  return t === null ? { x: 1, y: 0 } : { x: t, y: 1 };
}

/** Type 5 — pente m : vecteur = (1, m), conversion directe (même formule que `vecteurDepuisExpliciteY`,
 * dupliquée par clarté sémantique — deux concepts différents qui coïncident numériquement). */
export function vecteurDepuisPente(m: number): Composantes {
  return { x: 1, y: m };
}

/** Point d'une droite `y=mx+p` — x=0 (y=p). Toujours possible (structurellement jamais de cas
 * "vertical" pour cette forme, qui n'existe déjà pas si la droite est verticale). */
export function pointDepuisExpliciteY(d: DroiteExpliciteY): Point {
  return { x: 0, y: d.p };
}

/** Point d'une droite `x=ny+q` — y=0 (x=q). Toujours possible (même raison que ci-dessus, côté
 * horizontal). */
export function pointDepuisExpliciteX(d: DroiteExpliciteX): Point {
  return { x: d.q, y: 0 };
}

/** Tolérance sur le déterminant du système 2×2 — droites considérées parallèles/confondues en deçà. */
const EPSILON_INTERSECTION = 1e-6;

/**
 * Intersection de deux droites implicites — résolution du système `{a1x+b1y+c1=0, a2x+b2y+c2=0}`
 * par la règle de Cramer. `null` si le déterminant `a1·b2-a2·b1` est en-dessous d'un epsilon
 * (droites parallèles ou confondues, aucun point d'intersection unique).
 *
 * Nouvelle primitive géométrique partagée du groupe "droites" — introduite pour "Distance
 * point-droite et droite-droite (méthode de synthèse)", qui en a besoin pour construire `Q = b∩d`
 * (variante A) sans jamais recalculer cette résolution de système ailleurs. **Aucun générateur
 * "Intersection entre deux droites" n'existe dans ce dépôt** (vérifié par grep sur tout `src/`
 * avant implémentation, méthode "verify before fixing" du projet) malgré une mention du prompt de
 * création de "Distance point-droite et droite-droite" qui la présentait comme un générateur source
 * déjà construit — prémisse inexacte, corrigée après vérification directe du code plutôt que prise
 * pour argent comptant (même précédent que "Quel angle ?"/générateur 18, chapitre 3, dont le prompte
 * de création affirmait à tort une réutilisation par le générateur 17 déjà en place). La primitive
 * est donc construite ici, directement dans le module géométrique déjà partagé du groupe, plutôt que
 * dans un cinquième générateur autonome jamais réellement demandé.
 */
export function intersectionDeuxDroites(d1: DroiteImplicite, d2: DroiteImplicite): Point | null {
  const det = d1.a * d2.b - d2.a * d1.b;
  if (Math.abs(det) < EPSILON_INTERSECTION) return null;
  return {
    x: (d1.b * d2.c - d2.b * d1.c) / det,
    y: (d2.a * d1.c - d1.a * d2.c) / det,
  };
}
