import type { FragmentConsigne } from "./formatEquationDroite";
import { lireNombreSaisi } from "./lireNombre";
import { lireNombre } from "../moteur/verificationTransfertSecondDegre";
import { parserEquationDroiteXY, parserExpressionAffineT } from "../moteur/verificationDroite";
import { normaliserSaisieEquation } from "../moteur/verificationEquationDroite";

/**
 * Règles communes des anciens générateurs du chapitre 7 de 4e (« Géométrie analytique plane »,
 * gen42–gen54 ; audit 4e ch. 7, lot B) — modèle `components/RetourSaisie.tsx` (lots B des ch. 2, 5
 * et 6) :
 * - une saisie ILLISIBLE n'atteint jamais le moteur (aucune tentative), avec un message PAR NATURE
 *   de champ (coordonnée, composante, angle, distance, équation de droite / de cercle / de
 *   parabole), jamais « la place de x » dans un champ de coordonnées ;
 * - message ciblé sur l'erreur du cours trahie par la dernière réponse fausse, jamais la réponse ;
 * - aides à deux niveaux en KaTeX (niveau 1 = la propriété du cours, niveau 2 = comment l'appliquer
 *   ici), jamais le résultat.
 * Pied d'écran commun : `components/PiedAnalytique.tsx`.
 */

export type Fragments = FragmentConsigne[];

export function t(valeur: string): FragmentConsigne {
  return { type: "texte", valeur };
}
export function l(valeur: string): FragmentConsigne {
  return { type: "latex", valeur };
}

const SANS_TENTATIVE = " Cette saisie ne compte pas comme une tentative.";

/** Messages d'illisible par nature de champ (G2). */
export const ILLISIBLE_ANALYTIQUE = {
  coordonnee: `Nombre non reconnu : écris chaque coordonnée, par exemple −3, 2,5, 7/2 ou √3 (virgule ou point).${SANS_TENTATIVE}`,
  composante: `Nombre non reconnu : écris chaque composante, par exemple −4, 1,5, 3/2 ou √3 (virgule ou point).${SANS_TENTATIVE}`,
  coefficient: `Nombre non reconnu : écris chaque coefficient, par exemple −4, 1,5 ou 3/2 (virgule ou point).${SANS_TENTATIVE}`,
  pentePente: `Nombre non reconnu : écris la pente et l'ordonnée à l'origine, par exemple −3, 0,5 ou 7/2 (virgule ou point).${SANS_TENTATIVE}`,
  angle: `Nombre non reconnu : écris un angle en degrés, par exemple 135 ou 26,57 (le symbole ° est facultatif).${SANS_TENTATIVE}`,
  distance: `Écriture non reconnue : écris une distance, un nombre comme 5 ou 2,24, ou une racine comme √5 (rac(5)).${SANS_TENTATIVE}`,
  rayon: `Écriture non reconnue : écris le rayon, un nombre comme 5 ou une racine comme √13 (rac(13)).${SANS_TENTATIVE}`,
  parametre: `Nombre non reconnu : écris la valeur de p, par exemple −6, 4 ou 3/2 (virgule ou point).${SANS_TENTATIVE}`,
  equationDroite: `Équation non reconnue : écris une équation de droite avec « = », par exemple 2x − 3y + 1 = 0, y = 2x − 1 ou x = 4 (vérifie les signes et les parenthèses).${SANS_TENTATIVE}`,
  parametriques: `Équation non reconnue : écris chaque équation en fonction de t, par exemple x = 2 + 3t (vérifie les signes et les parenthèses).${SANS_TENTATIVE}`,
  equationCercle: `Équation non reconnue : écris une équation de cercle avec « = », par exemple (x − 2)² + (y + 1)² = 9 (tape ² ou ^2).${SANS_TENTATIVE}`,
  regroupementCercle: `Équation non reconnue : écris l'équation avec « = », les termes en x entre parenthèses, puis les termes en y, par exemple (x² − 4x) + (y² + 6y) = 3 (tape ² ou ^2).${SANS_TENTATIVE}`,
  equationParabole: `Équation non reconnue : écris une équation de parabole avec « = », par exemple (y − 1)² = 4(x + 2) ou (x + 3)² = −2(y − 5) (tape ² ou ^2).${SANS_TENTATIVE}`,
  regroupementParabole: `Équation non reconnue : écris l'équation avec « = », le carré et son terme du premier degré dans le premier membre, par exemple y² − 2y = 4x + 7 (tape ² ou ^2).${SANS_TENTATIVE}`,
  equationsLieux: `Équation non reconnue : écris chaque équation avec « = », par exemple y = 2x − 1, (x − 2)² + y² = 9 ou y² = 4x (tape ² ou ^2).${SANS_TENTATIVE}`,
} as const;

