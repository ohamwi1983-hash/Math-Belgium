import type { ExerciceChantierTerrains, PointPlan, SituationChantier } from "../../core/chantierTerrains.types";
import { angleDegres, norme } from "../../moteur/modeleChantierTerrains";

/**
 * Générateur de « Chantier et terrains » (gen88). Tout le hasard passe par `Math.random` :
 * `genererAvecCode` (`export/codeExercice.ts`) le remplace par une graine, et le QR code d'une
 * feuille rouvre ainsi le MÊME exercice.
 *
 * Garanties (vérifiées par tirages massifs) :
 * - coordonnées entières, dans le plan [1 ; 29] × [1 ; 21] (mètres) ; aucun vecteur utile n'a de
 *   composante nulle (jamais de raccourci « vecteur horizontal ») ;
 * - verdicts (alignés, d'équerre, parallèles) : oui / non tirés à 50/50 dans CHAQUE instance ;
 *   quand la réponse est « non », l'écart est faible — de 1,5° à 4° par rapport à l'alignement, à
 *   l'angle droit ou au parallélisme — : l'œil ne suffit pas, il faut le calcul ;
 * - milieu, enclos, piquet : le point cherché est dans le plan ; le piquet a une coordonnée entière.
 */

export const PLAN = { xMin: 0, xMax: 30, yMin: 0, yMax: 22 };
const X_MIN = 1;
const X_MAX = 29;
const Y_MIN = 1;
const Y_MAX = 21;

export const NOMBRE_CONTEXTES: Record<SituationChantier, number> = {
  alignement: 3,
  equerre: 3,
  paralleles: 3,
  milieu: 2,
  enclos: 2,
  piquet: 2,
};

const ECART_MIN = 1.5;
const ECART_MAX = 4;

function entier(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function choisir<T>(liste: readonly T[]): T {
  return liste[Math.floor(Math.random() * liste.length)]!;
}

function melange(n: number): number[] {
  const t = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [t[i], t[j]] = [t[j]!, t[i]!];
  }
  return t;
}

function pgcd(a: number, b: number): number {
  return b === 0 ? Math.abs(a) : pgcd(b, a % b);
}

/** Direction primitive (p ; q), composantes non nulles, |p|, |q| ≤ max. */
function direction(max: number): { x: number; y: number } {
  for (;;) {
    const x = entier(1, max) * choisir([-1, 1]);
    const y = entier(1, max) * choisir([-1, 1]);
    if (pgcd(x, y) === 1) return { x, y };
  }
}

function pointAleatoire(nom: string): PointPlan {
  return { nom, x: entier(X_MIN, X_MAX), y: entier(Y_MIN, Y_MAX) };
}

function dansLePlan(p: { x: number; y: number }): boolean {
  return p.x >= X_MIN && p.x <= X_MAX && p.y >= Y_MIN && p.y <= Y_MAX;
}

function sansZero(v: { x: number; y: number }): boolean {
  return v.x !== 0 && v.y !== 0;
}

function plus(p: PointPlan, v: { x: number; y: number }, nom: string): PointPlan {
  return { nom, x: p.x + v.x, y: p.y + v.y };
}

function moins(a: { x: number; y: number }, b: { x: number; y: number }): { x: number; y: number } {
  return { x: a.x - b.x, y: a.y - b.y };
}

function plusV(u: { x: number; y: number }, v: { x: number; y: number }): { x: number; y: number } {
  return { x: u.x + v.x, y: u.y + v.y };
}

function fois(k: number, v: { x: number; y: number }): { x: number; y: number } {
  return { x: k * v.x, y: k * v.y };
}

function perturbation(max: number): { x: number; y: number } {
  for (;;) {
    const e = { x: entier(-max, max), y: entier(-max, max) };
    if (e.x !== 0 || e.y !== 0) return e;
  }
}

/** Écart (en degrés) à la même direction : 0 si colinéaires. */
function ecartDirection(u: { x: number; y: number }, v: { x: number; y: number }): number {
  if (u.x * v.y - u.y * v.x === 0) return 0;
  const a = angleDegres(u, v);
  return Math.min(a, 180 - a);
}

