import type { NatureSaisie } from "../moteur6e/saisieCombinatoire";
import type { Rationnel } from "../moteur6e/saisieCombinatoire";

/**
 * Briques de texte COMMUNES aux six générateurs du 6e ch. 7 (6gen43–6gen48, audit, lot B) : même
 * source pour l'écran et pour le papier (les adaptateurs d'export réutilisent les mêmes fonctions de
 * format). Règles du site : KaTeX pour toute formule (jamais de notation clavier visible), signe
 * « − », virgule décimale `{,}`, espaces de milliers (`\,` en KaTeX, espace fine en texte), pas de
 * majuscules d'insistance.
 */

export type FragmentConsigne = { type: "texte"; valeur: string } | { type: "latex"; valeur: string };

export function t(valeur: string): FragmentConsigne {
  return { type: "texte", valeur };
}
export function m(valeur: string): FragmentConsigne {
  return { type: "latex", valeur };
}

/** « texte $formule$ texte » → fragments (texte / KaTeX). */
export function f(texte: string): FragmentConsigne[] {
  const r: FragmentConsigne[] = [];
  texte.split("$").forEach((morceau, i) => {
    if (morceau !== "") r.push(i % 2 === 1 ? m(morceau) : t(morceau));
  });
  return r;
}

/** Entier avec espaces de milliers, en KaTeX (« 34\,650 » ; 4 chiffres : sans espace). */
export function milliers(n: number | bigint): string {
  const s = (typeof n === "bigint" ? n : BigInt(Math.round(n))).toString();
  const signe = s.startsWith("-") ? "-" : "";
  const corps = signe ? s.slice(1) : s;
  return signe + (corps.length > 4 ? corps.replace(/\B(?=(\d{3})+$)/g, "\\,") : corps);
}

/** Même chose en texte (espace fine insécable). */
export function milliersTexte(n: number | bigint): string {
  return milliers(n).replace(/\\,/g, " ").replace("-", "−");
}

/** Décimal exact « propre » en KaTeX (0,3 → 0{,}3 ; −0,02 → -0{,}02). */
export function decimalLatex(x: number, decimalesMax = 10): string {
  const s = Number(x.toFixed(decimalesMax)).toString();
  if (s.includes("e")) return s;
  const [ent, frac] = s.split(".");
  return frac === undefined ? milliers(Number(ent)) : `${ent}{,}${frac}`;
}

/** Valeur approchée en KaTeX, arrondie à `d` décimales (« 0{,}107 »). */
export function arrondiLatex(x: number, d: number): string {
  return x.toFixed(d).replace(".", "{,}");
}

/** Fraction réduite en KaTeX (entier si le dénominateur vaut 1). */
export function fractionLatex(r: Rationnel): string {
  if (r.d === 1n) return milliers(r.n);
  const signe = r.n < 0n ? "-" : "";
  const n = r.n < 0n ? -r.n : r.n;
  return `${signe}\\dfrac{${milliers(n)}}{${milliers(r.d)}}`;
}

/** Nombre de chiffres significatifs pour un arrondi lisible d'une probabilité (≥ 3 décimales). */
export function decimalesAffichage(x: number): number {
  if (x === 0) return 3;
  return Math.max(3, Math.ceil(-Math.log10(Math.abs(x))) + 2);
}

// ============================================================================
// Écrans
// ============================================================================

export interface OptionChoixCombi {
  valeur: string;
  /** Libellé, formules courtes entre `$…$`. */
  label: string;
}

export interface ChampCombi {
  type: "texte" | "choix" | "liste";
  /** Libellé court, formules entre `$…$` (jamais de notation clavier). */
  label: string;
  options?: OptionChoixCombi[];
  /** Aperçu KaTeX de la saisie sous le champ (écrans « formule »). */
  apercu?: boolean;
  /** Nature de la saisie (pour l'aperçu d'un polynôme). */
  nature?: NatureSaisie;
  /** Indication de format (jamais une valeur possible). */
  placeholder?: string;
}

/** Une aide : une phrase (formules courtes entre `$…$`), puis, facultativement, une formule. */
export interface AideCombi {
  texte: string;
  latex?: string;
}

export interface FormatCombinatoire<E, P extends string> {
  consigneGenerale: (e: E) => FragmentConsigne[];
  /** Données de l'énoncé, ligne par ligne (prose avec KaTeX en ligne : rien n'est coupé à 390 px). */
  donnees: (e: E) => FragmentConsigne[][];
  consigneEcran: (e: E, p: P) => FragmentConsigne[];
  champs: (e: E, p: P) => ChampCombi[];
  aides: (e: E, p: P) => AideCombi[];
  /** Réponse attendue de l'écran (fragments KaTeX). */
  reponseAttendue: (e: E, p: P) => string[];
  /** Explication montrée après un échec (une ligne par fragment). */
  explication: (e: E, p: P) => FragmentConsigne[][];
  libellePhase: (e: E, p: P) => string;
  /** Message ciblé sur l'erreur typique trahie par une réponse fausse (jamais la réponse). */
  messageCible?: (e: E, p: P, valeurs: string[]) => FragmentConsigne[] | null;
}

/** Données en une seule suite de fragments (papier : « Données : … »). */
export function donneesEnLigne(lignes: FragmentConsigne[][]): FragmentConsigne[] {
  const r: FragmentConsigne[] = [];
  lignes.forEach((l, i) => {
    if (i > 0) r.push(t(" "));
    r.push(...l);
  });
  return r;
}

export const LIBELLE_CHAMP_DE_FORMAT = {
  formule: "formule, sans la calculer",
  liste: "a ; b ; c",
} as const;