/** Nombre saisi : décimal à virgule ou à point, fraction « 3/2 », racine « √3 », « rac(3) »,
 * « sqrt(3) », « 2 − 3√3 » (angles de 30°, 60°…) ; `null` s'il est illisible. */
export function lireNombreAnalytique(texte: string): number | null {
  if (texte.trim() === "") return null;
  return lireNombreSaisi(texte) ?? lireNombre(texte);
}

/** Champs numériques tous lisibles. */
export function nombresLisibles(...textes: string[]): boolean {
  return textes.every((texte) => lireNombreAnalytique(texte) !== null);
}

/** Nombre saisi (`NaN` s'il est illisible — jamais transmis au moteur grâce à `nombresLisibles`). */
export function nombreOuNaN(texte: string): number {
  return lireNombreAnalytique(texte) ?? Number.NaN;
}

const EPS = 1e-9;
export function egal(a: number, b: number): boolean {
  return Math.abs(a - b) < EPS;
}

/* ---------------------------------------------------------------------------------------------
 * Messages ciblés communs des droites (gen42–gen48) — jamais la réponse.
 * ------------------------------------------------------------------------------------------- */

export interface Vec2 {
  x: number;
  y: number;
}
export interface Droite3 {
  a: number;
  b: number;
  c: number;
}

/** Deux vecteurs non nuls colinéaires (tolérance relative). */
export function colineaires(u: Vec2, v: Vec2): boolean {
  const echelle = Math.max(1, Math.hypot(u.x, u.y) * Math.hypot(v.x, v.y));
  return Math.abs(u.x * v.y - u.y * v.x) < 1e-6 * echelle;
}

export function nonNul(v: Vec2): boolean {
  return Math.abs(v.x) > 1e-12 || Math.abs(v.y) > 1e-12;
}

/** Point (x ; y) sur la droite ax + by + c = 0 (tolérance relative). */
export function surDroite(p: Vec2, d: Droite3): boolean {
  return Math.abs(d.a * p.x + d.b * p.y + d.c) < 1e-6 * Math.max(1, Math.hypot(d.a, d.b));
}

/** Vecteur saisi comme vecteur directeur d'une droite de vecteur directeur `u` attendu. */
export function cibleVecteurDirecteur(saisi: Vec2, u: Vec2): Fragments | null {
  if (!nonNul(saisi)) return [t("Le vecteur nul n'a pas de direction : il ne peut pas être un vecteur directeur.")];
  if (colineaires(saisi, u)) return null;
  if (colineaires(saisi, { x: -u.y, y: u.x })) {
    return [t("Ce vecteur est perpendiculaire à la droite : c'est un vecteur normal, pas un vecteur directeur.")];
  }
  if (colineaires(saisi, { x: u.y, y: u.x })) {
    return [t("Tes deux composantes sont échangées : "), l("x_{\\vec{u}}"), t(" se place en haut, "), l("y_{\\vec{u}}"), t(" en bas.")];
  }
  return null;
}

/** Équation de droite saisie (déjà lue en ax + by + c = 0) comparée à la droite attendue, passant
 * par le point `pointNomme` (nom : « A »). */
export function cibleEquationDroite(saisie: Droite3 | null, attendue: Droite3, point: Vec2 | null, nomPoint = "A"): Fragments | null {
  if (saisie === null) return null;
  const nS = { x: saisie.a, y: saisie.b };
  const nA = { x: attendue.a, y: attendue.b };
  const memeDirection = colineaires(nS, nA);
  if (memeDirection) {
    return [t("Ta droite a la bonne direction, mais elle est décalée : vérifie le terme constant (le point "), l(nomPoint), t(" doit vérifier l'équation).")];
  }
  if (point !== null && surDroite(point, saisie)) {
    if (colineaires(nS, { x: -attendue.b, y: attendue.a })) {
      return [t("Ta droite passe par "), l(nomPoint), t(", mais elle est perpendiculaire à la bonne : le vecteur directeur a été pris comme vecteur normal (dans "), l("ax+by+c=0"), t(", "), l("\\begin{pmatrix}a\\\\ b\\end{pmatrix}"), t(" est normal à la droite).")];
    }
    return [t("Ta droite passe par "), l(nomPoint), t(", mais elle n'a pas la bonne direction : relis le vecteur directeur.")];
  }
  return null;
}

