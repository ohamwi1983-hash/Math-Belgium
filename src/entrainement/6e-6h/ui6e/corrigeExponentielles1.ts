import type { EtapeCorrection, FragmentConsigne, LigneCalcul } from "../../export/genererFeuilleExercices";
import { latex, ligne, texte } from "../../export/corrigeTableau";
import { finaliserCorrige } from "./corrigeLogarithmes1";
import { sansRepetition } from "./corrigeLogarithmes2";

/**
 * Briques communes du corrigé détaillé « comme au tableau » du chapitre 2 de 6e (fonctions
 * exponentielles), moitié 1 : 6gen6 (limites), 6gen7 (domaine et dérivée), 6gen8 (graphique de la
 * dérivée), 6gen9 (équations) — règle `.claude/rules/feuilles-evaluations.md` (« Corrigé détaillé —
 * comme au tableau »). SANS `docx` : importé par les adaptateurs papier ET par les générateurs
 * interactifs (corrigé d'une étape échouée).
 *
 * Réutilise les briques du chapitre 3 (`corrigeLogarithmes1/2` : nombres exacts, termes signés,
 * `finaliserCorrige`, `sansRepetition`) plutôt que de les dupliquer ; ajoute les renvois `COURS_*`
 * aux sections du chapitre « Fonctions exponentielles » et quelques écritures propres au chapitre.
 */

export { affine, finaliserCorrige, frac, justif, listeEt, nb, parE, parN, rationnel, sommeTermes, terme } from "./corrigeLogarithmes1";
export { dec, fragmentsAide, sansRepetition, vaut } from "./corrigeLogarithmes2";

export const COURS_LIMITES = "(cours, § 1)";
export const COURS_DERIVEE = "(cours, § 2)";
export const COURS_GRAPHIQUE = "(cours, § 3)";
export const COURS_EQUATIONS = "(cours, § 4)";

type Fragments = FragmentConsigne[];

/** « \lim_{x\to a} » (la normalisation commune du site place « x → a » SOUS « lim »). */
export function lim(vers: string, variable = "x"): string {
  return `\\lim_{${variable}\\to ${vers}}`;
}

/** Expression entre parenthèses quand elle a un + / − de niveau 0 (sinon telle quelle). */
export function enParentheses(t: string): string {
  let prof = 0;
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    if (c === "{" || c === "(" || c === "[") prof++;
    else if (c === "}" || c === ")" || c === "]") prof--;
    else if (prof === 0 && i > 0 && (c === "+" || c === "-")) return `\\left(${t}\\right)`;
  }
  return t;
}

/** Facteur d'un produit : parenthèses s'il commence par « − » ou contient un + / − de niveau 0. */
export function facteur(t: string): string {
  const s = t.trim();
  if (s.startsWith("-")) return `(${s})`;
  return enParentheses(s);
}

/** Coefficient devant un facteur : « » (1), « - » (−1), « 3 » sinon. */
export function coefDevant(k: number): string {
  return k === 1 ? "" : k === -1 ? "-" : `${k}`;
}

/** Base d'une exponentielle en LaTeX (e, entier, ou décimal à virgule). */
export function baseLatex(base: number | string, estE = false): string {
  if (estE || base === "e") return "e";
  return String(base).replace(".", "{,}");
}

/** Lignes de la règle de la chaîne pour (a^{u})' : u(x), u'(x), la formule, puis la forme
 * substituée et ses simplifications (`suite`, une transformation par ligne). */
export function lignesChaineExpo(gauche: string, base: string, u: string, uPrime: string, suite: { latex: string; justification?: string | Fragments }[]): LigneCalcul[] {
  const lignes: LigneCalcul[] = [ligne(`u(x)=${u}`), ligne(`u'(x)=${uPrime}`)];
  lignes.push(ligne(`${gauche}=u'(x)\\cdot ${base}^{u(x)}${base === "e" ? "" : `\\cdot\\ln(${base})`}`, base === "e" ? [texte("règle de la chaîne, "), latex("(e^{u})'=u'\\,e^{u}")] : [texte("règle de la chaîne, "), latex("(a^{u})'=u'\\,a^{u}\\ln(a)")]));
  for (const s of suite) lignes.push(ligne(s.latex, s.justification));
  return sansRepetition(lignes);
}

/** Phrase « La limite vaut … » rédigée en formule (résultat qui se lit seul). */
export function phraseLimite(gauche: string, valeur: string): Fragments {
  return [latex(`${gauche}=${valeur}`)];
}

/** Finition des corrigés de ce chapitre : mêmes règles que le chapitre 3 (fractions lisibles,
 * justifications insécables). */
export function finaliser(etapes: EtapeCorrection[]): EtapeCorrection[] {
  return finaliserCorrige(etapes);
}
