import type { TypeCoucheCatalogue } from "../../core5e/decompositionFonction.types";

export interface RenduCouche {
  /** syntaxe `evaluerExpressionGenerale` (4e, réutilisée cross-chantier). */
  formule: string;
  latex: string;
}

/** Un argument LaTeX "atomique" (un simple symbole, jamais une expression composée) n'a besoin
 * d'AUCUNE parenthèse de regroupement avant un exposant ou un coefficient multiplicatif — seul cas
 * rencontré en pratique : `"x"`, le seed dont part `appliquerCouche` (`{formule:"x",latex:"x"}`,
 * `index.ts`) quand la couche traitée est la couche la plus INTÉRIEURE, appliquée directement à x.
 * Toute couche non-intérieure reçoit toujours un `arg.latex` composé (jamais littéralement `"x"`),
 * donc ce test reste sûr sans jamais wrapper à tort une expression composée. */
function estArgumentAtomique(argLatex: string): boolean {
  return argLatex === "x";
}

function formatAffineLatex(a: number, b: number, argLatex: string): string {
  const atomique = estArgumentAtomique(argLatex);
  const terme =
    a === 1 ? argLatex
    : a === -1 ? (atomique ? `-${argLatex}` : `-\\left(${argLatex}\\right)`)
    : atomique ? `${a}${argLatex}`
    : `${a}\\left(${argLatex}\\right)`;
  if (b === 0) return terme;
  return b > 0 ? `${terme} + ${b}` : `${terme} - ${Math.abs(b)}`;
}

/** Partie "variable" d'un terme a·(argLatex)ᵉ — "" pour un exposant nul (terme constant, rien à
 * afficher hors le coefficient lui-même), `argLatex` nu pour un exposant 1 (jamais "^{1}" littéral),
 * `argLatex^{e}` sinon (`\left(argLatex\right)^{e}` UNIQUEMENT si `argLatex` n'est pas atomique —
 * voir `estArgumentAtomique`, jamais de `\left(x\right)^{4}` superflu pour la variable nue). */
function partieVariablePuissance(exposant: number, argLatex: string): string {
  if (exposant === 0) return "";
  if (exposant === 1) return argLatex;
  return estArgumentAtomique(argLatex) ? `${argLatex}^{${exposant}}` : `\\left(${argLatex}\\right)^{${exposant}}`;
}

/** Un terme signé a·(argLatex)ᵉ, coefficient ≠ 0 toujours (voir `tirerParametresBrute`, index.ts) —
 * jamais de coefficient ±1 littéral devant une partie VARIABLE (`1x²` → `x²`, `-1x²` → `-x²`), mais
 * un terme CONSTANT (exposant nul) affiche toujours sa valeur numérique telle quelle, "1"/"-1"
 * compris — ce n'est pas le coefficient d'une variable, c'est la valeur du terme lui-même. */
function formatTermeSigneLatex(coeff: number, exposant: number, argLatex: string): string {
  const variable = partieVariablePuissance(exposant, argLatex);
  if (variable === "") return `${coeff}`;
  const abs = Math.abs(coeff);
  const signe = coeff < 0 ? "-" : "";
  return `${signe}${abs === 1 ? variable : `${abs}${variable}`}`;
}

/** Combine 2 termes déjà signés (chacun produit par `formatTermeSigneLatex`, donc déjà préfixé d'un
 * "-" si négatif, jamais de "+" explicite) en une somme — jamais de double signe "+ -3" : si le
 * second terme est négatif, bascule sur "premier - |second|" plutôt que "premier + -|second|". */
function combinerTermesSignes(premier: string, second: string): string {
  return second.startsWith("-") ? `${premier} - ${second.slice(1)}` : `${premier} + ${second}`;
}

/** LaTeX de `a·xⁿ + b·xᵐ` (couche "brute", C.2, toujours couche 1 donc `argLatex==="x"` — jamais de
 * `\left(x\right)^{n}`, voir `partieVariablePuissance`/`estArgumentAtomique`) — jamais de double
 * signe, jamais de coefficient ±1 littéral sur une partie variable (voir `formatTermeSigneLatex`/
 * `combinerTermesSignes`). `n>m≥0` par construction (`tirerParametresBrute`) — le premier terme
 * (exposant `n`, toujours ≥2) domine donc toujours visuellement à gauche, cohérent avec un
 * polynôme écrit en puissances décroissantes. */
