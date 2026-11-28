import type { FragmentConsigne, LigneCalcul } from "../../export/genererFeuilleExercices";
import { latex, ligne, texte } from "../../export/corrigeTableau";
import { moinsH, nombreTexte, q, qp, sansDoublons, somme } from "./corrigeChapitre3";

/**
 * Briques partagées des corrigés détaillés « comme au tableau » du chapitre 1 de 4e (« La fonction
 * du second degré », gen7, gen8, gen9, gen55) — règle `.claude/rules/feuilles-evaluations.md`,
 * section « Corrigé détaillé — comme au tableau ». Réutilise les nombres exacts du chapitre 3
 * (`corrigeChapitre3.ts` : `q`, `qp`, `somme`…) et, pour la factorisation de gen7, les lignes du
 * chapitre 2 (`corrigeSecondDegre1.ts`). Notation du cours (décision de l'utilisateur) : le sommet
 * est S(x_S ; y_S) et la forme canonique a(x − x_S)² + y_S ; p et q ne désignent jamais que les
 * amplitudes des translations. Aucun « Δ » ni « discriminant » (pas encore vus au ch. 1). Aucune
 * dépendance à `docx` : importé par les générateurs interactifs.
 */

export type Fragments = FragmentConsigne[];

/** Renvois au cours (sections numérotées de `fonction-second-degre.ts`). */
export const COURS_DEBUT = "(cours, « Avant de commencer »)";
export const COURS_ETUDIER = "(cours, point 1)";
export const COURS_TRANSFORMER = "(cours, point 2)";
export const COURS_UTILISER = "(cours, point 3)";

function net(v: number): number {
  return Object.is(v, -0) || Math.abs(v) < 1e-12 ? 0 : v;
}

function pgcd(x: number, y: number): number {
  return y === 0 ? Math.abs(x) : pgcd(y, x % y);
}

/** Point nommé : « S\left(2\,;\,-1\right) ». */
export function pointLatex(nom: string, x: number, y: number): string {
  return `${nom}\\left(${q(x)}\\,;\\,${q(y)}\\right)`;
}

/** Couple de coordonnées seul : « \left(2\,;\,-1\right) ». */
export function coordLatex(x: number, y: number): string {
  return `\\left(${q(x)}\\,;\\,${q(y)}\\right)`;
}

/** Carré d'un nombre : « 3^2 », « \left(-2\right)^2 », « \left(\dfrac{5}{2}\right)^2 ». */
export function carreLatex(v: number): string {
  const n = net(v);
  return n < 0 || !Number.isInteger(n) ? `\\left(${q(n)}\\right)^2` : `${q(n)}^2`;
}

/** Facteur numérique d'un produit : « 3 », « \left(-2\right) », « \dfrac{1}{2} ». */
export function facteurLatex(v: number): string {
  const n = net(v);
  return n < 0 ? `\\left(${q(n)}\\right)` : q(n);
}

/** `ax² + bx + c` dans la variable `v`. */
export function trinomeLatex(a: number, b: number, c: number, v = "x"): string {
  return somme([
    [a, `${v}^2`],
    [b, v],
    [c, ""],
  ]);
}

export function valeurTrinome(a: number, b: number, c: number, x: number): number {
  return net(a * x * x + b * x + c);
}

/** `(x − h)²` ou `x²`. */
export function carreTranslate(h: number, v = "x"): string {
  return net(h) === 0 ? `${v}^2` : `(${moinsH(h, v)})^2`;
}

/** Coefficient devant une parenthèse : « », « - », « \dfrac{4}{3} », « -2 ». */
export function coefDevant(a: number): string {
  const n = net(a);
  if (n === 1) return "";
  if (n === -1) return "-";
  return q(n);
}

/** Forme canonique a(x − x_S)² + y_S, le coefficient a écrit DEVANT la parenthèse (cours, § 2). */
export function formeCanoniqueLatex(a: number, xS: number, yS: number, v = "x"): string {
  const n = net(yS);
  return `${coefDevant(a)}${carreTranslate(xS, v)}${n === 0 ? "" : n > 0 ? `+${q(n)}` : `-${q(-n)}`}`;
}

/**
 * Valeur de `f(x₀)` substituée, une transformation par ligne : f(x₀) = a·x₀² + b·x₀ + c, puis les
 * produits calculés, puis la somme. `gauche` : membre de gauche de la première ligne (« f(3) », « y_S »).
 */
