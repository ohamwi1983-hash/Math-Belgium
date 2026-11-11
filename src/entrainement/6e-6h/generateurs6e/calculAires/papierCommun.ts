/**
 * Briques communes aux adaptateurs papier de 6gen26 (aires), 6gen27 (volumes) et 6gen28 (longueur
 * d'arc) — refonte des feuilles et évaluations du chapitre 4 de 6e (`.claude/rules/feuilles-evaluations.md`).
 *
 * - `nettoyerConsigne` : la consigne d'un ÉCRAN (`consigneEcran`, seule source du texte des étapes)
 *   débarrassée de ce qui n'a de sens qu'à l'écran — « confirmé(e) à l'étape précédente » (sur papier,
 *   l'élève enchaîne avec SES résultats), « ajoute autant de champs que nécessaire », la phrase de
 *   précision (elle figure une seule fois, dans l'énoncé). Le texte des écrans n'est pas modifié.
 * - polynômes (familles construites depuis leurs racines) : écriture d'une primitive et d'une forme
 *   factorisée, pour les lignes « Calcul » du corrigé. Les VALEURS (racines, aires, volumes) viennent
 *   toujours de l'exercice et de `formatReponseAttenduePhaseLatex`, jamais recalculées à part.
 */
import type { FragmentConsigne } from "../../../export/genererFeuilleExercices";
import type { TermeA } from "../../core6e/calculPrimitives.types";
import { CONSIGNE_PRECISION, decimalLatex, fractionDepuisValeur, fractionLatex } from "../../ui6e/nombresExactsIntegrales";

