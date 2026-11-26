import { lx, tx } from "../../../../5e-4h/ui5e/ecransTrigo.types";
import type { AideEcran, Frag, ModeEcran, OptionEcran } from "../../../../5e-4h/ui5e/ecransTrigo.types";
import { lireEnsemble, RACCOURCIS_ENSEMBLE } from "../../../../5e-4h/moteur5e/ensemblesReels";
import { ensembleXL, nombreExactL } from "../../communReels/ensemblesExacts";
import { qL } from "../../communReels/outilsReels";
import type { ExerciceAbsolue, PhaseAbsolue, SorteOption } from "../core/types";

/**
 * Couche C — textes de `56gen18` « Équations et inéquations avec valeurs absolues » : écritures (ax + b,
 * |…|, symboles), consignes, options, aides à deux niveaux (méthode du cours, puis posée pour
 * l'instance ; jamais la réponse), réponses. Source unique de l'écran, du corrigé et du papier.
 */

type E = ExerciceAbsolue;
type P = PhaseAbsolue;

export const phases = (e: E): P[] => (e.variante === "deuxAbsolues" ? ["egaux", "opposes", "ensemble"] : ["traduire", "ensemble"]);

/** « 3x+1 », « -x-2 », « 2x ». */
export function affineL(a: number, b: number): string {
  const ax = a === 1 ? "x" : a === -1 ? "-x" : `${a}x`;
  return b === 0 ? ax : `${ax}${b > 0 ? "+" : "-"}${Math.abs(b)}`;
}
export const AL = (e: E): string => (e.variante === "carre" ? `x^{2}-${e.a}` : affineL(e.a, e.b));
export const BL = (e: E): string => affineL(e.c, e.d);
export const absL = (x: string): string => `\\left|${x}\\right|`;

export function enonceL(e: E): string {
  if (e.variante === "deuxAbsolues") return `${absL(AL(e))}=${absL(BL(e))}`;
  return `${absL(AL(e))}${e.symbole === "=" ? "=" : e.symbole}${e.c}`;
}

const strict = (e: E) => e.symbole === "<" || e.symbole === ">";
export const sPetit = (e: E) => (strict(e) ? "<" : "\\leq ");
export const sGrand = (e: E) => (strict(e) ? ">" : "\\geq ");
export const estPetit = (e: E) => e.symbole === "<" || e.symbole === "\\leq";

/** Écriture d'une option du premier écran. */
export function optionL(e: E, s: SorteOption): Frag[] {
  const A = AL(e);
  const k = Math.abs(e.c);
  const carre = e.variante === "carre";
  const m1 = e.a - e.c;
  const m2 = e.a + e.c;
  switch (s) {
    case "deux":
      return [lx(`${A}=${k}`), tx(" ou "), lx(`${A}=-${k}`)];
    case "une":
      return [lx(`${A}=${e.c}`), tx(" seulement")];
    case "zero":
      return [lx(`${A}=0`)];
    case "nonZero":
      return [lx(`${A}\\neq 0`)];
    case "aucune":
      return [tx("Aucun réel ne convient")];
    case "tous":
      return [tx("Tous les réels conviennent")];
    case "entre":
      return carre ? [lx(`${m1}${sPetit(e)}x^{2}${sPetit(e)}${m2}`)] : [lx(`-${k}${sPetit(e)}${A}${sPetit(e)}${k}`)];
    case "dehors":
      return carre ? [lx(`x^{2}${sPetit(e)}${m1}`), tx(" ou "), lx(`x^{2}${sGrand(e)}${m2}`)] : [lx(`${A}${sPetit(e)}-${k}`), tx(" ou "), lx(`${A}${sGrand(e)}${k}`)];
    case "seulDroite":
      return [lx(`x^{2}${estPetit(e) ? sPetit(e) : sGrand(e)}${m2}`), tx(" seulement")];
    case "oubliK":
      return estPetit(e) ? [lx(`-${e.c}${sPetit(e)}x^{2}${sPetit(e)}${e.c}`)] : [lx(`x^{2}${sPetit(e)}-${e.c}`), tx(" ou "), lx(`x^{2}${sGrand(e)}${e.c}`)];
  }
}

export function consigneGenerale(e: E): Frag[] {
  return [tx("Résous dans "), lx("\\mathbb{R}"), tx(" : "), lx(enonceL(e)), tx(".")];
}

