import type { FragmentConsigne } from "../../export/genererFeuilleExercices";
import { normaliserSigneMoins } from "../../../lib/normaliserSaisie";
import { evaluerExpressionGenerale } from "../moteur/expressionGenerale";
import { lireNombre, normaliserExpression } from "../moteur/verificationTransfertSecondDegre";
import { nombreLatex } from "../moteur/algebreTransfertSecondDegre";
import { q, somme } from "./corrigeChapitre3";
import type { ChampLibre } from "./ecransTransfertSecondDegre";

/**
 * Outils communs du lot G du chapitre 7 de 4e (gen96 projeté / symétrique / réflexion, gen97
 * trajectoires, gen98 intersection de deux cercles, gen99 détective) — SOURCE UNIQUE pour l'écran,
 * les aides, le papier et le corrigé : géométrie exacte (droites ax + by + c = 0 à coefficients
 * entiers), écritures LaTeX du cours (point A(3 ; −2), vecteur en colonne, d ≡ …), champs libres de
 * la coquille commune (`ChampLibre` : équation de droite sous n'importe quelle forme, liste de
 * points) et figure SVG d'un repère (quadrillage d'une unité, MÊME échelle sur les deux axes, aucun
 * identifiant SVG).
 */

export type Fr = FragmentConsigne[];
export const t = (valeur: string): FragmentConsigne => ({ type: "texte", valeur });
export const l = (valeur: string): FragmentConsigne => ({ type: "latex", valeur });

export interface P {
  x: number;
  y: number;
}

/** Droite a·x + b·y + c = 0. */
export interface D {
  a: number;
  b: number;
  c: number;
}

export const n = nombreLatex;

// ---------------------------------------------------------------------------------------------
// Hasard (toujours `Math.random` : `genererAvecCode` le remplace par une graine)
// ---------------------------------------------------------------------------------------------

export function entier(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}
export function nonNul(min: number, max: number): number {
  for (;;) {
    const v = entier(min, max);
    if (v !== 0) return v;
  }
}
export function choisir<T>(liste: readonly T[]): T {
  return liste[Math.floor(Math.random() * liste.length)]!;
}
export function melanger<T>(liste: readonly T[]): T[] {
  const c = [...liste];
  for (let i = c.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [c[i], c[j]] = [c[j]!, c[i]!];
  }
  return c;
}

// ---------------------------------------------------------------------------------------------
// Géométrie exacte
// ---------------------------------------------------------------------------------------------

export function pgcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a;
}

export const proche = (u: number, v: number, eps = 1e-9) => Math.abs(u - v) <= eps * Math.max(1, Math.abs(u), Math.abs(v));
export const memePoint = (A: P, B: P) => proche(A.x, B.x) && proche(A.y, B.y);

/** Coefficients entiers premiers entre eux, premier coefficient non nul (a, sinon b) positif. */
export function normaliser(d: D): D {
  const g = pgcd(pgcd(d.a, d.b), d.c) || 1;
  const s = d.a < 0 || (d.a === 0 && d.b < 0) ? -1 : 1;
  return { a: (s * d.a) / g + 0, b: (s * d.b) / g + 0, c: (s * d.c) / g + 0 };
}

/** Droite passant par P, de vecteur directeur u : a = y_u, b = −x_u (vecteur directeur (−b ; a)). */
export function droitePointDirecteur(Pt: P, u: P): D {
  const a = u.y;
  const b = -u.x;
  return { a, b, c: -(a * Pt.x + b * Pt.y) };
}

export function valeurEn(d: D, Pt: P): number {
  return d.a * Pt.x + d.b * Pt.y + d.c;
}

export function surDroite(d: D, Pt: P): boolean {
  return Math.abs(valeurEn(d, Pt)) < 1e-9;
}

export function intersection(d1: D, d2: D): P | null {
  const det = d1.a * d2.b - d2.a * d1.b;
  if (Math.abs(det) < 1e-12) return null;
  return { x: (d1.b * d2.c - d2.b * d1.c) / det + 0, y: (d2.a * d1.c - d1.a * d2.c) / det + 0 };
}

