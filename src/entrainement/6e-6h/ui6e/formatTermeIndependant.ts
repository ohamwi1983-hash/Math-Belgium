import type { ExerciceTI, PhaseTI } from "../core6e/termeIndependant";
import { exposant, kFractionL, kIndependant, PHASES_TI, pq, termeIndependant } from "../core6e/termeIndependant";
import type { AideEcran, ChampEcran, DefinitionEcrans, Frag } from "../../5e-4h/ui5e/ecransTrigo.types";
import { lx, tx } from "../../5e-4h/ui5e/ecransTrigo.types";
import { entL } from "./nombresCombinatoireLotH2";
import { approchee, diagnostiquer, messageIllisible, piege } from "../moteur6e/verificationTermeIndependant";
import { correctionDetailleeTI } from "../generateurs6e/termeIndependant/corrigeDetaille";

/**
 * Couche C — textes de `6gen107` « Terme indépendant » : expression, consignes, champs, aides à deux
 * niveaux (règle du cours, puis posée pour l'instance — jamais le résultat), réponses. Source unique
 * de l'écran, du papier et du corrigé. Notation du cours : T₍ₖ₊₁₎ = Cₙᵏ aⁿ⁻ᵏ bᵏ.
 */

type E = ExerciceTI;
type P = PhaseTI;
const t = tx;
const l = lx;

const puissX = (k: number) => (k === 1 ? "x" : `x^{${k}}`);
/** « 2x^{2} » (premier terme du binôme). */
export const premierL = (e: E) => `${e.a === 1 ? "" : e.a}${puissX(pq(e).p)}`;
/** « \dfrac{3}{x} » (second terme, sans son signe). */
export const secondAbsL = (e: E) => `\\dfrac{${Math.abs(e.b)}}{${puissX(pq(e).q)}}`;
/** « -\dfrac{3}{x} » (second terme avec son signe). */
export const secondL = (e: E) => `${e.b < 0 ? "-" : ""}${secondAbsL(e)}`;
/** « \left(2x^{2}-\dfrac{3}{x}\right)^{9} ». */
export const expressionL = (e: E) => `\\left(${premierL(e)}${e.b < 0 ? "-" : "+"}${secondAbsL(e)}\\right)^{${e.n}}`;
/** Exposant « 18-3k » en LaTeX. */
export function exposantL(e: E): string {
  const { c, pente } = exposant(e);
  return `${c}${pente < 0 ? "-" : "+"}${Math.abs(pente) === 1 ? "" : Math.abs(pente)}k`;
}
/** Terme général « T_{k+1}=C_{9}^{k}\left(x^{2}\right)^{9-k}\left(-\dfrac{2}{x}\right)^{k} ». */
export function termeGeneralL(e: E): string {
  return `T_{k+1}=C_{${e.n}}^{k}\\left(${premierL(e)}\\right)^{${e.n}-k}\\left(${secondL(e)}\\right)^{k}`;
}

export function enonce(e: E): Frag[] {
  return [t("On développe "), l(expressionL(e)), t(" par la formule du binôme de Newton.")];
}

export const consigneGenerale = (e: E): Frag[] => [...enonce(e), t(" On cherche le terme indépendant de "), l("x"), t(" (le terme constant), s'il existe.")];

export const phases = (): P[] => PHASES_TI;

export function libelle(_e: E, p: P): string {
  return p === "exposant" ? "Exposant de x" : p === "k" ? "Valeur de k" : "Terme indépendant";
}

export function consigne(e: E, p: P): Frag[] {
  if (p === "exposant") return [t("Le terme général s'écrit "), l(termeGeneralL(e)), t(". Écris l'exposant de "), l("x"), t(" dans "), l("T_{k+1}"), t(", en fonction de "), l("k"), t(".")];
  if (p === "k") return [t("Pour quelle valeur de "), l("k"), t(" cet exposant est-il nul ? Si aucun entier "), l("k"), t(" de "), l("0"), t(" à "), l(`${e.n}`), t(" ne convient, écris « aucun ».")];
  return [t("Donne le terme indépendant de "), l("x"), t(" (écris "), l("0"), t(" si aucun terme ne convient).")];
}

