import type { FragmentConsigne } from "../../export/genererFeuilleExercices";
import type { Frag } from "../../5e-4h/ui5e/ecransTrigo.types";
import { lx, tx } from "../../5e-4h/ui5e/ecransTrigo.types";
import type { StatutVerification } from "../../5e-4h/moteur/statutVerification";
import { evaluerExpressionGenerale } from "../../4e/moteur/expressionGenerale";
import { normaliserExpression } from "../../4e/moteur/verificationTransfertSecondDegre";
import { nombreLatex } from "../../4e/moteur/algebreTransfertSecondDegre";
import type { D, P, SpecFigure } from "../../4e/ui/outilsAnalytiqueLotG";
import { coordL, equationL, fenetreAutour, figureRepere, lireDroite, lirePoints, memeDroite, memePoint, normaliser } from "../../4e/ui/outilsAnalytiqueLotG";
import { somme } from "../../4e/ui/corrigeChapitre3";
import type { LigneCalcul } from "../../export/genererFeuilleExercices";
import { ligne } from "../../export/corrigeTableau";

/**
 * Briques communes des générateurs 6gen123–6gen127 (6e ch. 9 « Lieux géométriques », lot H1) :
 * géométrie exacte et écritures du cours repris du 4e ch. 7 (`4e/ui/outilsAnalytiqueLotG.ts` : droites
 * ax + by + c = 0, points « A(3 ; −2) », lecture d'une équation de droite sous n'importe quelle forme,
 * d'une liste de points, figure d'un repère quadrillé isotrope), lecture d'une expression EN LETTRES
 * (6gen123 : coordonnées « a + b », « 2c/3 »…, vérifiée par évaluation en plusieurs points), jugement
 * d'un point, d'un nombre exact, de deux droites dans un ordre libre, messages d'illisible par nature
 * de champ. Sans `docx` : importé par les écrans, les corrigés et les adaptateurs papier.
 */

export type { D, P };
export const t = tx;
export const l = lx;
export const COURS = (n: number) => `(cours, point ${n})`;
export const fr = (f: Frag[]): FragmentConsigne[] => f as FragmentConsigne[];
export const nb = nombreLatex;

export const SANS_TENTATIVE = " Cette saisie ne compte pas comme une tentative.";
export const ILLISIBLE = {
  point: `Point non reconnu : écris ses coordonnées entre parenthèses, séparées par « ; » — par exemple (−3 ; 5/2) ou (√2 ; 0).${SANS_TENTATIVE}`,
  points: `Liste non reconnue : écris chaque point entre parenthèses, coordonnées séparées par « ; » — par exemple (1 ; −2) ; (3 ; 0).${SANS_TENTATIVE}`,
  droite: `Équation non reconnue : écris une équation de droite avec « = », par exemple 2x − 3y + 1 = 0, y = 2x − 1 ou x = 4.${SANS_TENTATIVE}`,
  nombre: `Nombre non reconnu : écris un nombre exact, par exemple 5, −3/2, 2,5 ou 2√5 (tape √ ou rac(5)).${SANS_TENTATIVE}`,
  lettres: (lettres: string[]) =>
    `Expression non reconnue : écris-la avec les seules lettres ${lettres.join(", ")} — par exemple 2a + b, (a + c)/2 ou a² + b² (tape ² ou ^2).${SANS_TENTATIVE}`,
  pointLettres: (lettres: string[]) =>
    `Point non reconnu : écris ses deux coordonnées entre parenthèses, séparées par « ; », avec les seules lettres ${lettres.join(", ")} — par exemple (a + b ; 2c).${SANS_TENTATIVE}`,
} as const;

export const MESSAGE_APPROCHEE = `Ta valeur est approchée : on demande la valeur exacte (fraction ou racine, par exemple 7/3 ou 2√5).${SANS_TENTATIVE}`;

// ---------------------------------------------------------------------------------------------
// Hasard (toujours `Math.random` : `genererAvecCode` le remplace par une graine)
// ---------------------------------------------------------------------------------------------

