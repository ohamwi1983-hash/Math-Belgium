import type { FragmentConsigne, LigneCalcul } from "../../export/genererFeuilleExercices";
import { latex, ligne, texte } from "../../export/corrigeTableau";
import type { Q } from "./corrigeIntegrales1";
import { q, qDiv, qL, qSub } from "./corrigeIntegrales1";
import { finaliserCorrige as finaliserLog, fractionsLisibles } from "./corrigeLogarithmes1";
import type { EtapeCorrection } from "../../export/genererFeuilleExercices";

/**
 * Briques communes des corrigés détaillés « comme au tableau » du chapitre 2 de 6e (« Fonctions
 * exponentielles »), seconde moitié des générateurs : 6gen10 (inéquations), 6gen11 (étude de
 * fonction), 6gen12 (problèmes) — règle `.claude/rules/feuilles-evaluations.md`, « Corrigé détaillé
 * — comme au tableau ». SANS dépendance à `docx` : importé par les adaptateurs papier ET par les
 * générateurs interactifs (corrigé d'une étape échouée).
 *
 * Les outils déjà écrits pour le chapitre jumeau (logarithmes, `corrigeLogarithmes1/2.ts`) et pour
 * les intégrales (rationnels exacts `Q`, `corrigeIntegrales1.ts`) sont réexportés plutôt que
 * dupliqués ; seuls les outils propres aux exponentielles vivent ici.
 */

export { justif, sommeTermes, affine, parE, listeEt } from "./corrigeLogarithmes1";
export { arrondi, dec, decFixe, estExact, nt, vaut, sansRepetition } from "./corrigeLogarithmes2";
export type { Q } from "./corrigeIntegrales1";
export { q, qAdd, qDiv, qL, qMul, qNeg, qSub, qVal, qPow } from "./corrigeIntegrales1";

/** Renvois aux sections du chapitre « Fonctions exponentielles » (numéros `number` du contenu). */
export const COURS_LIMITES = "(cours, point 1)";
export const COURS_DERIVEE = "(cours, point 2)";
export const COURS_EQUATIONS = "(cours, point 4)";
export const COURS_INEQUATIONS = "(cours, point 5)";
export const COURS_ETUDE = "(cours, point 6)";
export const COURS_PROBLEMES = "(cours, point 7)";

/** Finition des corrigés du chapitre : celle du chapitre jumeau (fractions lisibles dans les calculs
 * et résultats, justifications insécables), plus des fractions lisibles dans TOUTES les formules
 * (« Ce qu'on utilise », justifications, pièges) — une base `\frac{3}{10}` y était rendue en très petit. */
export function finaliserCorrige(etapes: EtapeCorrection[]): EtapeCorrection[] {
  const f = (fr: FragmentConsigne): FragmentConsigne => (fr.type === "latex" ? { ...fr, valeur: fractionsLisibles(fr.valeur) } : fr);
  return finaliserLog(etapes).map((e) => ({
    ...e,
    fragments: e.fragments.map(f),
    ...(e.calcul ? { calcul: e.calcul.map((l) => (Array.isArray(l.justification) ? { ...l, justification: l.justification.map(f) } : l)) } : {}),
  }));
}

export type Comparateur = ">" | "<" | ">=" | "<=";

/** Symbole LaTeX d'un comparateur (suivi d'une espace : jamais collé à une lettre). */
export function sym(c: Comparateur): string {
  return c === ">" ? ">" : c === "<" ? "<" : c === ">=" ? "\\geq " : "\\leq ";
}

export function inverser(c: Comparateur): Comparateur {
  return c === ">" ? "<" : c === "<" ? ">" : c === ">=" ? "<=" : ">=";
}

/** Comparateur en TEXTE (justifications) : « > », « ≥ »… */
export function symTexte(c: Comparateur): string {
  return c === ">" ? ">" : c === "<" ? "<" : c === ">=" ? "≥" : "≤";
}

const OUVRE = "\\mathopen{]}";
const FERME = "\\mathclose{[}";

/** Intervalle « x cmp v » (v en LaTeX) — ±∞ toujours ouverts, crochet de v fermé si l'inégalité est large. */
export function demiDroite(cmp: Comparateur, v: string): string {
  if (cmp === ">") return `${OUVRE}${v}\\,;\\,+\\infty${FERME}`;
  if (cmp === ">=") return `[${v}\\,;\\,+\\infty${FERME}`;
  if (cmp === "<") return `${OUVRE}-\\infty\\,;\\,${v}${FERME}`;
  return `${OUVRE}-\\infty\\,;\\,${v}]`;
}

