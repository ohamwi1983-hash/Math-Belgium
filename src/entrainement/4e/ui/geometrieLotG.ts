import { latex, texte } from "../../export/corrigeTableau";
import type { FragmentConsigne } from "../../export/genererFeuilleExercices";
import { verifierEquationXY, verifierValeurExacte, type PiegeEquationXY, type PiegeValeur } from "../moteur/equationXY";
import type { Champ, ChampNombre } from "./ecransTransfertSecondDegre";
import { moinsH, q, racineCarreeLatex, somme } from "./corrigeChapitre3";

/**
 * Écritures et champs communs du lot G du chapitre 7 de 4e (gen92–gen95, « Géométrie analytique
 * plane ») — SOURCE UNIQUE pour l'écran, les aides, le papier et le corrigé. Notation du cours :
 * point P(x ; y), vecteur en colonne, droite d ≡ ax + by + c = 0, cercle (x − x₀)² + (y − y₀)² = r²,
 * « − » typographique, valeurs exactes (racines simplifiées). Jamais « déterminant » (critère de
 * colinéarité), jamais de radian.
 */

export type Fragments = FragmentConsigne[];

export interface Pt {
  x: number;
  y: number;
}

/** Droite ax + by + c = 0 (coefficients entiers). */
export interface Droite {
  a: number;
  b: number;
  c: number;
}

export function pgcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a;
}