export function lignesValeur(a: number, b: number, c: number, x0: number, gauche: string, justification?: string | Fragments): LigneCalcul[] {
  const t1 = net(a) === 1 ? carreLatex(x0) : net(a) === -1 ? `-${carreLatex(x0)}` : `${q(a)}\\cdot ${carreLatex(x0)}`;
  const t2 = net(b) === 0 ? "" : net(b) > 0 ? `+${q(b)}\\cdot ${facteurLatex(x0)}` : `-${q(-b)}\\cdot ${facteurLatex(x0)}`;
  const t3 = net(c) === 0 ? "" : net(c) > 0 ? `+${q(c)}` : `-${q(-c)}`;
  const lignes: LigneCalcul[] = [ligne(`${gauche}=${t1}${t2}${t3}`, justification)];
  const termes: [number, string][] = [
    [a * x0 * x0, ""],
    [b * x0, ""],
    [c, ""],
  ];
  const nonNuls = termes.filter(([v]) => net(v) !== 0);
  if (nonNuls.length > 1) lignes.push(ligne(`=${somme(termes)}`, "on calcule chaque terme"));
  lignes.push(ligne(`=${q(valeurTrinome(a, b, c, x0))}`));
  return sansDoublons(lignes);
}

/** x_S = −b/(2a) substitué puis simplifié (une transformation par ligne). `nom` : « x_S », « t_S »… */
export function lignesAbscisseSommet(a: number, b: number, nom = "x_S"): LigneCalcul[] {
  const xS = net(-b / (2 * a));
  const lignes: LigneCalcul[] = [ligne(`${nom}=-\\dfrac{b}{2a}`, "formule de l'abscisse du sommet")];
  lignes.push(ligne(`=-\\dfrac{${q(b)}}{2\\cdot ${facteurLatex(a)}}`, "on remplace a et b"));
  const num = net(-b);
  const den = net(2 * a);
  // −b/(2a) écrit en une seule fraction, signe rentré au numérateur (dénominateur positif) —
  // seulement si elle n'est pas déjà irréductible (sinon elle répéterait le résultat).
  const n = den < 0 ? -num : num;
  const d = Math.abs(den);
  const entiers = Number.isInteger(n) && Number.isInteger(d);
  if (entiers && d !== 1 && n !== 0 && pgcd(Math.abs(n), d) !== 1) {
    lignes.push(ligne(`=${n < 0 ? "-" : ""}\\dfrac{${Math.abs(n)}}{${d}}`, "on calcule le numérateur et le dénominateur"));
    lignes.push(ligne(`=${q(xS)}`, "on simplifie"));
  } else {
    lignes.push(ligne(`=${q(xS)}`, "on calcule"));
  }
  return sansDoublons(lignes);
}

/** y_S = f(x_S) : on remplace x par x_S dans f(x). */
export function lignesOrdonneeSommet(a: number, b: number, c: number, xS: number, nom = "y_S", nomF = "f"): LigneCalcul[] {
  const premiere = ligne(`${nom}=${nomF}\\left(${q(xS)}\\right)`, [texte("on remplace x par "), latex(q(xS)), texte(" dans l'expression")]);
  const suite = lignesValeur(a, b, c, xS, "");
  return [premiere, ...suite];
}

/** Texte d'un nombre dans une justification : « −3 », « 5/2 ». */
export function nb(v: number): string {
  return nombreTexte(v);
}

/** Translation horizontale ou verticale, en mots. */
export function translationTexte(valeur: number, sens: "horizontale" | "verticale"): string {
  const v = net(valeur);
  if (v === 0) return `pas de translation ${sens}`;
  const n = Math.abs(v);
  const vers = sens === "horizontale" ? (v > 0 ? "la droite" : "la gauche") : v > 0 ? "le haut" : "le bas";
  return `translation ${sens} de ${nombreTexte(n)} unité${n > 1 ? "s" : ""} vers ${vers}`;
}

/** Étirement / compression vertical(e) de rapport |a|, en mots. */
export function facteurTexte(aAbs: number): string {
  if (Math.abs(aAbs - 1) < 1e-12) return "ni étirement ni compression";
  return aAbs > 1 ? `étirement vertical de rapport ${nombreTexte(aAbs)}` : `compression verticale de rapport ${nombreTexte(aAbs)}`;
}

export { q, qp };