function formatBruteLatex(a: number, n: number, b: number, m: number, argLatex: string): string {
  return combinerTermesSignes(formatTermeSigneLatex(a, n, argLatex), formatTermeSigneLatex(b, m, argLatex));
}

/** Version `evaluerExpressionGenerale` (syntaxe évaluable) d'un terme a·(argFormule)ᵉ — parenthèses
 * systématiques autour de chaque facteur (même convention que le reste de ce fichier, ex.
 * `(${a})*(${arg.formule})+(${b})` pour "affine") : robuste à un coefficient négatif sans jamais
 * dépendre de la précédence de l'opérateur unaire "-" du tokenizer. */
function formuleTermePuissance(coeff: number, exposant: number, argFormule: string): string {
  if (exposant === 0) return `(${coeff})`;
  const base = exposant === 1 ? `(${argFormule})` : `(${argFormule})^${exposant}`;
  return `(${coeff})*${base}`;
}

function formuleBrute(a: number, n: number, b: number, m: number, argFormule: string): string {
  return `${formuleTermePuissance(a, n, argFormule)}+${formuleTermePuissance(b, m, argFormule)}`;
}

/**
 * Paramètres additifs consommés par `appliquerCouche` selon le type de couche — `a`/`b` pour
 * "affine" (a·arg+b) ; `a`/`n`/`b`/`m` pour "brute" (a·argⁿ+b·argᵐ, C.2). Un seul type partagé
 * (plutôt que 2 interfaces distinctes, ex. `ParametresAffine`/`ParametresBrute`) — choix documenté :
 * aucun conflit de nom entre les 2 usages (chaque type de couche ne lit jamais que les champs qui le
 * concernent, les autres restent `undefined`), et un seul type reste plus simple à faire transiter
 * par la signature unique de `appliquerCouche` sans union de types de paramètres.
 */
export interface ParametresCouche {
  a?: number;
  b?: number;
  n?: number;
  m?: number;
}

/** Applique une couche du catalogue (ou la couche "brute") à `arg` (l'expression déjà construite
 * jusque-là) — construit en parallèle la syntaxe évaluable ET le LaTeX affiché, toujours issus de la
 * même décision, donc jamais de divergence possible entre les deux. */
export function appliquerCouche(type: TypeCoucheCatalogue, arg: RenduCouche, params: ParametresCouche = {}): RenduCouche {
  switch (type) {
    case "affine": {
      const a = params.a ?? 1;
      const b = params.b ?? 0;
      return { formule: `(${a})*(${arg.formule})+(${b})`, latex: formatAffineLatex(a, b, arg.latex) };
    }
    case "carre":
      return { formule: `(${arg.formule})^2`, latex: estArgumentAtomique(arg.latex) ? `${arg.latex}^2` : `\\left(${arg.latex}\\right)^2` };
    case "cube":
      return { formule: `(${arg.formule})^3`, latex: estArgumentAtomique(arg.latex) ? `${arg.latex}^3` : `\\left(${arg.latex}\\right)^3` };
    case "racineCarree":
      return { formule: `sqrt(${arg.formule})`, latex: `\\sqrt{${arg.latex}}` };
    case "racineCubique":
      return { formule: `cbrt(${arg.formule})`, latex: `\\sqrt[3]{${arg.latex}}` };
    case "inverse":
      return { formule: `1/(${arg.formule})`, latex: `\\dfrac{1}{${arg.latex}}` };
    case "valeurAbsolue":
      return { formule: `abs(${arg.formule})`, latex: `\\left|${arg.latex}\\right|` };
    case "brute": {
      const a = params.a ?? 1;
      const n = params.n ?? 2;
      const b = params.b ?? 1;
      const m = params.m ?? 0;
      return { formule: formuleBrute(a, n, b, m, arg.formule), latex: formatBruteLatex(a, n, b, m, arg.latex) };
    }
  }
}

/** Libellé pédagogique d'une couche — utilisé par les aides (jamais pour révéler la formule elle-même). */
export const LIBELLE_TYPE_COUCHE: Record<TypeCoucheCatalogue, string> = {
  affine: "une transformation affine (×a+b)",
  carre: "une mise au carré",
  cube: "une mise au cube",
  racineCarree: "une racine carrée",
  racineCubique: "une racine cubique",
  inverse: "un inverse (1/…)",
  valeurAbsolue: "une valeur absolue",
  brute: "une expression polynomiale (a·xⁿ+b·xᵐ)",
};