function base(situation: SituationChantier): Pick<ExerciceChantierTerrains, "situation" | "contexte" | "verdict" | "cherche" | "ligne" | "position" | "ordreOptions"> {
  return { situation, contexte: entier(0, NOMBRE_CONTEXTES[situation] - 1), verdict: null, cherche: null, ligne: null, position: null, ordreOptions: [] };
}

export function genererAlignement(verdict = Math.random() < 0.5, position: "entre" | "dehors" = choisir(["entre", "dehors"] as const)): ExerciceChantierTerrains {
  for (;;) {
    const a = pointAleatoire("A");
    const d = direction(6);
    const m = position === "entre" ? entier(3, 6) : entier(2, 4);
    const n = position === "entre" ? entier(1, m - 1) : choisir([entier(m + 1, m + 4), entier(-3, -1)]);
    const ab = fois(m, d);
    const ac = verdict ? fois(n, d) : plusV(fois(n, d), perturbation(3));
    const b = plus(a, ab, "B");
    const c = plus(a, ac, "C");
    if (!dansLePlan(b) || !dansLePlan(c) || !sansZero(ab) || !sansZero(ac)) continue;
    if (norme(ab) < 8 || norme(ac) < 5 || norme(moins(c, b)) < 5) continue;
    const ecart = ecartDirection(ab, ac);
    if (verdict ? ecart !== 0 : ecart < ECART_MIN || ecart > ECART_MAX) continue;
    const t = (ab.x * ac.x + ab.y * ac.y) / (ab.x * ab.x + ab.y * ab.y);
    if (position === "entre" ? t < 0.15 || t > 0.85 : t > -0.15 && t < 1.15) continue;
    return { ...base("alignement"), points: [a, b, c], verdict, position, ordreOptions: melange(4) };
  }
}

export function genererEquerre(verdict = Math.random() < 0.5): ExerciceChantierTerrains {
  for (;;) {
    const a = pointAleatoire("A");
    const d = direction(6);
    const ab = fois(entier(1, 4), d);
    const perpendiculaire = fois(entier(1, 4) * choisir([-1, 1]), { x: -d.y, y: d.x });
    const ac = verdict ? perpendiculaire : plusV(perpendiculaire, perturbation(3));
    const b = plus(a, ab, "B");
    const c = plus(a, ac, "C");
    if (!dansLePlan(b) || !dansLePlan(c) || !sansZero(ab) || !sansZero(ac)) continue;
    if (norme(ab) < 7 || norme(ab) > 20 || norme(ac) < 7 || norme(ac) > 20) continue;
    const ecart = Math.abs(angleDegres(ab, ac) - 90);
    if (verdict ? ab.x * ac.x + ab.y * ac.y !== 0 : ecart < ECART_MIN || ecart > ECART_MAX) continue;
    return { ...base("equerre"), points: [a, b, c], verdict, ordreOptions: melange(4) };
  }
}

/** Distance (signée) du point p à la droite (a ; u). */
function distanceSignee(a: PointPlan, u: { x: number; y: number }, p: { x: number; y: number }): number {
  return (u.x * (p.y - a.y) - u.y * (p.x - a.x)) / norme(u);
}

export function genererParalleles(verdict = Math.random() < 0.5): ExerciceChantierTerrains {
  for (;;) {
    const a = pointAleatoire("A");
    const d = direction(5);
    const m = entier(1, 5);
    const ab = fois(m, d);
    if (norme(ab) < 9 || norme(ab) > 22) continue;
    const b = plus(a, ab, "B");
    const c: PointPlan = { nom: "C", x: a.x + entier(-10, 10), y: a.y + entier(-10, 10) };
    // Jamais le même vecteur (CD = AB) : la réponse se lirait sans calcul.
    const n = entier(1, 5);
    if (n === m) continue;
    const cdOui = fois(n, d);
    const cd = verdict ? cdOui : plusV(cdOui, perturbation(3));
    const dd = plus(c, cd, "D");
    if (!dansLePlan(b) || !dansLePlan(c) || !dansLePlan(dd) || !sansZero(cd)) continue;
    if (norme(cd) < 9 || norme(cd) > 22) continue;
    const dc = distanceSignee(a, ab, c);
    const dD = distanceSignee(a, ab, dd);
    // Rangées côte à côte, nettement séparées, jamais croisées.
    if (Math.abs(dc) < 4 || Math.abs(dc) > 9 || Math.abs(dD) < 3 || Math.sign(dc) !== Math.sign(dD)) continue;
    const proj = (p: { x: number; y: number }) => ((p.x - a.x) * ab.x + (p.y - a.y) * ab.y) / (ab.x * ab.x + ab.y * ab.y);
    if ([proj(c), proj(dd)].some((t) => t < -0.3 || t > 1.3)) continue;
    const ecart = ecartDirection(ab, cd);
    if (verdict ? ecart !== 0 : ecart < ECART_MIN || ecart > ECART_MAX) continue;
    return { ...base("paralleles"), points: [a, b, c, dd], verdict, ordreOptions: melange(4) };
  }
}

