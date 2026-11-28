import type { EtapeCorrection, FragmentConsigne } from "../../export/genererFeuilleExercices";
import { lettreEtape } from "../../export/corrigeTableau";
import { arrondiLatex, decimalLatex } from "./fragmentsCombinatoire";

/**
 * Briques du corrigé « comme au tableau » des générateurs 6gen49–6gen53 (6e ch. 8, audit, lot E), en
 * plus de celles du ch. 7 (`corrigeCombinatoire.ts` : `fx`, `utiliseCours`, `calcul`, `ligne`,
 * `finaliserCombinatoire`…). SANS `docx` : importé par les adaptateurs papier ET par les applis.
 * Notation du cours : 𝓑(n ; p) calligraphique, 𝒩(μ ; σ), Cₙᵏ, P(S∣Cⱼ).
 */

export const COURS_DISCRETES = "cours, point 1";
export const COURS_BINOMIALE_8 = "cours, point 2";
export const COURS_NORMALE = "cours, point 6";
export const COURS_EXTENSIONS = "cours, point 7";
export const COURS_POISSON = "cours, point 8";

export const BIN = (n: string | number, p: string) => `\\mathcal{B}(${n}\\,;${p})`;
export const NOR = (mu: string | number, sigma: string | number) => `\\mathcal{N}(${mu}\\,;${sigma})`;

/** Décimal en KaTeX, le signe moins devant (« −1{,}2 »). */
export const dl = (x: number, d = 10) => decimalLatex(x, d);
/** Arrondi à d décimales, chiffres gardés (« 0{,}2240 »). */
export const ar = (x: number, d: number) => arrondiLatex(x, d);
/** Nombre entre parenthèses s'il est négatif. */
export const parD = (x: number) => (x < 0 ? `(${dl(x)})` : dl(x));

/**
 * Corrigé écrit avec une lettre par ÉCRAN de l'appli → corrigé du PAPIER, dont certains écrans ne sont
 * pas des étapes (6gen50 : l'écran « diagramme », propre à l'appli). Les lignes des écrans retirés
 * disparaissent, les lettres suivantes sont décalées (étape n du papier = n-ième écran gardé).
 */
export function versLettresPapier<P extends string>(etapes: EtapeCorrection[], ecrans: P[], papier: P[]): EtapeCorrection[] {
  const nouvelle = new Map<string, string>();
  ecrans.forEach((p, i) => {
    const j = papier.indexOf(p);
    if (j >= 0) nouvelle.set(lettreEtape(i), lettreEtape(j));
  });
  return etapes.flatMap((e) => {
    if (!e.sousQuestion) return [e];
    const l = nouvelle.get(e.sousQuestion);
    return l ? [{ ...e, sousQuestion: l }] : [];
  });
}

/** Fragments « texte » et « latex » d'une chaîne « texte $formule$ texte » (comme `fx`), sans `{,}` en texte. */
export function frag(s: string): FragmentConsigne[] {
  const r: FragmentConsigne[] = [];
  s.split("$").forEach((morceau, i) => {
    if (morceau !== "") r.push(i % 2 === 1 ? { type: "latex", valeur: morceau } : { type: "texte", valeur: morceau });
  });
  return r;
}