/** Morceaux de texte retirés des consignes d'écran (dans cet ordre). */
const RETRAITS: RegExp[] = [
  / ?\(ajoute autant de champs que nécessaire\)/g,
  /, à partir (du signe|de l'ordre|de la forme simplifiée|de la forme développée|des volumes|de la forme) confirmée?s? (à l'étape précédente|aux étapes précédentes)/g,
  /, à partir (du signe|de l'ordre|de la forme développée) confirmée?/g,
  /, à partir de l'expression trouvée à l'étape précédente,/g,
  /, confirmée? à l'étape précédente/g,
  / trouvées à l'étape précédente/g,
  / confirmées à l'étape 1/g,
];

export function nettoyerConsigne(fragments: FragmentConsigne[]): FragmentConsigne[] {
  const sortie: FragmentConsigne[] = [];
  for (let i = 0; i < fragments.length; i++) {
    const f = fragments[i];
    const suivant = fragments[i + 1];
    const apres = fragments[i + 2];
    // « …, à partir de [formule] confirmé(e) à l'étape précédente. » → « …. »
    if (f.type === "texte" && /, à partir de $/.test(f.valeur) && suivant?.type === "latex" && apres?.type === "texte" && /^ confirmée? à l'étape précédente/.test(apres.valeur)) {
      sortie.push({ ...f, valeur: f.valeur.replace(/, à partir de $/, "") });
      sortie.push({ ...apres, valeur: apres.valeur.replace(/^ confirmée? à l'étape précédente/, "") });
      i += 2;
      continue;
    }
    // « …, à partir de la forme confirmée à l'étape précédente (substitution [u = …]). » → « (substitution …) ».
    if (f.type !== "texte") {
      sortie.push(f);
      continue;
    }
    let valeur = f.valeur.split(CONSIGNE_PRECISION).join("");
    for (const motif of RETRAITS) valeur = valeur.replace(motif, "");
    valeur = valeur.replace(/^Confirme le signe/, "Détermine le signe").replace(/ +\./g, ".").replace(/\s+$/, (m) => (i === fragments.length - 1 ? "" : m));
    if (valeur.length > 0) sortie.push({ ...f, valeur });
  }
  return sortie;
}

// ============================================================================
// Polynômes.
// ============================================================================

/** Coefficients {degré → coefficient} d'une somme de termes « puissance » / « constante ». */
export function coefficients(termes: TermeA[]): Map<number, number> {
  const c = new Map<number, number>();
  for (const t of termes) {
    const n = t.type === "constante" ? 0 : (t.n ?? 1);
    c.set(n, (c.get(n) ?? 0) + t.coef);
  }
  return c;
}

/** Différence de deux polynômes donnés en termes (f − g). */
export function difference(f: TermeA[], g: TermeA[]): Map<number, number> {
  const c = coefficients(f);
  for (const [n, v] of coefficients(g)) c.set(n, (c.get(n) ?? 0) - v);
  return c;
}

function coefFractionLatex(v: number): string {
  const f = fractionDepuisValeur(v);
  return f ? fractionLatex(f.num, f.den) : decimalLatex(v);
}

function puissanceX(n: number): string {
  if (n === 0) return "";
  return n === 1 ? "x" : `x^{${n}}`;
}

/** Polynôme {degré → coefficient} en LaTeX, degrés décroissants, coefficients fractionnaires exacts. */
export function polynomeCoefsLatex(c: Map<number, number>): string {
  const degres = [...c.keys()].filter((n) => Math.abs(c.get(n) ?? 0) > 1e-12).sort((a, b) => b - a);
  if (degres.length === 0) return "0";
  return degres
    .map((n, i) => {
      const v = c.get(n) as number;
      const abs = Math.abs(v);
      const signe = v < 0 ? "-" : i === 0 ? "" : "+";
      const coef = n !== 0 && Math.abs(abs - 1) < 1e-12 ? "" : coefFractionLatex(abs);
      return `${signe}${coef}${puissanceX(n)}`;
    })
    .join("");
}

/** Primitive (constante nulle) d'un polynôme {degré → coefficient}. */
export function primitiveCoefs(c: Map<number, number>): Map<number, number> {
  const p = new Map<number, number>();
  for (const [n, v] of c) p.set(n + 1, v / (n + 1));
  return p;
}

/** Facteur (x − r) en LaTeX : « x », « (x-2) », « (x+3) », avec exposant éventuel. */
function facteur(r: number, exposant = 1): string {
  const corps = r === 0 ? "x" : r > 0 ? `(x-${r})` : `(x+${-r})`;
  if (exposant === 1) return corps;
  return r === 0 ? `x^{${exposant}}` : `${corps}^{${exposant}}`;
}

/** Forme factorisée A·(x − r₁)^m₁·(x − r₂)^m₂… — `racines` dans l'ordre d'écriture. */
export function factoriseLatex(dominant: number, racines: { r: number; m?: number }[]): string {
  const coef = dominant === 1 ? "" : dominant === -1 ? "-" : coefFractionLatex(dominant);
  return `${coef}${racines.map(({ r, m }) => facteur(r, m ?? 1)).join("")}`;
}

/** Coefficient dominant d'un polynôme {degré → coefficient}. */
export function dominant(c: Map<number, number>): number {
  const n = Math.max(...[...c.keys()].filter((d) => Math.abs(c.get(d) ?? 0) > 1e-12));
  return c.get(n) ?? 0;
}

/** Nombre écrit pour une ligne de calcul : entier, fraction, ou décimal à virgule. */
export function nombreCalculLatex(v: number): string {
  return coefFractionLatex(v);
}

/**
 * « Données : … » de l'énoncé papier, depuis les MÊMES lignes que l'écran (`blocDonnees`) : une
 * formule par donnée (groupée, pour qu'une ligne ne se coupe jamais au milieu de « a = −3 »), et la
 * prose des lignes d'écran (« Intervalle : », « Aire visée : ») sortie du mode mathématique.
 */
export function donneesPapier(lignes: string[]): FragmentConsigne[] {
  const morceaux: FragmentConsigne[][] = [];
  for (const ligne of lignes)
    for (const item of ligne.split("\\text{, }")) {
      const m = /^\\text\{([^}]*)\}(.*)$/.exec(item);
      morceaux.push(m ? [{ type: "texte", valeur: m[1].charAt(0).toLowerCase() + m[1].slice(1) }, { type: "latex", valeur: `{${m[2]}}` }] : [{ type: "latex", valeur: `{${item}}` }]);
    }
  const sortie: FragmentConsigne[] = [{ type: "texte", valeur: " Données : " }];
  morceaux.forEach((m, i) => {
    if (i > 0) sortie.push({ type: "texte", valeur: " ; " });
    sortie.push(...m);
  });
  sortie.push({ type: "texte", valeur: "." });
  return sortie;
}
