import type { FragmentConsigne, LigneCalcul } from "../../export/genererFeuilleExercices";
import { latex, ligne, texte } from "../../export/corrigeTableau";

/**
 * Briques communes des corrigés détaillés « comme au tableau » du chapitre 3 de 5e (« Suites »),
 * seconde moitié des générateurs : 5gen44–49 (règle `.claude/rules/feuilles-evaluations.md`,
 * section « Corrigé détaillé — comme au tableau »). SANS dépendance à `docx` : importé par les
 * adaptateurs papier ET par les générateurs interactifs (étape échouée).
 *
 * Écritures exactes (fractions irréductibles `\dfrac`), « − » typographique (LaTeX « - »), virgule
 * décimale `{,}`, indices `u_{n+1}` comme le reste du chapitre.
 */

export type Fragments = FragmentConsigne[];

/** Renvois aux sections numérotées du chapitre `content/chapters/5e-4h/suites.ts`. */
export const COURS_SUITES = "(cours, point 1)";
export const COURS_ARITHMETIQUES = "(cours, point 1)";
export const COURS_GEOMETRIQUES = "(cours, point 2)";
export const COURS_NATURE = "(cours, points 1 et 2)";
export const COURS_CONVERGENCE = "(cours, point 3)";
export const COURS_PROBLEMES = "(cours, point 4)";

/** Rationnel `{ num, den }` (même forme que `Q`, `Frac`, `FractionQ`, `Fraction` du chapitre). */
export interface Rationnel {
  num: number;
  den: number;
}

function pgcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a || 1;
}

/** Fraction irréductible, dénominateur positif, jamais « −0 ». */
export function r(num: number, den = 1): Rationnel {
  if (den === 0) throw new Error("r : dénominateur nul");
  const s = den < 0 ? -1 : 1;
  const g = pgcd(num, den);
  return { num: (s * num) / g + 0, den: (s * den) / g };
}

export const rPlus = (a: Rationnel, b: Rationnel): Rationnel => r(a.num * b.den + b.num * a.den, a.den * b.den);
export const rMoins = (a: Rationnel, b: Rationnel): Rationnel => r(a.num * b.den - b.num * a.den, a.den * b.den);
export const rFois = (a: Rationnel, b: Rationnel): Rationnel => r(a.num * b.num, a.den * b.den);
export const rDivise = (a: Rationnel, b: Rationnel): Rationnel => r(a.num * b.den, a.den * b.num);
export function rPuissance(a: Rationnel, e: number): Rationnel {
  if (e < 0) return rPuissance(rDivise(r(1), a), -e);
  let p = r(1);
  for (let i = 0; i < e; i++) p = rFois(p, a);
  return p;
}

/** Entier en LaTeX, espace fine des milliers dès 10 000 (comme le reste du chapitre). */
export function ent(x: number): string {
  const s = String(Math.abs(x));
  const g = s.length >= 5 ? s.replace(/\B(?=(\d{3})+(?!\d))/g, "\\,") : s;
  return `${x < 0 ? "-" : ""}${g}`;
}

/** Rationnel en LaTeX : « 5 », « -7 », « \dfrac{7}{3} », « -\dfrac{7}{3} ». */
export function fr(x: Rationnel): string {
  if (x.den === 1) return ent(x.num);
  return `${x.num < 0 ? "-" : ""}\\dfrac{${ent(Math.abs(x.num))}}{${ent(x.den)}}`;
}

/** Même chose, entre parenthèses s'il est négatif ou fractionnaire (facteur, base, terme soustrait). */
export function frp(x: Rationnel): string {
  return x.num < 0 || x.den !== 1 ? `\\left(${fr(x)}\\right)` : fr(x);
}

/** Entier entre parenthèses s'il est négatif. */
export function entp(x: number): string {
  return x < 0 ? `(${ent(x)})` : ent(x);
}