/** Deux triplets proportionnels (même droite). */
export function memeDroite(d1: D, d2: D): boolean {
  const e = 1e-7;
  return Math.abs(d1.a * d2.b - d2.a * d1.b) < e && Math.abs(d1.a * d2.c - d2.a * d1.c) < e && Math.abs(d1.b * d2.c - d2.b * d1.c) < e;
}

export function memeDirection(d1: D, d2: D): boolean {
  return Math.abs(d1.a * d2.b - d2.a * d1.b) < 1e-7;
}

export const distance2 = (A: P, B: P) => (B.x - A.x) ** 2 + (B.y - A.y) ** 2;

// ---------------------------------------------------------------------------------------------
// Écritures (KaTeX)
// ---------------------------------------------------------------------------------------------

/** « 3 », « −2 », « \dfrac{1}{2} », « 2\sqrt{5} ». */
export function nb(v: number): string {
  return n(v);
}

/** Nombre entre parenthèses s'il est négatif (facteur, terme soustrait). */
export function nbp(v: number): string {
  return v < 0 ? `(${n(v)})` : n(v);
}

/** « A(3\,;-2) ». */
export function pointL(nom: string, Pt: P): string {
  return `${nom}(${n(Pt.x)}\\,;${n(Pt.y)})`;
}

/** « (3\,;-2) ». */
export function coordL(Pt: P): string {
  return `(${n(Pt.x)}\\,;${n(Pt.y)})`;
}

/** Vecteur en colonne, comme dans le cours : « \vec{u}\begin{pmatrix}2\\-1\end{pmatrix} ». */
export function colonne(x: string | number, y: string | number): string {
  const f = (v: string | number) => (typeof v === "number" ? n(v) : v);
  return `\\begin{pmatrix}${f(x)}\\\\${f(y)}\\end{pmatrix}`;
}

export function vecL(nom: string, v: P): string {
  return `\\vec{${nom}}${colonne(v.x, v.y)}`;
}

/** Membre de gauche « 2x-y+3 ». */
export function membreDroite(d: D): string {
  return somme([
    [d.a, "x"],
    [d.b, "y"],
    [d.c, ""],
  ]);
}

/** « 2x-y+3=0 ». */
export function equationL(d: D): string {
  return `${membreDroite(d)}=0`;
}

/** « d\equiv 2x-y+3=0 » (notation du cours). */
export function droiteNommeeL(nom: string, d: D): string {
  return `${nom}\\equiv ${equationL(d)}`;
}

/** Terme « + 3 », « − 2t », « » (coefficient nul). */
export function plusTerme(coef: number, partie = ""): string {
  if (Math.abs(coef) < 1e-12) return "";
  const c = Math.abs(coef);
  const corps = partie === "" ? q(c) : c === 1 ? partie : `${q(c)}${partie}`;
  return coef > 0 ? `+${corps}` : `-${corps}`;
}

/** Produit « coef(inner) » dans une somme : « 2(1+t) », « -(3-t) », « +(…) », « -3(…) » (premier
 * terme : sans « + »). */
export function produitTerme(coef: number, inner: string, premier = false): string {
  const c = Math.abs(coef);
  const corps = `${c === 1 ? "" : q(c)}(${inner})`;
  if (coef < 0) return `-${corps}`;
  return premier ? corps : `+${corps}`;
}

/** Terme « a·v » substitué dans une somme : « 2\cdot 3 », « -(-1) », « +3\cdot(-2) », « -5 ». */
export function termeProduit(coef: number, v: number, premier = false): string {
  const c = Math.abs(coef);
  const val = c === 1 ? (premier && coef > 0 ? n(v) : nbp(v)) : `${n(c)}\\cdot ${nbp(v)}`;
  if (coef < 0) return `-${val}`;
  return premier ? val : `+${val}`;
}