export function entier(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function choisir<T>(t: readonly T[]): T {
  return t[Math.floor(Math.random() * t.length)]!;
}

export function signe(): 1 | -1 {
  return Math.random() < 0.5 ? 1 : -1;
}

/** Coefficients entiers premiers entre eux, premier coefficient non nul positif. */
export function reduireDroite(d0: Droite): Droite {
  // Coefficients rationnels (point de passage à coordonnées fractionnaires) : ramenés à des entiers.
  let k = 1;
  while (k < 120 && ![d0.a, d0.b, d0.c].every((v) => Math.abs(v * k - Math.round(v * k)) < 1e-7)) k++;
  const d = { a: Math.round(d0.a * k), b: Math.round(d0.b * k), c: Math.round(d0.c * k) };
  const g = pgcd(pgcd(d.a, d.b), d.c) || 1;
  const s = d.a < 0 || (d.a === 0 && d.b < 0) ? -1 : 1;
  const z = (v: number) => (v === 0 ? 0 : v);
  return { a: z((s * d.a) / g), b: z((s * d.b) / g), c: z((s * d.c) / g) };
}

/** Droite par le point P de vecteur NORMAL n : n·(X − P) = 0. */
export function droiteNormale(p: Pt, n: Pt): Droite {
  return reduireDroite({ a: n.x, b: n.y, c: -(n.x * p.x + n.y * p.y) });
}

/** Droite par le point P de vecteur DIRECTEUR u : vecteur normal (−u_y ; u_x). */
export function droiteDirectrice(p: Pt, u: Pt): Droite {
  return droiteNormale(p, { x: -u.y, y: u.x });
}

/** Droite (AB). */
export function droitePoints(a: Pt, b: Pt): Droite {
  return droiteDirectrice(a, { x: b.x - a.x, y: b.y - a.y });
}

export function valeurDroite(d: Droite, x: number, y: number): number {
  return d.a * x + d.b * y + d.c;
}

/** Intersection de deux droites sécantes (sinon `null`). */
export function intersection(d1: Droite, d2: Droite): Pt | null {
  const k = d1.a * d2.b - d2.a * d1.b;
  if (Math.abs(k) < 1e-12) return null;
  return { x: (d1.b * d2.c - d2.b * d1.c) / k, y: (d2.a * d1.c - d1.a * d2.c) / k };
}

/** Pied de la perpendiculaire à d menée par P. */
export function pied(d: Droite, p: Pt): Pt {
  return intersection(d, droiteDirectrice(p, { x: d.a, y: d.b }))!;
}

export function vecteur(a: Pt, b: Pt): Pt {
  return { x: b.x - a.x, y: b.y - a.y };
}

export function norme2(v: Pt): number {
  return v.x * v.x + v.y * v.y;
}

export function milieu(a: Pt, b: Pt): Pt {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

export function memePoint(a: Pt, b: Pt): boolean {
  return Math.abs(a.x - b.x) < 1e-9 && Math.abs(a.y - b.y) < 1e-9;
}

/* ---------------------------------------------------------------------------------------------
 * Écritures LaTeX
 * ------------------------------------------------------------------------------------------- */

/** « ax+by+c » (terme nul omis). */
export function membreDroite(d: Droite): string {
  return somme([
    [d.a, "x"],
    [d.b, "y"],
    [d.c, ""],
  ]);
}

/** « ax+by+c=0 ». */
export function droiteLatex(d: Droite): string {
  return `${membreDroite(d)}=0`;
}

/** « d\equiv ax+by+c=0 ». */
export function droiteNommee(nom: string, d: Droite): string {
  return `${nom}\\equiv ${droiteLatex(d)}`;
}

export function coordonnees(p: Pt): string {
  return `(${q(p.x)}\\,;${q(p.y)})`;
}

export function pointLatex(nom: string, p: Pt): string {
  return `${nom}${coordonnees(p)}`;
}

export function colonne(v: Pt): string {
  return `\\begin{pmatrix}${q(v.x)}\\\\${q(v.y)}\\end{pmatrix}`;
}

export function vecteurLatex(nom: string, v: Pt): string {
  return `\\vec{${nom}}${colonne(v)}`;
}

/** « (x−a)^2 » ou « x^2 ». */
export function carreLatex(a: number, variable: "x" | "y"): string {
  return a === 0 ? `${variable}^2` : `(${moinsH(a, variable)})^2`;
}

/** Cercle non développé « (x−a)²+(y−b)²=r² ». */
export function cercleLatex(c: Pt, r2: number): string {
  return `${carreLatex(c.x, "x")}+${carreLatex(c.y, "y")}=${q(r2)}`;
}

/** Cercle développé « x²+y²+Dx+Ey+F=0 ». */
export function cercleDeveloppeLatex(c: Pt, r2: number): string {
  return `${somme([
    [1, "x^2"],
    [1, "y^2"],
    [-2 * c.x, "x"],
    [-2 * c.y, "y"],
    [c.x * c.x + c.y * c.y - r2, ""],
  ])}=0`;
}

/** Valeur exacte d'une racine carrée (« 5 », « 2\sqrt{5} », « \dfrac{\sqrt{10}}{2} »). */
export function racine(n: number): string {
  return racineCarreeLatex(n);
}

/** « \sqrt{20}=2\sqrt{5} » (ou « \sqrt{25}=5 », ou « \sqrt{7} » si rien à simplifier). */
export function racineDetaillee(n: number): string {
  const r = racine(n);
  const brut = `\\sqrt{${q(n)}}`;
  return r === brut ? brut : `${brut}=${r}`;
}

/** Norme d'un vecteur, calcul détaillé « \sqrt{3^2+(-4)^2}=\sqrt{25}=5 ». */
export function normeDetaillee(v: Pt): string {
  const carre = (t: number) => (t < 0 ? `(${q(t)})^2` : `${q(t)}^2`);
  return `\\sqrt{${carre(v.x)}+${carre(v.y)}}=${racineDetaillee(norme2(v))}`;
}

/** Nombre en texte brut (justifications) : « −3 », « 5/2 ». */
export function nb(v: number): string {
  const s = q(v)
    .replace(/\\dfrac\{(\d+)\}\{(\d+)\}/, "$1/$2")
    .replace(/\{,\}/g, ",");
  return s.replace(/^-/, "−");
}

/* ---------------------------------------------------------------------------------------------
 * Champs (coquille `AppTransfertSecondDegre`)
 * ------------------------------------------------------------------------------------------- */

export const AIDE_SAISIE_EQUATION = "Équation : écris x² ou x^2, les produits peuvent rester implicites (3x, 2(y − 1)) ; toute forme équivalente est acceptée.";
export const AIDE_SAISIE_EXACTE = "Valeur exacte : entier, fraction (5/2) ou racine (√20, 2√5).";

function sansDoublonsValeurs(cible: number, p: PiegeValeur[]): PiegeValeur[] {
  return p.filter((x, i) => Math.abs(x.valeur - cible) > 1e-9 && p.findIndex((y) => Math.abs(y.valeur - x.valeur) < 1e-9) === i);
}

/** Deux champs « x_P = », « y_P = » (nombres exacts : entiers ou fractions). */
export function champsPoint(nom: string, p: Pt, piegesX: PiegeValeur[] = [], piegesY: PiegeValeur[] = [], messageSiFaux?: string): ChampNombre[] {
  const indice = nom.length > 1 ? `{${nom}}` : nom;
  return [
    { type: "nombre", id: `x${nom}`, libelle: [latex(`x_${indice}=`)], cible: p.x, pieges: sansDoublonsValeurs(p.x, piegesX), messageSiFaux },
    { type: "nombre", id: `y${nom}`, libelle: [latex(`y_${indice}=`)], cible: p.y, pieges: sansDoublonsValeurs(p.y, piegesY), messageSiFaux },
  ];
}

/** Pièges sur un point entier : chaque piège donne un point, réparti sur les deux champs. */
export function piegesPoint(cible: Pt, pieges: { p: Pt; message: string }[]): { x: PiegeValeur[]; y: PiegeValeur[] } {
  const x: PiegeValeur[] = [];
  const y: PiegeValeur[] = [];
  for (const { p, message } of pieges) {
    if (memePoint(p, cible)) continue;
    if (Math.abs(p.x - cible.x) > 1e-9) x.push({ valeur: p.x, message });
    if (Math.abs(p.y - cible.y) > 1e-9) y.push({ valeur: p.y, message });
  }
  return { x, y };
}

/** Champ « équation de droite » : toute équation équivalente est acceptée. */
export function champDroite(id: string, libelle: Fragments, cible: Droite, pieges: { d: Droite; message: string }[], messageSiFaux: string): Champ {
  const f = (d: Droite) => (x: number, y: number) => valeurDroite(d, x, y);
  const autres: PiegeEquationXY[] = pieges
    .filter((p) => {
      const r = reduireDroite(p.d);
      const c = reduireDroite(cible);
      return !(r.a === c.a && r.b === c.b && r.c === c.c) && (p.d.a !== 0 || p.d.b !== 0);
    })
    .map((p) => ({ f: f(p.d), message: p.message }));
  return {
    type: "personnalise",
    id,
    libelle,
    apercu: true,
    aideSaisie: AIDE_SAISIE_EQUATION,
    verifier: (s) => verifierEquationXY(s, f(cible), autres, messageSiFaux),
  };
}

/** Fonction « (x−a)²+(y−b)²−r² ». */
export function fonctionCercle(c: Pt, r2: number) {
  return (x: number, y: number) => (x - c.x) ** 2 + (y - c.y) ** 2 - r2;
}

/** Champ « équation de cercle » : non développée ou développée, toute écriture équivalente. */
export function champCercle(id: string, centre: Pt, r2: number, pieges: { centre: Pt; r2: number; message: string }[], messageSiFaux: string): Champ {
  const autres: PiegeEquationXY[] = pieges
    .filter((p) => !(memePoint(p.centre, centre) && Math.abs(p.r2 - r2) < 1e-9) && p.r2 > 0)
    .map((p) => ({ f: fonctionCercle(p.centre, p.r2), message: p.message }));
  return {
    type: "personnalise",
    id,
    libelle: [texte("Équation :")],
    apercu: true,
    aideSaisie: AIDE_SAISIE_EQUATION,
    verifier: (s) => verifierEquationXY(s, fonctionCercle(centre, r2), autres, messageSiFaux),
  };
}

/** Champ « valeur exacte » (longueur, rayon, distance, aire). */
export function champExact(id: string, libelle: Fragments, cible: number, pieges: PiegeValeur[], messageSiFaux: string, unite?: string): Champ {
  const p = sansDoublonsValeurs(cible, pieges);
  return {
    type: "personnalise",
    id,
    libelle,
    unite,
    aideSaisie: AIDE_SAISIE_EXACTE,
    verifier: (s) => verifierValeurExacte(s, cible, p, messageSiFaux),
  };
}