/** a·x + b en LaTeX sans coefficient 1 ni terme nul (« 2x-3 », « -x », « 5 »), variable au choix. */
export function affineL(a: number, b: number, x = "x"): string {
  const ax = a === 0 ? "" : a === 1 ? x : a === -1 ? `-${x}` : `${a}${x}`;
  if (b === 0) return ax === "" ? "0" : ax;
  if (ax === "") return String(b);
  return `${ax}${b > 0 ? "+" : "-"}${Math.abs(b)}`;
}

/**
 * Inéquation du premier degré m·x + n cmp V (V rationnel) résolue ligne à ligne : « m x cmp V − n »
 * (si n ≠ 0), puis « x cmp' (V − n)/m » (sens changé si m < 0). Renvoie les lignes et la borne.
 */
export function lignesInequationAffine(m: number, n: number, cmp: Comparateur, V: Q, avecDepart = true, x = "x"): { lignes: LigneCalcul[]; borne: Q; cmpFinal: Comparateur } {
  const lignes: LigneCalcul[] = [];
  if (avecDepart) lignes.push(ligne(`${affineL(m, n, x)}${sym(cmp)}${qL(V)}`));
  const reste = qSub(V, q(n));
  if (n !== 0) lignes.push(ligne(`${affineL(m, 0, x)}${sym(cmp)}${qL(reste)}`, n > 0 ? `on soustrait ${n}` : `on ajoute ${-n}`));
  const borne = qDiv(reste, q(m));
  const cmpFinal = m > 0 ? cmp : inverser(cmp);
  if (m !== 1) lignes.push(ligne(`${x}${sym(cmpFinal)}${qL(borne)}`, m > 0 ? `on divise par ${m}` : `on divise par ${m} < 0 : le sens change`));
  return { lignes, borne, cmpFinal };
}

/** Limite écrite « comme au tableau » : « x → a » SOUS « lim » (`\lim\limits`). */
export function lim(dir: string, expr: string, valeur: string, j?: string | FragmentConsigne[]): LigneCalcul {
  return ligne(`\\lim\\limits_{${dir}}${expr}=${valeur}`, j);
}

/** Coefficient devant un corps (« 2e^{x} », « -e^{x} », « e^{x} »). */
export function coefDevant(k: number, corps: string): string {
  if (k === 1) return corps;
  if (k === -1) return `-${corps}`;
  return `${k}${corps}`;
}

/** Fraction n/2 en LaTeX (« 1 », « \dfrac{3}{2} », « -\dfrac{1}{2} »). */
export function demi(n: number): string {
  return n % 2 === 0 ? String(n / 2) : `${n < 0 ? "-" : ""}\\dfrac{${Math.abs(n)}}{2}`;
}

/** Formules énumérées séparées par « ; » en texte (jamais à l'intérieur d'une formule). */
export function formulesSeparees(formules: string[], separateur = " ; "): FragmentConsigne[] {
  return formules.flatMap((x, i) => (i === 0 ? [latex(x)] : [texte(separateur), latex(x)]));
}

/**
 * Tableau de variation en LaTeX (environnement `array`) : ligne `x` (bornes et valeurs remarquables),
 * ligne du signe de f′, ligne des variations (flèches `\nearrow` / `\searrow`, valeurs aux bornes).
 * `colonnesX` : en-têtes (−∞, x₀, +∞…) ; `signes` : un signe par intervalle ; `valeursF` : une
 * valeur (ou limite) par en-tête ; `interdite[k]` : valeur interdite (double barre sur la ligne de
 * f′, `valeursF[k]` porte alors les deux limites, « 0 \,\|\, +\infty ») ; `zero[k]` : f′ s'annule.
 */
export function tableauVariationLatex(colonnesX: string[], signes: ("+" | "-")[], valeursF: string[], options: { zero?: boolean[]; interdite?: boolean[] } = {}): string {
  const n = colonnesX.length;
  const cols = 2 * n - 1;
  const ligneX: string[] = [];
  const ligneS: string[] = [];
  const ligneF: string[] = [];
  for (let i = 0; i < cols; i++) {
    if (i % 2 === 0) {
      const k = i / 2;
      ligneX.push(colonnesX[k]!);
      ligneS.push(options.interdite?.[k] ? "\\|" : options.zero?.[k] ? "0" : "");
      ligneF.push(valeursF[k]!);
    } else {
      const k = (i - 1) / 2;
      ligneX.push("");
      ligneS.push(signes[k]!);
      ligneF.push(signes[k] === "+" ? "\\nearrow" : "\\searrow");
    }
  }
  return [`\\begin{array}{c|${"c".repeat(cols)}}`, `x & ${ligneX.join(" & ")} \\\\ \\hline`, `f'(x) & ${ligneS.join(" & ")} \\\\ \\hline`, `f(x) & ${ligneF.join(" & ")}`, "\\end{array}"].join(" ");
}