/** Pente saisie m comparée à la pente attendue : inverse, opposée. */
export function ciblePente(saisie: number, attendue: number): Fragments | null {
  if (!Number.isFinite(saisie) || egal(saisie, attendue)) return null;
  if (Math.abs(attendue) > 1e-12 && egal(saisie, 1 / attendue)) {
    return [t("Ta pente est inversée : "), l("m=\\dfrac{y_{\\vec{u}}}{x_{\\vec{u}}}"), t(" (ce qu'on monte, divisé par ce qu'on avance), pas l'inverse.")];
  }
  if (egal(saisie, -attendue)) return [t("Le signe de ta pente est faux : une droite qui descend de gauche à droite a une pente négative.")];
  return null;
}

/** Équations paramétriques saisies (« x = … », « y = … ») comparées à la droite attendue. */
export function cibleParametriques(texteX: string, texteY: string, vecteur: Vec2, reference: Droite3): Fragments | null {
  const ex = parserExpressionAffineT(texteX);
  const ey = parserExpressionAffineT(texteY);
  if (!ex || !ey) return null;
  if (Math.abs(vecteur.x - vecteur.y) > 1e-9 && egal(ex.coefficient, vecteur.y) && egal(ey.coefficient, vecteur.x)) {
    return [t("Chaque équation associe une coordonnée du point à la même composante du vecteur : "), l("x=x_A+x_{\\vec{u}}\\,t"), t(", "), l("y=y_A+y_{\\vec{u}}\\,t"), t(".")];
  }
  const v = cibleVecteurDirecteur({ x: ex.coefficient, y: ey.coefficient }, vecteur);
  if (v) return v;
  if (!surDroite({ x: ex.constante, y: ey.constante }, reference)) {
    return [t("Pour "), l("t=0"), t(", tes équations donnent un point qui n'est pas sur la droite : les termes constants sont les coordonnées d'un point de la droite.")];
  }
  return null;
}

/** Équation de droite saisie en texte, lue en ax + by + c = 0 (null si illisible). */
export function lireEquationDroite(texte: string): Droite3 | null {
  return parserEquationDroiteXY(normaliserSaisieEquation(texte).replace(/\s+/g, ""));
}

/* ---------------------------------------------------------------------------------------------
 * Cercles (gen49, gen50) : signe du centre, r² pris pour r — jamais la réponse.
 * ------------------------------------------------------------------------------------------- */

/** `juste(x0, y0, r2)` : vrai si la saisie est l'équation du cercle de centre (x0 ; y0), de rayon²
 * r2 (même jugement que l'écran). */
export function cibleEquationCercle(juste: (x0: number, y0: number, r2: number) => boolean, x0: number, y0: number, r2: number): Fragments | null {
  const r = Math.sqrt(r2);
  if (Math.abs(r2 - r) > 1e-9 && juste(x0, y0, r)) return [t("Le second membre est "), l("r^2"), t(", le carré du rayon, pas "), l("r"), t(" lui-même.")];
  if (Math.abs(r2 - r2 * r2) > 1e-9 && juste(x0, y0, r2 * r2)) return [t("Le second membre est "), l("r^2"), t(" : tu as élevé le rayon au carré deux fois.")];
  const signes: [number, number][] = [
    [-x0, y0],
    [x0, -y0],
    [-x0, -y0],
  ];
  for (const [a, b] of signes) {
    if ((a !== x0 || b !== y0) && juste(a, b, r2)) {
      return [t("Attention au signe : dans "), l("(x-x_0)^2+(y-y_0)^2=r^2"), t(", un centre d'abscisse négative donne "), l("(x+\\dots)^2"), t(" (on soustrait la coordonnée du centre).")];
    }
  }
  return null;
}