export function champs(_e: E, p: P): ChampEcran[] {
  if (p === "exposant") return [{ label: "Exposant de x dans le terme général", placeholder: "expression en k" }];
  if (p === "k") return [{ label: "Valeur de k", labelLatex: "k=", placeholder: "entier, ou « aucun »", raccourcis: [{ libelle: "aucun", texte: "aucun" }] }];
  return [{ label: "Terme indépendant", placeholder: "nombre entier" }];
}

export function reponse(e: E, p: P): Frag[] {
  const k = kIndependant(e);
  if (p === "exposant") return [l(exposantL(e))];
  if (p === "k") return k === null ? [t("aucun : "), l(`k=${kFractionL(e)}`), t(" n'est pas entier")] : [l(`k=${k}`)];
  return k === null ? [t("aucun terme indépendant (terme constant nul)")] : [l(`T_{${k + 1}}=${entL(termeIndependant(e))}`)];
}

export const recap = reponse;

export function aide1(_e: E, p: P): AideEcran {
  if (p === "exposant") return { texte: [t("Règles des puissances : "), l("(x^p)^m=x^{pm}"), t(", "), l("\\dfrac{1}{x^q}=x^{-q}"), t(" et "), l("x^r\\cdot x^s=x^{r+s}"), t(".")] };
  if (p === "k") return { texte: [t("Un terme est indépendant de "), l("x"), t(" quand l'exposant de "), l("x"), t(" vaut "), l("0"), t(" (cours, § 3). Comme "), l("k"), t(" est un rang, il doit être un entier de "), l("0"), t(" à "), l("n"), t(".")] };
  return { texte: [t("Terme général du binôme (cours, § 3) : "), l("T_{k+1}=C_n^k\\,a^{n-k}\\,b^{k}"), t(" ; on remplace "), l("k"), t(" par la valeur trouvée.")] };
}

export function aide2(e: E, p: P): AideEcran | null {
  const { p: pp, q } = pq(e);
  if (p === "exposant")
    return { texte: [t("Le premier facteur donne "), l(pp === 1 ? `x^{${e.n}-k}` : `\\left(x^{${pp}}\\right)^{${e.n}-k}=x^{${pp}(${e.n}-k)}`), t(", le second "), l(`\\left(\\dfrac{1}{${puissX(q)}}\\right)^{k}=x^{-${q === 1 ? "" : q}k}`), t(" : additionne les deux exposants.")] };
  if (p === "k") return { texte: [t("Résous l'équation "), l(`${exposantL(e)}=0`), t(", puis regarde si la solution est un entier.")] };
  const k = kIndependant(e);
  if (k === null) return { texte: [t("L'équation de l'écran précédent n'a pas de solution entière : quel terme du développement ne contient pas "), l("x"), t(" ?")] };
  return { texte: [t("Avec "), l(`k=${k}`), t(" : "), l(`T_{${k + 1}}=C_{${e.n}}^{${k}}\\cdot ${e.a === 1 ? "1" : e.a}^{${e.n - k}}\\cdot ${e.b < 0 ? `(${e.b})` : e.b}^{${k}}`), t(" ; calcule chaque facteur, en surveillant le signe.")] };
}

/** `6gen107` sur le socle d'écrans partagé : trois écrans à champs (trois tentatives). */
export const DEFINITION_TI: DefinitionEcrans<E, P> = {
  phases,
  estChoix: () => false,
  mode: (e, p) => ({ type: "champs", champs: champs(e, p) }),
  libelle,
  consigneGenerale,
  consigne,
  approchee,
  aide1,
  aide2,
  diagnostiquer,
  piege,
  messageIllisible,
  reponseAttendue: reponse,
  recap,
  correction: correctionDetailleeTI,
};
