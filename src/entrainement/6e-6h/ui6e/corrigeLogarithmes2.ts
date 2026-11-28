import type { FragmentConsigne, LigneCalcul } from "../../export/genererFeuilleExercices";
import { latex, ligne, texte } from "../../export/corrigeTableau";

/**
 * Briques communes des corrigés détaillés « comme au tableau » du chapitre 3 de 6e (« Fonctions
 * logarithmes »), seconde moitié des générateurs : 6gen22, 6gen85–92 (règle
 * `.claude/rules/feuilles-evaluations.md`, « Corrigé détaillé — comme au tableau »). SANS
 * dépendance à `docx` : importé par les adaptateurs papier ET par les générateurs interactifs
 * (corrigé d'une étape échouée).
 */

/** Renvois aux sections du chapitre « Fonctions logarithmes » (numéros `number` du contenu). */
export const COURS_PROPRIETES = "(cours, point 1)";
export const COURS_EQUATIONS = "(cours, point 2)";
export const COURS_INEQUATIONS = "(cours, point 3)";
export const COURS_DERIVEE = "(cours, point 4)";
export const COURS_LIMITES = "(cours, point 5)";
export const COURS_PARAMETRES = "(cours, point 6)";
export const COURS_ETUDE = "(cours, point 9)";
export const COURS_PROBLEMES = "(cours, point 10)";

/** Arrondi à `d` décimales (sans artefact flottant). */
export function arrondi(v: number, d: number): number {
  const f = Math.pow(10, d);
  const r = Math.round(v * f) / f;
  return Object.is(r, -0) ? 0 : r;
}

/** Nombre décimal en LaTeX, arrondi à `d` décimales, zéros finaux retirés, virgule `{,}`. */
export function dec(v: number, d = 3): string {
  const r = arrondi(v, d);
  return String(r).replace(".", "{,}");
}

/** Nombre décimal en LaTeX avec exactement `d` décimales (zéros finaux gardés : « 1,999 », « 37,10 »). */
export function decFixe(v: number, d: number): string {
  const r = arrondi(v, d);
  return r.toFixed(d).replace(".", "{,}");
}

/** « =valeur » si l'arrondi à `d` décimales est exact, sinon « \approx valeur ». */
export function vaut(v: number, d = 3, fixe = false): string {
  const exact = Math.abs(arrondi(v, d) - v) < 1e-9 * Math.max(1, Math.abs(v));
  return `${exact ? "=" : "\\approx "}${fixe ? decFixe(v, d) : dec(v, d)}`;
}

/** Vrai si `v` s'écrit exactement avec au plus `d` décimales. */
export function estExact(v: number, d: number): boolean {
  return Math.abs(arrondi(v, d) - v) < 1e-9 * Math.max(1, Math.abs(v));
}

/** Nombre écrit dans un TEXTE (justification, « Ce qu'on utilise ») : virgule et « − » typographiques. */
export function nt(v: number, d = 3): string {
  return String(arrondi(v, d)).replace(".", ",").replace("-", "−");
}

/** Terme entre parenthèses s'il commence par un signe moins (dans un produit ou une différence). */
export function par(x: string): string {
  return x.trim().startsWith("-") ? `(${x})` : x;
}

/** Écriture scientifique `m \times 10^{E}` (mantisse à `chiffres` chiffres significatifs), ou décimal si 10⁻³ < v < 10⁵. */
export function sci(v: number, chiffres = 3, fixe = false): string {
  if (v === 0) return "0";
  let e = Math.floor(Math.log10(Math.abs(v)));
  let m = arrondi(v / Math.pow(10, e), chiffres - 1);
  if (Math.abs(m) >= 10) {
    e += 1;
    m = arrondi(v / Math.pow(10, e), chiffres - 1);
  }
  if (e > -3 && e < 5) return dec(v, Math.max(0, chiffres - 1 - e));
  return `${(fixe ? m.toFixed(chiffres - 1) : String(m)).replace(".", "{,}")}\\times 10^{${e}}`;
}

/** Fragments d'une aide de l'écran `{ texte, latex }` (« : » final de l'aide gardé devant la formule). */
export function fragmentsAide(aide: { texte: string; latex: string | null }, renvoi = ""): FragmentConsigne[] {
  const fin = renvoi ? ` ${renvoi}.` : ".";
  if (aide.latex === null) return [texte(aide.texte.replace(/\s*[.:]?\s*$/, "") + fin)];
  return [texte(`${aide.texte.replace(/\s*[:.]?\s*$/, "")} : `), latex(aide.latex), texte(fin)];
}

/** Formules séparées par un texte (« ; » par défaut). */
export function listeFormules(formules: string[], separateur = " ; "): FragmentConsigne[] {
  return formules.flatMap((x, i) => (i === 0 ? [latex(x)] : [texte(separateur), latex(x)]));
}

/** Formules énumérées « A, B et C ». */
export function listeEt(formules: string[]): FragmentConsigne[] {
  return formules.flatMap((x, i) => (i === 0 ? [latex(x)] : [texte(i === formules.length - 1 ? " et " : ", "), latex(x)]));
}

/** Retire les lignes dont le LaTeX répète celui de la précédente (`\dfrac`/`\frac` près). */
export function sansRepetition(lignes: LigneCalcul[]): LigneCalcul[] {
  const norm = (s: string) => s.replace(/\\dfrac/g, "\\frac").replace(/\s+/g, "");
  return lignes.filter((l, i) => i === 0 || norm(l.latex) !== norm(lignes[i - 1]!.latex));
}

/** Chaîne de lignes « gauche », puis « =… » pour chaque membre suivant (une transformation par ligne). */
export function chaine(gauche: string, membres: { latex: string; justification?: string | FragmentConsigne[] }[]): LigneCalcul[] {
  return membres.map((m, i) => ligne(i === 0 ? `${gauche}${m.latex}` : m.latex, m.justification));
}

/** Logarithme de base `b` en LaTeX, comme le reste du chapitre : « \log » (base 10), « \ln » (base e), sinon « \log_{b} ». */
export function logBase(b: string | number): string {
  const s = String(b);
  if (s === "10") return "\\log";
  if (s === "e") return "\\ln";
  return `\\log_{${s}}`;
}