export function genererMilieu(): ExerciceChantierTerrains {
  for (;;) {
    const a = pointAleatoire("A");
    const b = pointAleatoire("B");
    const ab = moins(b, a);
    if (!sansZero(ab) || norme(ab) < 10 || norme(ab) > 26) continue;
    const g = base("milieu");
    const nom = g.contexte === 1 ? "L" : "M";
    return { ...g, points: [a, b], cherche: { nom, x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 } };
  }
}

export function genererEnclos(): ExerciceChantierTerrains {
  for (;;) {
    const a = pointAleatoire("A");
    const b = pointAleatoire("B");
    const c = pointAleatoire("C");
    const ab = moins(b, a);
    const bc = moins(c, b);
    if (!sansZero(ab) || !sansZero(bc)) continue;
    if (norme(ab) < 7 || norme(ab) > 18 || norme(bc) < 7 || norme(bc) > 18) continue;
    const angle = angleDegres(moins(a, b), bc);
    if (angle < 55 || angle > 125) continue;
    const d = { nom: "D", x: a.x + c.x - b.x, y: a.y + c.y - b.y };
    if (!dansLePlan(d)) continue;
    return { ...base("enclos"), points: [a, b, c], cherche: d, ordreOptions: melange(4) };
  }
}

export function genererPiquet(axe: "x" | "y" = choisir(["x", "y"] as const)): ExerciceChantierTerrains {
  for (;;) {
    const a = pointAleatoire("A");
    const d = direction(5);
    const m = entier(1, 3);
    const ab = fois(m, d);
    const b = plus(a, ab, "B");
    if (!dansLePlan(b) || norme(ab) < 6) continue;
    const j = entier(-3, m + 4);
    if (j === 0 || j === m) continue;
    const p = plus(a, fois(j, d), "P");
    if (!dansLePlan(p) || norme(moins(p, a)) < 6 || norme(moins(p, b)) < 6) continue;
    return { ...base("piquet"), points: [a, b], cherche: p, ligne: { axe, valeur: axe === "x" ? p.x : p.y } };
  }
}

// ---------------------------------------------------------------------------------------------
// Catalogue de variantes (SelecteurVarianteDev, `?code=`, adaptateur de feuilles)
// ---------------------------------------------------------------------------------------------

export const CATALOGUE_VARIANTES: { id: SituationChantier; label: string }[] = [
  { id: "alignement", label: "Trois piquets, arbres ou poteaux alignés ?" },
  { id: "equerre", label: "Un coin d'équerre ?" },
  { id: "paralleles", label: "Deux routes ou rangées parallèles ?" },
  { id: "milieu", label: "Point à mi-chemin de deux maisons" },
  { id: "enclos", label: "Quatrième coin d'un enclos en parallélogramme" },
  { id: "piquet", label: "Piquet à planter pour qu'il soit aligné" },
];

export function construireAvecVariante(id: string): ExerciceChantierTerrains {
  switch (id) {
    case "alignement":
      return genererAlignement();
    case "equerre":
      return genererEquerre();
    case "paralleles":
      return genererParalleles();
    case "milieu":
      return genererMilieu();
    case "enclos":
      return genererEnclos();
    case "piquet":
      return genererPiquet();
    default:
      return genererExerciceChantierTerrains();
  }
}

/** Tirage libre : une des six situations, au hasard. */
export function genererExerciceChantierTerrains(): ExerciceChantierTerrains {
  return construireAvecVariante(choisir(CATALOGUE_VARIANTES).id);
}