/** « 1+2t » (x₀ + a·t), « 2t » si x₀ = 0. */
export function affineL(x0: number, a: number, param = "t"): string {
  if (x0 === 0) return a === 0 ? "0" : somme([[a, param]]);
  return `${n(x0)}${plusTerme(a, param)}`;
}

/** Équations paramétriques « \begin{cases}x=1+2t\\y=-3-t\end{cases} ». */
export function parametriquesL(Pt: P, u: P, param = "t"): string {
  const ligne = (x0: number, a: number) => (x0 === 0 ? (a === 0 ? "0" : somme([[a, param]])) : `${n(x0)}${plusTerme(a, param)}`);
  return `\\begin{cases}x=${ligne(Pt.x, u.x)}\\\\y=${ligne(Pt.y, u.y)}\\end{cases}`;
}

/** Racine exacte d'un entier ou d'un rationnel positif : « 5 », « 2\sqrt{5} ». */
export function racineL(carre: number): string {
  return n(Math.sqrt(carre));
}

// ---------------------------------------------------------------------------------------------
// Lecture des saisies
// ---------------------------------------------------------------------------------------------

/** Équation de droite écrite sous n'importe quelle forme (« 2x − y + 3 = 0 », « y = 2x + 3 »,
 * « y − 1 = 2(x + 1) », « x = 4 »…) : coefficients (a, b, c) de « gauche − droite = 0 », relus par
 * évaluation en plusieurs points (linéarité contrôlée) ; `null` si illisible ou pas une droite. */
