import { evaluerValeurExponentielle } from "./expressionExponentielle";

/**
 * Valeur EXACTE exigée (6gen25, 6gen26, 6gen27 — décision de l'utilisateur du 24/11/2026) : quand la
 * réponse d'un écran contient ln, e, π, √… la consigne demande la forme exacte (la Graph Math+ en
 * donne un décimal avec ∫, l'élève doit passer par la primitive). Un ARRONDI (valeur à la tolérance
 * d'avant, qui l'acceptait) est alors refusé SANS tentative, avec un message ciblé — comme les autres
 * refus de valeur approchée du site (`moteur/saisieExacteTrigo.ts`, 6e ch. 1 et 2) ; une valeur
 * exacte s'écrit librement (« 3ln2 − 1 », « pi/4 », « 2√3 − 2/9 »…). Une saisie illisible ou une
 * valeur fausse suivent le chemin habituel (`parse_error`, tentative).
 */

/** Écart relatif admis pour une saisie EXACTE (erreurs d'arrondi du calcul flottant seulement). */
const TOLERANCE_EXACTE = 1e-11;

export function toleranceExacte(cible: number): number {
  return TOLERANCE_EXACTE * Math.max(1, Math.abs(cible));
}

/** Symboles à garder, lus sur le LaTeX de la valeur exacte attendue (ordre d'apparition). */
export function symbolesDeValeurExacte(latex: string): string[] {
  const s: string[] = [];
  const ajouter = (x: string) => {
    if (!s.includes(x)) s.push(x);
  };
  const motifs: [RegExp, string][] = [
    [/\\ln/, "ln"],
    [/\\pi/, "π"],
    [/\\sqrt/, "√"],
    [/\\arctan/, "arctan"],
    [/\\arcsin/, "arcsin"],
    [/\\sin(?![a-z])/, "sin"],
    [/\\cos(?![a-z])/, "cos"],
    [/(^|[^a-zA-Z\\])e(?![a-zA-Z])/, "e"],
  ];
  const positions = motifs.map(([re, nom]) => ({ nom, i: latex.search(re) })).filter((m) => m.i >= 0);
  positions.sort((a, b) => a.i - b.i).forEach((m) => ajouter(m.nom));
  return s;
}

export function messageValeurExacteAttendue(symboles: string[]): string {
  const liste = symboles.length === 0 ? "" : symboles.length === 1 ? symboles[0] : `${symboles.slice(0, -1).join(", ")} et ${symboles[symboles.length - 1]}`;
  const garde = liste ? ` : garde ${liste} dans ta réponse` : "";
  return `On attend la valeur exacte, pas un arrondi${garde} (la calculatrice n'en donne qu'une valeur approchée). Cette saisie ne compte pas comme une tentative.`;
}

/** Message de refus si `texte` est un ARRONDI de `cible` (lisible, à `toleranceArrondi` près, mais
 * pas exact) ; `null` sinon (exacte, fausse ou illisible : chemin habituel). */
export function refusArrondi(texte: string, cible: number, toleranceArrondi: number, symboles: string[]): string | null {
  const v = evaluerValeurExponentielle(texte);
  if (v === null) return null;
  const ecart = Math.abs(v - cible);
  if (ecart <= toleranceExacte(cible)) return null;
  return ecart <= toleranceArrondi ? messageValeurExacteAttendue(symboles) : null;
}