export function libelle(_e: E, p: P): string {
  return { traduire: "Sans valeur absolue", egaux: "Cas « égaux »", opposes: "Cas « opposés »", ensemble: "Ensemble des solutions" }[p];
}

export function consigne(e: E, p: P): Frag[] {
  switch (p) {
    case "traduire":
      return [tx(e.variante === "equation" ? "À quoi cette équation équivaut-elle, sans valeur absolue ?" : "À quoi cette inéquation équivaut-elle, sans valeur absolue ?")];
    case "egaux":
      return [tx("Deux nombres de même valeur absolue sont égaux ou opposés. Résous d'abord "), lx(`${AL(e)}=${BL(e)}`), tx(".")];
    case "opposes":
      return [tx("Résous ensuite "), lx(`${AL(e)}=-(${BL(e)})`), tx(".")];
    case "ensemble":
      return [tx("Donne l'ensemble S des solutions (des valeurs exactes).")];
  }
}

export const estChoix = (_e: E, p: P): boolean => p === "traduire";

export function options(e: E): OptionEcran[] {
  return e.options.map((s) => ({ id: s, fragments: optionL(e, s) }));
}

export const RACCOURCIS_ABS = [...RACCOURCIS_ENSEMBLE, { libelle: "{", texte: "{" }, { libelle: "}", texte: "}" }, { libelle: "√", texte: "√" }, { libelle: "∖", texte: " ∖ " }];

/** Saisie « x = 3 ou x = −5 » ramenée à « {3 ; −5} » (lue ensuite comme un ensemble). */
export function versEnsembleTexte(texte: string): string {
  const s = texte.trim();
  const morceaux = s.split(/\s+ou\s+|\s*;\s*|\s*,\s+/);
  if (morceaux.length >= 1 && morceaux.every((m) => /^x\s*=\s*\S/.test(m))) return `{${morceaux.map((m) => m.replace(/^x\s*=\s*/, "")).join(" ; ")}}`;
  return s;
}

export function apercuEnsembleExact(texte: string): string | null {
  const l = lireEnsemble(versEnsembleTexte(texte));
  if (!l) return null;
  return ensembleXL(l.ensemble.map((i) => ({ g: { v: i.g, L: nombreExactL(i.g) }, gF: i.gF, d: { v: i.d, L: nombreExactL(i.d) }, dF: i.dF })));
}

export function mode(e: E, p: P): ModeEcran {
  if (p === "traduire") return { type: "choix", options: options(e) };
  if (p === "ensemble") return { type: "champs", champs: [{ label: "Ensemble des solutions", labelLatex: "S=", placeholder: "ex. : {−3 ; 7} ou ]1 ; 4[", apercuLatex: apercuEnsembleExact, raccourcis: RACCOURCIS_ABS }] };
  return { type: "champs", champs: [{ label: "Solution", labelLatex: "x=", placeholder: "ex. : −3/2", raccourcis: [] }] };
}

export function aide1(e: E, p: P): AideEcran {
  switch (p) {
    case "traduire":
      if (e.variante === "carre") return { texte: [tx("Traite d'abord l'expression entre les barres comme un tout, avec la méthode du cours (étape 4) : pour c > 0,")], latex: "|A|<c\\iff -c<A<c\\qquad |A|>c\\iff A<-c\\ \\text{ou}\\ A>c" };
      if (e.variante === "equation") return { texte: [tx("Méthode du cours (étape 4) : si c < 0, |A| = c n'a aucune solution ; si c = 0, |A| = 0 équivaut à A = 0 ; si c > 0, |A| = c équivaut à A = c ou A = −c. Une valeur absolue n'est jamais négative.")] };
      return { texte: [tx("Méthode du cours (étape 4) : pour c > 0, |A| < c équivaut à −c < A < c et |A| > c à A < −c ou A > c (mêmes règles avec ≤ et ≥). Pour c ≤ 0, raisonne sur le fait qu'une valeur absolue est toujours positive ou nulle.")] };
    case "egaux":
    case "opposes":
      return { texte: [tx("Résous une équation du premier degré : regroupe les termes en x d'un côté, les nombres de l'autre, puis divise par le coefficient de x.")] };
    case "ensemble":
      return e.variante === "deuxAbsolues"
        ? { texte: [tx("Les solutions de l'équation sont celles des deux cas réunies (cours, étape 4) :")], latex: "|A|=|B|\\iff A=B\\ \\text{ou}\\ A=-B" }
        : { texte: [tx("Résous la traduction trouvée ; attention au sens des inégalités quand tu divises par un nombre négatif. Écris un ensemble de nombres entre accolades, des intervalles avec des crochets (fermé si la borne est comprise), ∅ ou ℝ.")] };
  }
}