export function lireDroite(saisie: string): D | null {
  const s0 = normaliserExpression(saisie).replace(/^\s*[a-zA-Z][a-zA-Z0-9_′']*\s*(≡|:)\s*/, "").replace(/≡/g, "=");
  const cotes = s0.split("=");
  if (cotes.length !== 2 || cotes[0]!.trim() === "" || cotes[1]!.trim() === "") return null;
  if (/[a-wzA-WZ]/.test(s0.replace(/sqrt/g, ""))) return null;
  const f = (x: number, y: number) => {
    const g = evaluerExpressionGenerale(cotes[0]!, x, { y });
    const d = evaluerExpressionGenerale(cotes[1]!, x, { y });
    return g - d;
  };
  try {
    const c = f(0, 0);
    const a = f(1, 0) - c;
    const b = f(0, 1) - c;
    if (![a, b, c].every(Number.isFinite)) return null;
    if (Math.abs(a) < 1e-9 && Math.abs(b) < 1e-9) return null;
    for (const [x, y] of [
      [2.5, -1.25],
      [-3.5, 4.75],
      [0.37, 2.9],
    ] as const) {
      const v = f(x, y);
      if (!Number.isFinite(v) || Math.abs(v - (a * x + b * y + c)) > 1e-7 * Math.max(1, Math.abs(v))) return null;
    }
    return { a, b, c };
  } catch {
    return null;
  }
}

const MOTS_AUCUN = /^(aucun(e)?( point(s)?)?( commun(s)?)?|pas de point(s)?( commun(s)?)?|rien|vide|∅|ø|Ø|\{\s*\})$/i;

/** Liste de points « (1 ; 2) ; (−3 ; 0) » (noms et « et » tolérés, « (1, 2) » accepté) ; `[]` pour
 * « aucun » ; `null` si illisible. */
export function lirePoints(saisie: string): P[] | null {
  const s = normaliserSigneMoins(saisie).trim();
  if (MOTS_AUCUN.test(s)) return [];
  const groupes = [...s.matchAll(/\(([^()]*)\)/g)];
  if (groupes.length === 0) return null;
  const reste = s.replace(/\(([^()]*)\)/g, " ");
  if (!/^[\s;,.=A-Za-zÀ-ÿ₀-₉0-9′']*$/.test(reste) || /\d/.test(reste.replace(/[A-Za-z]\s*[₀-₉0-9]/g, ""))) return null;
  const points: P[] = [];
  for (const g of groupes) {
    const interieur = g[1]!.trim();
    let morceaux: string[];
    if (interieur.includes(";")) morceaux = interieur.split(";");
    else if (interieur.includes("|")) morceaux = interieur.split("|");
    else if ((interieur.match(/,/g) ?? []).length === 1) morceaux = interieur.split(",");
    else return null;
    if (morceaux.length !== 2) return null;
    const x = lireNombre(morceaux[0]!);
    const y = lireNombre(morceaux[1]!);
    if (x === null || y === null) return null;
    points.push({ x, y });
  }
  return points;
}

/** LaTeX d'une saisie de points (fiche de l'écran). */
export function pointsSaisisL(saisie: string): string | null {
  const p = lirePoints(saisie);
  if (p === null) return null;
  return p.length === 0 ? "\\text{aucun point}" : p.map(coordL).join("\\ ;\\ ");
}

/** LaTeX d'une équation de droite saisie (fiche de l'écran), telle que relue. */
export function droiteSaisieL(saisie: string): string | null {
  const d = lireDroite(saisie);
  return d ? equationL(normaliser(arrondirDroite(d))) : null;
}

function arrondirDroite(d: D): D {
  // Les coefficients relus d'une saisie à coefficients entiers ou fractionnaires : ramenés à des
  // entiers (dénominateurs ≤ 60) pour l'affichage.
  for (let k = 1; k <= 60; k++) {
    const a = d.a * k;
    const b = d.b * k;
    const c = d.c * k;
    if ([a, b, c].every((v) => Math.abs(v - Math.round(v)) < 1e-6)) return { a: Math.round(a), b: Math.round(b), c: Math.round(c) };
  }
  return d;
}

// ---------------------------------------------------------------------------------------------
// Champs libres de la coquille commune
// ---------------------------------------------------------------------------------------------

export interface PiegeDroite {
  droite: D;
  message: string;
}

/** Équation de droite : toute écriture équivalente acceptée ; pièges reconnus (droite exacte) ;
 * « bonne direction mais pas le bon point » et « passe par le point mais mauvaise direction »
 * signalés par `directionOk` / `pointOk`. */
export function champDroite(o: {
  id: string;
  libelle: Fr;
  cible: D;
  pieges?: PiegeDroite[];
  messageSiFaux: string;
  /** Point par lequel la droite doit passer (message ciblé). */
  point?: { P: P; message: string };
  /** Message quand la direction est bonne mais la droite décalée. */
  messageDirection?: string;
}): ChampLibre {
  return {
    type: "libre",
    id: o.id,
    libelle: o.libelle,
    apercu: true,
    aideSaisie: "Écris une équation de droite complète, avec « = » : par exemple 2x − y + 3 = 0 ou y = 2x + 3.",
    affichee: droiteSaisieL,
    diagnostiquer: (saisie) => {
      const d = lireDroite(saisie);
      if (!d) return { etat: "parse_error" };
      if (memeDroite(d, o.cible)) return { etat: "correct" };
      const p = o.pieges?.find((x) => memeDroite(d, x.droite));
      if (p) return { etat: "piege", message: p.message };
      if (o.point && !surDroite(d, o.point.P) && memeDirection(d, o.cible)) return { etat: "faux", message: o.messageDirection ?? o.point.message };
      if (o.point && surDroite(d, o.point.P)) return { etat: "faux", message: o.point.message };
      return { etat: "faux", message: o.messageSiFaux };
    },
  };
}

export interface PiegePoints {
  points: P[];
  message: string;
}

/** Liste de points (0, 1 ou 2…) : ordre libre ; « aucun » pour la liste vide. */
export function champPoints(o: { id: string; libelle: Fr; cibles: P[]; pieges?: PiegePoints[]; messageSiFaux: string }): ChampLibre {
  const memeEnsemble = (u: P[], v: P[]) => {
    const uu = u.filter((p, i) => u.findIndex((w) => memePoint(w, p)) === i);
    const vv = v.filter((p, i) => v.findIndex((w) => memePoint(w, p)) === i);
    return uu.length === vv.length && uu.every((p) => vv.some((w) => memePoint(w, p)));
  };
  return {
    type: "libre",
    id: o.id,
    libelle: o.libelle,
    aideSaisie: "Écris chaque point entre parenthèses, coordonnées séparées par « ; » : (1 ; −2) ; (3 ; 0). S'il n'y en a aucun, écris « aucun ».",
    affichee: pointsSaisisL,
    diagnostiquer: (saisie) => {
      const pts = lirePoints(saisie);
      if (pts === null) return { etat: "parse_error" };
      if (memeEnsemble(pts, o.cibles)) return { etat: "correct" };
      const p = o.pieges?.find((x) => memeEnsemble(pts, x.points));
      if (p) return { etat: "piege", message: p.message };
      const echanges = pts.map((p2) => ({ x: p2.y, y: p2.x }));
      if (pts.length > 0 && memeEnsemble(echanges, o.cibles)) return { etat: "piege", message: "Tes coordonnées sont inversées : on écrit d'abord l'abscisse x, puis l'ordonnée y." };
      if (pts.length < o.cibles.length && pts.every((p2) => o.cibles.some((c) => memePoint(c, p2)))) return { etat: "faux", message: "Ce que tu as écrit est juste, mais il manque au moins un point." };
      if (pts.length > o.cibles.length && o.cibles.every((c) => pts.some((p2) => memePoint(c, p2)))) return { etat: "faux", message: "Tu as écrit un point de trop : vérifie que chaque point est bien sur les deux courbes." };
      return { etat: "faux", message: o.messageSiFaux };
    },
  };
}

// ---------------------------------------------------------------------------------------------
// Figure : repère quadrillé (papier et écran), même échelle sur les deux axes, aucun `id`
// ---------------------------------------------------------------------------------------------

export interface Fenetre {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
}

export interface SpecFigure {
  fenetre: Fenetre;
  /** Côté d'un carreau, en px. */
  unite?: number;
  droites?: { d: D; couleur?: string; epaisseur?: number; pointille?: boolean; label?: string }[];
  cercles?: { centre: P; rayon: number; couleur?: string }[];
  courbes?: { points: P[]; couleur?: string }[];
  segments?: { A: P; B: P; couleur?: string; pointille?: boolean; fleche?: boolean; epaisseur?: number }[];
  points?: { P: P; label?: string; couleur?: string; position?: "ne" | "no" | "se" | "so" | "n" | "s" | "e" | "o"; creux?: boolean }[];
}

const NOIR = "#1b1d22";
export const COULEURS = { accent: "#c2410c", vert: "#2f7d32", bleu: "#1f5fa8", gris: "#6b7280", noir: NOIR };

function fmt(v: number): string {
  return String(Math.round(v * 100) / 100);
}

/** Bornes entières couvrant des points, avec une marge, et au moins `min` unités par axe. */
export function fenetreAutour(points: P[], marge = 1, min = 6): Fenetre {
  let xMin = Math.floor(Math.min(...points.map((p) => p.x)) - marge);
  let xMax = Math.ceil(Math.max(...points.map((p) => p.x)) + marge);
  let yMin = Math.floor(Math.min(...points.map((p) => p.y)) - marge);
  let yMax = Math.ceil(Math.max(...points.map((p) => p.y)) + marge);
  xMin = Math.min(xMin, -1);
  yMin = Math.min(yMin, -1);
  xMax = Math.max(xMax, 1);
  yMax = Math.max(yMax, 1);
  while (xMax - xMin < min) {
    xMax++;
    if (xMax - xMin < min) xMin--;
  }
  while (yMax - yMin < min) {
    yMax++;
    if (yMax - yMin < min) yMin--;
  }
  return { xMin, xMax, yMin, yMax };
}

/** Segment d'une droite à l'intérieur de la fenêtre (null si elle ne la traverse pas). */
function segmentDansFenetre(d: D, f: Fenetre): [P, P] | null {
  const pts: P[] = [];
  if (Math.abs(d.b) > 1e-12) {
    for (const x of [f.xMin, f.xMax]) {
      const y = -(d.a * x + d.c) / d.b;
      if (y >= f.yMin - 1e-9 && y <= f.yMax + 1e-9) pts.push({ x, y });
    }
  }
  if (Math.abs(d.a) > 1e-12) {
    for (const y of [f.yMin, f.yMax]) {
      const x = -(d.b * y + d.c) / d.a;
      if (x >= f.xMin - 1e-9 && x <= f.xMax + 1e-9) pts.push({ x, y });
    }
  }
  const uniques = pts.filter((p, i) => pts.findIndex((w) => Math.abs(w.x - p.x) < 1e-9 && Math.abs(w.y - p.y) < 1e-9) === i);
  return uniques.length >= 2 ? [uniques[0]!, uniques[1]!] : null;
}

export function figureRepere(spec: SpecFigure): string {
  const f = spec.fenetre;
  const u = spec.unite ?? 20;
  const m = 18;
  const L = (f.xMax - f.xMin) * u;
  const H = (f.yMax - f.yMin) * u;
  const W = L + 2 * m;
  const Ht = H + 2 * m;
  const X = (x: number) => m + (x - f.xMin) * u;
  const Y = (y: number) => m + (f.yMax - y) * u;
  const dans = (p: P) => p.x >= f.xMin - 1e-9 && p.x <= f.xMax + 1e-9 && p.y >= f.yMin - 1e-9 && p.y <= f.yMax + 1e-9;
  const parts: string[] = [];
  parts.push(`<rect x="0" y="0" width="${W}" height="${Ht}" fill="#ffffff"/>`);
  // Quadrillage d'une unité.
  for (let x = f.xMin; x <= f.xMax; x++) parts.push(`<line x1="${fmt(X(x))}" y1="${fmt(Y(f.yMax))}" x2="${fmt(X(x))}" y2="${fmt(Y(f.yMin))}" stroke="#d9dde3" stroke-width="0.8"/>`);
  for (let y = f.yMin; y <= f.yMax; y++) parts.push(`<line x1="${fmt(X(f.xMin))}" y1="${fmt(Y(y))}" x2="${fmt(X(f.xMax))}" y2="${fmt(Y(y))}" stroke="#d9dde3" stroke-width="0.8"/>`);
  // Axes fléchés (si dans la fenêtre).
  if (f.yMin <= 0 && f.yMax >= 0) {
    parts.push(`<line x1="${fmt(X(f.xMin))}" y1="${fmt(Y(0))}" x2="${fmt(X(f.xMax) + 8)}" y2="${fmt(Y(0))}" stroke="${NOIR}" stroke-width="1.2"/>`);
    parts.push(`<polygon points="${fmt(X(f.xMax) + 12)},${fmt(Y(0))} ${fmt(X(f.xMax) + 4)},${fmt(Y(0) - 4)} ${fmt(X(f.xMax) + 4)},${fmt(Y(0) + 4)}" fill="${NOIR}"/>`);
  }
  if (f.xMin <= 0 && f.xMax >= 0) {
    parts.push(`<line x1="${fmt(X(0))}" y1="${fmt(Y(f.yMin))}" x2="${fmt(X(0))}" y2="${fmt(Y(f.yMax) - 8)}" stroke="${NOIR}" stroke-width="1.2"/>`);
    parts.push(`<polygon points="${fmt(X(0))},${fmt(Y(f.yMax) - 12)} ${fmt(X(0) - 4)},${fmt(Y(f.yMax) - 4)} ${fmt(X(0) + 4)},${fmt(Y(f.yMax) - 4)}" fill="${NOIR}"/>`);
  }
  // Graduations : 1 (et l'origine) — au plus une graduation sur deux si la fenêtre est grande.
  const pas = Math.max(f.xMax - f.xMin, f.yMax - f.yMin) > 16 ? 2 : 1;
  const ecr = (v: number) => (v < 0 ? `−${-v}` : `${v}`);
  if (f.yMin <= 0 && f.yMax >= 0) {
    for (let x = Math.ceil(f.xMin / pas) * pas; x <= f.xMax; x += pas) {
      if (x === 0 || x === f.xMax) continue;
      parts.push(`<text x="${fmt(X(x))}" y="${fmt(Y(0) + 12)}" font-size="10" text-anchor="middle" fill="${NOIR}" font-family="sans-serif">${ecr(x)}</text>`);
    }
  }
  if (f.xMin <= 0 && f.xMax >= 0) {
    for (let y = Math.ceil(f.yMin / pas) * pas; y <= f.yMax; y += pas) {
      if (y === 0 || y === f.yMax) continue;
      parts.push(`<text x="${fmt(X(0) - 4)}" y="${fmt(Y(y) + 3.5)}" font-size="10" text-anchor="end" fill="${NOIR}" font-family="sans-serif">${ecr(y)}</text>`);
    }
    if (f.yMin <= 0 && f.yMax >= 0) parts.push(`<text x="${fmt(X(0) - 4)}" y="${fmt(Y(0) + 12)}" font-size="10" text-anchor="end" fill="${NOIR}" font-family="sans-serif">0</text>`);
  }
  for (const c of spec.cercles ?? []) {
    parts.push(`<circle cx="${fmt(X(c.centre.x))}" cy="${fmt(Y(c.centre.y))}" r="${fmt(c.rayon * u)}" fill="none" stroke="${c.couleur ?? COULEURS.bleu}" stroke-width="2"/>`);
  }
  for (const c of spec.courbes ?? []) {
    let chemin = "";
    let ouvert = false;
    for (const p of c.points) {
      if (!dans(p)) {
        ouvert = false;
        continue;
      }
      chemin += `${ouvert ? "L" : "M"}${fmt(X(p.x))},${fmt(Y(p.y))} `;
      ouvert = true;
    }
    if (chemin) parts.push(`<path d="${chemin.trim()}" fill="none" stroke="${c.couleur ?? COULEURS.vert}" stroke-width="2"/>`);
  }
  for (const dr of spec.droites ?? []) {
    const s = segmentDansFenetre(dr.d, f);
    if (!s) continue;
    parts.push(
      `<line x1="${fmt(X(s[0].x))}" y1="${fmt(Y(s[0].y))}" x2="${fmt(X(s[1].x))}" y2="${fmt(Y(s[1].y))}" stroke="${dr.couleur ?? COULEURS.accent}" stroke-width="${dr.epaisseur ?? 2}"${dr.pointille ? ' stroke-dasharray="6 4"' : ""}/>`,
    );
    if (dr.label) {
      // Étiquette près de l'extrémité la plus haute, décalée vers l'intérieur.
      const haut = s[0].y >= s[1].y ? s[0] : s[1];
      const bas = haut === s[0] ? s[1] : s[0];
      const px = X(haut.x) + (X(bas.x) - X(haut.x)) * 0.08;
      const py = Y(haut.y) + (Y(bas.y) - Y(haut.y)) * 0.08;
      const dx = px > W / 2 ? -8 : 8;
      parts.push(
        `<text x="${fmt(px + dx)}" y="${fmt(py + 4)}" font-size="13" font-style="italic" text-anchor="${dx < 0 ? "end" : "start"}" fill="${dr.couleur ?? COULEURS.accent}" font-family="serif" stroke="#ffffff" stroke-width="3" paint-order="stroke">${dr.label}</text>`,
      );
    }
  }
  for (const sg of spec.segments ?? []) {
    parts.push(
      `<line x1="${fmt(X(sg.A.x))}" y1="${fmt(Y(sg.A.y))}" x2="${fmt(X(sg.B.x))}" y2="${fmt(Y(sg.B.y))}" stroke="${sg.couleur ?? NOIR}" stroke-width="${sg.epaisseur ?? 1.6}"${sg.pointille ? ' stroke-dasharray="5 4"' : ""}/>`,
    );
    if (sg.fleche) {
      const ax = X(sg.A.x), ay = Y(sg.A.y), bx = X(sg.B.x), by = Y(sg.B.y);
      const lg = Math.hypot(bx - ax, by - ay) || 1;
      const ux = (bx - ax) / lg, uy = (by - ay) / lg;
      const mx = (ax + bx) / 2 + ux * 5, my = (ay + by) / 2 + uy * 5;
      parts.push(`<polygon points="${fmt(mx)},${fmt(my)} ${fmt(mx - ux * 9 - uy * 4.5)},${fmt(my - uy * 9 + ux * 4.5)} ${fmt(mx - ux * 9 + uy * 4.5)},${fmt(my - uy * 9 - ux * 4.5)}" fill="${sg.couleur ?? NOIR}"/>`);
    }
  }
  const DECALAGES: Record<string, [number, number, string]> = {
    ne: [6, -6, "start"],
    no: [-6, -6, "end"],
    se: [6, 14, "start"],
    so: [-6, 14, "end"],
    n: [0, -8, "middle"],
    s: [0, 17, "middle"],
    e: [8, 4, "start"],
    o: [-8, 4, "end"],
  };
  for (const pt of spec.points ?? []) {
    if (!dans(pt.P)) continue;
    const cx = X(pt.P.x), cy = Y(pt.P.y);
    const couleur = pt.couleur ?? NOIR;
    parts.push(pt.creux ? `<circle cx="${fmt(cx)}" cy="${fmt(cy)}" r="3.6" fill="#ffffff" stroke="${couleur}" stroke-width="1.6"/>` : `<circle cx="${fmt(cx)}" cy="${fmt(cy)}" r="3.4" fill="${couleur}"/>`);
    if (pt.label) {
      let pos = pt.position ?? "ne";
      if (cx > W - 40 && pos.includes("e")) pos = pos.replace("e", "o") as typeof pos;
      if (cx < 40 && pos.includes("o")) pos = pos.replace("o", "e") as typeof pos;
      if (cy < 22 && pos.startsWith("n")) pos = (pos === "n" ? "s" : pos.replace("n", "s")) as typeof pos;
      if (cy > Ht - 22 && pos.startsWith("s")) pos = (pos === "s" ? "n" : pos.replace("s", "n")) as typeof pos;
      const [dx, dy, ancre] = DECALAGES[pos]!;
      parts.push(
        `<text x="${fmt(cx + dx)}" y="${fmt(cy + dy)}" font-size="12.5" text-anchor="${ancre}" fill="${couleur}" font-family="sans-serif" font-weight="600" stroke="#ffffff" stroke-width="3" paint-order="stroke">${pt.label}</text>`,
      );
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${Ht}" viewBox="0 0 ${W} ${Ht}" role="img">${parts.join("")}</svg>`;
}

/** Étiquette de coordonnées d'un point dans une figure (texte brut, « − » typographique). */
export function etiquette(nom: string, Pt: P): string {
  const e = (v: number) => {
    const s = Number.isInteger(v) ? String(Math.abs(v)) : q(Math.abs(v)).replace(/\\dfrac\{(\d+)\}\{(\d+)\}/, "$1/$2");
    return `${v < 0 ? "−" : ""}${s}`;
  };
  return `${nom}(${e(Pt.x)} ; ${e(Pt.y)})`;
}

/** Un nombre écrit en texte (« −3 », « 5/2 »). */
export function nombreTexte(v: number): string {
  const s = Number.isInteger(v) ? String(Math.abs(v)) : q(Math.abs(v)).replace(/\\dfrac\{(\d+)\}\{(\d+)\}/, "$1/$2");
  return `${v < 0 ? "−" : ""}${s}`;
}