export function entier(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
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
/** Une permutation de [0, n[ (ordre d'affichage d'options). */
export const permutation = (n: number) => melanger([...Array(n).keys()]);

// ---------------------------------------------------------------------------------------------
// Géométrie
// ---------------------------------------------------------------------------------------------

export const milieu = (A: P, B: P): P => ({ x: (A.x + B.x) / 2, y: (A.y + B.y) / 2 });
export const vec = (A: P, B: P): P => ({ x: B.x - A.x, y: B.y - A.y });
export const dist2 = (A: P, B: P) => (B.x - A.x) ** 2 + (B.y - A.y) ** 2;
/** Droite passant par M, de vecteur normal n : n.x·x + n.y·y + c = 0. */
export const droiteNormale = (M: P, n: P): D => normaliser({ a: n.x, b: n.y, c: -(n.x * M.x + n.y * M.y) });
/** Droite passant par A et B. */
export const droiteDeuxPoints = (A: P, B: P): D => droiteNormale(A, { x: -(B.y - A.y), y: B.x - A.x });
export const egal = (u: number, v: number) => Math.abs(u - v) < 1e-9 * Math.max(1, Math.abs(u), Math.abs(v));

/** Droite normalisée aux coefficients entiers (dénominateurs ≤ 60) puis premiers entre eux. */
export function droiteEntiere(d: D): D {
  for (let k = 1; k <= 60; k++) {
    const a = d.a * k;
    const b = d.b * k;
    const c = d.c * k;
    if ([a, b, c].every((v) => Math.abs(v - Math.round(v)) < 1e-7)) return normaliser({ a: Math.round(a), b: Math.round(b), c: Math.round(c) });
  }
  return d;
}

/** « 3x − 4y + 2 = 0 », « x = 4 » (droite verticale : forme du cours x = k quand b = 0 et a = 1),
 * « y = −2 » (horizontale). */
export function equationCours(d: D): string {
  const e = droiteEntiere(d);
  if (e.b === 0 && e.a !== 0) return `x=${nb(-e.c / e.a)}`;
  if (e.a === 0 && e.b !== 0) return `y=${nb(-e.c / e.b)}`;
  return equationL(e);
}

export { coordL, equationL, memeDroite, memePoint, normaliser, somme, figureRepere };
export type { SpecFigure };

// ---------------------------------------------------------------------------------------------
// Lectures des saisies (jamais de filtre de frappe : on lit ce qui est écrit)
// ---------------------------------------------------------------------------------------------

/** Un seul point « (x ; y) » (nom et « = » tolérés : « G = (1 ; 2) ») ; `null` si illisible. */
export function lirePoint(saisie: string): P | null {
  const s = saisie.replace(/^\s*[A-Za-zΑ-Ωα-ω][A-Za-z0-9_′']*\s*=\s*/, "");
  const pts = lirePoints(s);
  return pts && pts.length === 1 ? pts[0]! : null;
}

export { lireDroite, lirePoints };

/** Nombre exact « 5 », « −3/2 », « 2,5 », « 2√5 », « √(13) » ; `null` si illisible. */
export function lireNombreExact(saisie: string): number | null {
  const s = normaliserExpression(saisie.replace(/^\s*[A-Za-zΑ-Ωα-ω][A-Za-z0-9_()Ω;,\s]*=\s*/, "")).replace(/\s+/g, "");
  if (s === "" || /[a-zA-Z]/.test(s.replace(/sqrt|rac/g, ""))) return null;
  try {
    const v = evaluerExpressionGenerale(s.replace(/rac/g, "sqrt"), 0);
    return Number.isFinite(v) ? v : null;
  } catch {
    return null;
  }
}

/** Saisie écrite comme un décimal (pas de fraction ni de racine). */
export const estDecimalEcrit = (saisie: string) => /^\s*[-−–]?\s*\d+([.,]\d+)?\s*$/.test(saisie);

/** Valeur décimale proche (à 2 %) d'une valeur exacte qu'elle n'égale pas. */
export function estApprochee(v: number | null, attendu: number): boolean {
  if (v === null || egal(v, attendu)) return false;
  return Math.abs(v - attendu) <= Math.max(0.02 * Math.abs(attendu), 0.006);
}

/** Point dont une coordonnée est écrite en décimal approché d'une coordonnée exacte. */
export function pointApproche(saisie: string, attendu: P): boolean {
  const p = lirePoint(saisie);
  if (!p || memePoint(p, attendu)) return false;
  const ok = (v: number, a: number) => egal(v, a) || estApprochee(v, a);
  return ok(p.x, attendu.x) && ok(p.y, attendu.y) && /\d[.,]\d/.test(saisie);
}

/**
 * Expression écrite avec des lettres (paramètres génériques de 6gen123) → fonction numérique, ou
 * `null` si illisible ou si une autre lettre apparaît. Les produits sans signe (« 2ab », « ac ») sont
 * lus comme des produits ; « √ », « ² », « ^ » acceptés.
 */
export function lireExpressionLettres(saisie: string, lettres: string[]): ((v: Record<string, number>) => number) | null {
  let s = normaliserExpression(saisie).replace(/\s+/g, "");
  if (s === "") return null;
  s = s.replace(/rac\(/g, "sqrt(");
  const motsPermis = new Set(["sqrt"]);
  // Séquences de lettres : « sqrt » gardé, sinon chaque lettre doit être permise (produit implicite).
  let ok = true;
  s = s.replace(/[A-Za-z]+/g, (mot) => {
    if (motsPermis.has(mot)) return mot;
    for (const c of mot) if (!lettres.includes(c)) ok = false;
    return mot.split("").join("*");
  });
  if (!ok) return null;
  const essai: Record<string, number> = {};
  lettres.forEach((c, i) => (essai[c] = 1.37 + i * 0.71));
  try {
    const v = evaluerExpressionGenerale(s, 0, essai);
    if (!Number.isFinite(v)) return null;
  } catch {
    return null;
  }
  return (vals) => evaluerExpressionGenerale(s, 0, vals);
}

/** Jeux de valeurs « quelconques » (non entiers, distincts) pour comparer deux expressions. */
export function jeuxDeValeurs(lettres: string[]): Record<string, number>[] {
  const bases = [
    [1.3, 2.7, -0.8, 3.1, 0.6],
    [-2.2, 0.9, 1.7, -1.4, 2.3],
    [0.45, -1.6, 2.9, 0.7, -2.5],
    [3.4, 1.15, -2.05, 1.9, 0.35],
    [-0.75, -2.8, 0.55, -3.2, 1.45],
  ];
  return bases.map((b) => Object.fromEntries(lettres.map((c, i) => [c, b[i % b.length]!])));
}

/** Deux expressions en lettres égales sur tous les jeux de valeurs. */
export function memesValeurs(f: (v: Record<string, number>) => number, g: (v: Record<string, number>) => number, lettres: string[]): boolean {
  return jeuxDeValeurs(lettres).every((v) => {
    const a = f(v);
    const b = g(v);
    return Number.isFinite(a) && Math.abs(a - b) < 1e-7 * Math.max(1, Math.abs(b));
  });
}

/** Point dont les coordonnées sont des expressions en lettres « (a + b ; 2c) » ; `null` si illisible. */
export function lirePointLettres(saisie: string, lettres: string[]): [(v: Record<string, number>) => number, (v: Record<string, number>) => number] | null {
  const s = saisie.trim().replace(/^[A-Za-z][A-Za-z0-9_′']*\s*=\s*/, "");
  const m = /^\(\s*(.+)\s*\)$/.exec(s);
  if (!m) return null;
  const interieur = m[1]!;
  let morceaux = interieur.split(";");
  if (morceaux.length !== 2) {
    if (morceaux.length === 1 && (interieur.match(/\|/g) ?? []).length === 1) morceaux = interieur.split("|");
    else return null;
  }
  const fx = lireExpressionLettres(morceaux[0]!, lettres);
  const fy = lireExpressionLettres(morceaux[1]!, lettres);
  return fx && fy ? [fx, fy] : null;
}

// ---------------------------------------------------------------------------------------------
// Jugements communs
// ---------------------------------------------------------------------------------------------

export function statutPoint(saisie: string, attendu: P): StatutVerification {
  const p = lirePoint(saisie);
  if (!p) return "parse_error";
  return memePoint(p, attendu) ? "correct" : "not_equivalent";
}

export function statutNombre(saisie: string, attendu: number): StatutVerification {
  const v = lireNombreExact(saisie);
  if (v === null) return "parse_error";
  return egal(v, attendu) ? "correct" : "not_equivalent";
}

export function statutDroite(saisie: string, attendue: D): StatutVerification {
  const d = lireDroite(saisie);
  if (!d) return "parse_error";
  return memeDroite(d, attendue) ? "correct" : "not_equivalent";
}

/** Deux droites (ou deux points) dans un ordre libre : statut champ par champ. */
export function statutsPaire<T>(saisies: string[], lire: (s: string) => T | null, attendus: T[], meme: (a: T, b: T) => boolean): StatutVerification[] {
  const lus = saisies.map(lire);
  if (lus.some((x) => x === null)) return lus.map((x) => (x === null ? "parse_error" : "not_equivalent"));
  const [u, v] = lus as T[];
  const [a, b] = attendus;
  if ((meme(u!, a!) && meme(v!, b!)) || (meme(u!, b!) && meme(v!, a!))) return ["correct", "correct"];
  // Un seul juste : celui-là en vert (jamais deux fois la même droite).
  const uOk = meme(u!, a!) || meme(u!, b!);
  const vOk = (meme(v!, a!) || meme(v!, b!)) && !(uOk && meme(u!, v!));
  return [uOk ? "correct" : "not_equivalent", vOk ? "correct" : "not_equivalent"];
}

/** Ensemble de points (ordre libre, sans doublon) : `correct` si c'est exactement l'ensemble attendu. */
export function statutEnsemblePoints(saisie: string, attendus: P[]): StatutVerification {
  const pts = lirePoints(saisie);
  if (pts === null || pts.length === 0) return "parse_error";
  return memeEnsemble(pts, attendus) ? "correct" : "not_equivalent";
}

export function memeEnsemble(u: P[], v: P[]): boolean {
  const uu = u.filter((p, i) => u.findIndex((w) => memePoint(w, p)) === i);
  const vv = v.filter((p, i) => v.findIndex((w) => memePoint(w, p)) === i);
  return uu.length === vv.length && uu.every((p) => vv.some((w) => memePoint(w, p)));
}

// ---------------------------------------------------------------------------------------------
// Aperçus KaTeX des saisies (au-dessus du champ)
// ---------------------------------------------------------------------------------------------

export function apercuPoint(saisie: string): string | null {
  const p = lirePoint(saisie);
  return p ? coordL(p) : null;
}
export function apercuPoints(saisie: string): string | null {
  const p = lirePoints(saisie);
  return p && p.length > 0 ? p.map(coordL).join("\\ ;\\ ") : null;
}
export function apercuDroite(saisie: string): string | null {
  const d = lireDroite(saisie);
  return d ? equationCours(d) : null;
}
export function apercuNombre(saisie: string): string | null {
  const v = lireNombreExact(saisie);
  return v === null ? null : nb(v);
}

/** Liste de points en LaTeX « (1\,;2)\ ;\ (3\,;0) ». */
export const pointsL = (pts: P[]) => pts.map(coordL).join("\\ ;\\ ");

// ---------------------------------------------------------------------------------------------
// Corrigé : résolution d'un système de deux équations de droites, une transformation par ligne
// ---------------------------------------------------------------------------------------------

/** Membre « 2x − y + 3 » (0 si tout est nul). */
export const membreL = (d: D) =>
  somme([
    [d.a, "x"],
    [d.b, "y"],
    [d.c, ""],
  ]);
/** Nombre entre parenthèses s'il est négatif. */
export const nbp = (v: number) => (v < 0 ? `(${nb(v)})` : nb(v));

/** Intersection de deux droites sécantes (exacte). */
export function intersectionD(d1: D, d2: D): P {
  const det = d1.a * d2.b - d2.a * d1.b;
  return { x: (d1.b * d2.c - d2.b * d1.c) / det + 0, y: (d2.a * d1.c - d1.a * d2.c) / det + 0 };
}

/** « 3\times(-2) », « -(-2) », « 4 » : coefficient × valeur substituée (premier terme). */
function produitSubstitue(coef: number, v: number): string {
  if (coef === 0) return "";
  if (coef === 1) return nb(v);
  if (coef === -1) return `-${nbp(v)}`;
  return `${nb(coef)}\\times ${nbp(v)}`;
}

/**
 * Lignes de calcul de la résolution du système (1), (2) : substitution si une droite est verticale ou
 * horizontale, sinon élimination de y (b₂ × (1) − b₁ × (2)), puis report dans une équation.
 */
export function lignesSysteme(d1: D, d2: D): LigneCalcul[] {
  const I = intersectionD(d1, d2);
  const out: LigneCalcul[] = [ligne(`{\\begin{cases}${membreL(d1)}=0 & (1)\\\\${membreL(d2)}=0 & (2)\\end{cases}}`, "système des deux équations")];
  const reporter = (d: D, nom: string, connue: "x" | "y") => {
    const v = connue === "x" ? I.x : I.y;
    const coefInc = connue === "x" ? d.b : d.a;
    const coefCon = connue === "x" ? d.a : d.b;
    const inc = connue === "x" ? "y" : "x";
    const premier = produitSubstitue(coefCon, v);
    const termeInc = somme([[coefInc, inc]]);
    const constante = d.c === 0 ? "" : d.c > 0 ? `+${nb(d.c)}` : nb(d.c);
    const membre = premier === "" ? `${termeInc}${constante}` : `${premier}${coefInc > 0 ? "+" : ""}${termeInc}${constante}`;
    out.push(ligne(`${membre}=0`, `on remplace ${connue} dans ${nom}`));
    out.push(ligne(`${termeInc}=${nb(-(coefCon * v + d.c))}`));
    out.push(ligne(`${inc}=${nb(connue === "x" ? I.y : I.x)}`));
  };
  if (d1.b === 0 || d2.b === 0) {
    const [nv, da, na] = d1.b === 0 ? ["(1)", d2, "(2)"] : ["(2)", d1, "(1)"];
    out.push(ligne(`x=${nb(I.x)}`, `on lit x dans ${nv}`));
    reporter(da, na, "x");
    return out;
  }
  if (d1.a === 0 || d2.a === 0) {
    const [nv, da, na] = d1.a === 0 ? ["(1)", d2, "(2)"] : ["(2)", d1, "(1)"];
    out.push(ligne(`y=${nb(I.y)}`, `on lit y dans ${nv}`));
    reporter(da, na, "y");
    return out;
  }
  const ca = d1.a * d2.b - d2.a * d1.b;
  const cc = d1.c * d2.b - d2.c * d1.b;
  const fois = (k: number) => (k === 1 ? "" : `${nb(k)}\\times`);
  const comb = `${d2.b < 0 ? `(${nb(d2.b)})\\times` : fois(d2.b)}(1)${d1.b < 0 ? "+" : "-"}${fois(Math.abs(d1.b))}(2)`;
  out.push(ligne(`${somme([[ca, "x"], [cc, ""]])}=0`, [{ type: "latex", valeur: comb }, { type: "texte", valeur: " : on élimine y" }]));
  out.push(ligne(`x=${nb(I.x)}`));
  reporter(d1, "(1)", "x");
  return out;
}

/** Figure d'un repère cadrée sur des points (même échelle sur les deux axes, ≤ 320 px de large). */
export function figureAuto(spec: Omit<SpecFigure, "fenetre" | "unite">, pointsCadre: P[], marge = 1): string {
  const fenetre = fenetreAutour(pointsCadre, marge, 6);
  const etendue = Math.max(fenetre.xMax - fenetre.xMin, fenetre.yMax - fenetre.yMin);
  const unite = Math.max(12, Math.min(22, Math.floor(290 / etendue)));
  return figureRepere({ ...spec, fenetre, unite, graduationsLisibles: true });
}