/** Terme ajouté dans une somme : « +5 », « -5 », « » pour 0. */
export function plusEnt(x: number): string {
  if (x === 0) return "";
  return x > 0 ? `+${ent(x)}` : `-${ent(-x)}`;
}

/** Somme d'entiers déjà calculés : « 12+10-1 » (les nuls sont gardés s'ils sont seuls). */
export function sommeEntiers(xs: number[]): string {
  const non = xs.filter((x) => x !== 0);
  if (non.length === 0) return "0";
  return non.map((x, i) => (i === 0 ? ent(x) : plusEnt(x))).join("");
}

/** Facteur « k » devant une parenthèse ou une lettre : « 3 », « - », « » (k = 1). */
export function coefDevant(k: number): string {
  return k === 1 ? "" : k === -1 ? "-" : ent(k);
}

/** Retire une ligne qui répète la précédente (même membre de droite, à l'écriture près). */
export function sansRepetition(lignes: LigneCalcul[]): LigneCalcul[] {
  const norm = (s: string) => s.replace(/\\left|\\right|\\,|\s/g, "").replace(/\\dfrac/g, "\\frac");
  const out: LigneCalcul[] = [];
  for (const l of lignes) {
    const prec = out[out.length - 1];
    if (prec && l.latex.startsWith("=")) {
      const i = prec.latex.lastIndexOf("=");
      const droitePrec = i >= 0 ? prec.latex.slice(i + 1) : prec.latex;
      if (norm(droitePrec) === norm(l.latex.slice(1))) {
        if (l.justification && !prec.justification) out[out.length - 1] = { ...prec, justification: l.justification };
        continue;
      }
    }
    out.push(l);
  }
  return out;
}

/** Formules séparées par un texte (« ; » par défaut) : listes de résultats d'une étape. */
export function listeFormules(formules: string[], separateur = " ; "): Fragments {
  return formules.flatMap((x, i) => (i === 0 ? [latex(x)] : [texte(separateur), latex(x)]));
}

/** Formules énumérées « A, B et C ». */
export function listeEt(formules: string[]): Fragments {
  return formules.flatMap((x, i) => (i === 0 ? [latex(x)] : [texte(i === formules.length - 1 ? " et " : ", "), latex(x)]));
}

/** Texte : « − » typographique à la place du trait d'union devant un nombre. */
export function moinsTexte(x: number | string): string {
  return `${x}`.replace(/-/g, "−");
}

// ============================================================================
// Sommes de termes consécutifs (5gen45, 5gen47, 5gen49).
// ============================================================================

/**
 * Somme arithmétique S = N(premier + dernier)/2, une transformation par ligne : formule,
 * substitution, somme des extrêmes, produit, division par 2. `nom` : membre de gauche (« S »,
 * « S_{12} ») ; `ecrire` : écriture des nombres (entiers par défaut).
 */
export function lignesSommeArithmetique(nom: string, N: number, premier: number, dernier: number, ecrire: (x: number) => string = ent, nomPremier = "u_1", nomDernier = "u_N"): LigneCalcul[] {
  const p = (x: number) => (x < 0 ? `(${ecrire(x)})` : ecrire(x));
  const somme = premier + dernier;
  const S = (N * somme) / 2;
  return sansRepetition([
    ligne(`${nom}=\\dfrac{N\\times(${nomPremier}+${nomDernier})}{2}`, "N fois la moyenne du premier et du dernier terme"),
    ligne(`=\\dfrac{${N}\\times(${ecrire(premier)}+${p(dernier)})}{2}`, [texte("avec "), latex(`N=${N}`)]),
    ligne(`=\\dfrac{${N}\\times ${p(somme)}}{2}`, "on additionne les deux termes extrêmes"),
    ligne(`=\\dfrac{${ecrire(N * somme)}}{2}`, "on multiplie"),
    ligne(`=${ecrire(S)}`, "on divise par 2"),
  ]);
}