export function aide2(e: E, p: P): AideEcran {
  const A = AL(e);
  switch (p) {
    case "traduire":
      if (e.variante === "carre") return { texte: [tx("Ici, "), lx(`A=x^{2}-${e.a}`), tx(" et "), lx(`c=${e.c}`), tx(" : traduis, puis ajoute "), lx(`${e.a}`), tx(" à chaque membre.")] };
      return { texte: [tx("Ici, "), lx(`A=${A}`), tx(" et "), lx(`c=${e.c}`), tx(" : quel est le signe de c ?")] };
    case "egaux":
      return { texte: [tx("Ici, "), lx(`${A}=${BL(e)}`), tx(" : passe "), lx(affineL(e.c, 0)), tx(" à gauche et "), lx(`${e.b}`), tx(" à droite.")] };
    case "opposes":
      return { texte: [tx("Ici, distribue d'abord le signe « − » : "), lx(`-(${BL(e)})=${affineL(-e.c, -e.d)}`), tx(".")] };
    case "ensemble":
      if (e.variante === "deuxAbsolues") return { texte: [tx("Ici, réunis les deux solutions trouvées dans un ensemble entre accolades.")] };
      if (e.variante === "carre") return { texte: [tx("Ici, "), lx(`x^{2}${estPetit(e) ? "<" : ">"} m`), tx(" se résout avec "), lx("\\left|x\\right|"), tx(" et "), lx("\\sqrt{m}"), tx(" : "), lx("x^{2}<m\\iff -\\sqrt{m}<x<\\sqrt{m}"), tx(".")] };
      if (e.signe === "positif") return { texte: [tx("Ici, résous chaque morceau de la traduction : "), lx(`${A}=${Math.abs(e.c)}`), tx(" et "), lx(`${A}=-${Math.abs(e.c)}`), tx(" donnent les bornes.")] };
      if (e.signe === "nul") return { texte: [tx("Ici, cherche la valeur de x qui annule "), lx(A), tx(".")] };
      return { texte: [tx("Ici, compare une valeur absolue (toujours positive ou nulle) au nombre négatif "), lx(`${e.c}`), tx(".")] };
  }
}

export function messageIllisible(_e: E, p: P): string {
  if (p === "ensemble") return "Écris un ensemble : des nombres entre accolades ({−3 ; 7}), des intervalles (]1 ; 4] ∪ [5 ; +∞[), ℝ, ℝ ∖ {2} ou ∅. Cette saisie ne compte pas comme une tentative.";
  if (p === "traduire") return "Choisis une des propositions. Cette saisie ne compte pas comme une tentative.";
  return "Écris un nombre (−3, 5/2…). Cette saisie ne compte pas comme une tentative.";
}

export function reponse(e: E, p: P): Frag[] {
  switch (p) {
    case "traduire":
      return [lx(enonceL(e)), tx(" équivaut à : "), ...optionL(e, e.bonne!)];
    case "egaux":
      return [lx(`${AL(e)}=${BL(e)}\\iff x=${qL(e.x1!)}`)];
    case "opposes":
      return [lx(`${AL(e)}=-(${BL(e)})\\iff x=${qL(e.x2!)}`)];
    case "ensemble":
      return [lx(`S=${ensembleXL(e.solutions)}`)];
  }
}

export const recap = reponse;

export function explication(e: E): string {
  if (e.variante === "carre") return "On traduit |A| comparé à c, avec A = x² − k, puis on ajoute k à chaque membre.";
  if (e.signe === "negatif") return "Une valeur absolue n'est jamais négative.";
  if (e.signe === "nul") return "Une valeur absolue n'est nulle que si le nombre est nul, et elle est toujours positive ou nulle.";
  return "Pour c > 0, on enlève la valeur absolue avec la méthode du cours.";
}
