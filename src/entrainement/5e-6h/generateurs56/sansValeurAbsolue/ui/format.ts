import { lx, tx } from "../../../../5e-4h/ui5e/ecransTrigo.types";
import type { AideEcran, Frag, ModeEcran } from "../../../../5e-4h/ui5e/ecransTrigo.types";
import { q, qL } from "../../communReels/outilsReels";
import type { Q } from "../../communReels/outilsReels";
import { PHASES_SANS_ABS } from "../core/types";
import type { ExerciceSansAbs, PhaseSansAbs, TermeAbs } from "../core/types";

/**
 * Couche C — textes de `56gen19` « Écrire sans valeur absolue » : écriture de f, des intervalles (convention
 * du cours x < z₁, z₁ ≤ x < z₂, x ≥ z₂), consignes, aides à deux niveaux (méthode, puis posée pour
 * l'intervalle avec une valeur test ; jamais l'expression), réponses. Source unique écran / corrigé / papier.
 */

type E = ExerciceSansAbs;
type P = PhaseSansAbs;

export const phases = (_e: E): P[] => PHASES_SANS_ABS;

/** « 3x+1 », « -x-2 », « 2x », « 5 », « 0 ». */
export function affineL(a: number, b: number): string {
  if (a === 0) return `${b}`;
  const ax = a === 1 ? "x" : a === -1 ? "-x" : `${a}x`;
  return b === 0 ? ax : `${ax}${b > 0 ? "+" : "-"}${Math.abs(b)}`;
}
export const interieurL = (t: TermeAbs): string => affineL(t.a, t.b);
export const absL = (t: TermeAbs): string => `\\left|${interieurL(t)}\\right|`;

function termeL(t: TermeAbs, premier: boolean): string {
  const coef = t.alpha === 1 ? (premier ? "" : "+") : t.alpha === -1 ? "-" : `${premier || t.alpha < 0 ? "" : "+"}${t.alpha}`;
  return `${coef}${absL(t)}`;
}

export const expressionFL = (e: E): string => `${termeL(e.termes[0], true)}${termeL(e.termes[1], false)}${e.k === 0 ? "" : e.k > 0 ? `+${e.k}` : `${e.k}`}`;
export const fL = (e: E): string => `f(x)=${expressionFL(e)}`;

export const indiceMorceau = (p: P): number => ({ gauche: 0, milieu: 1, droite: 2, zeros: -1 })[p];

/** Condition de l'intervalle : « x<-\tfrac{3}{2} », « -\tfrac{3}{2}\leq x<1 », « x\geq 1 ». */
export function intervalleL(e: E, i: number): string {
  if (i === 0) return `x<${qL(e.z1)}`;
  if (i === 1) return `${qL(e.z1)}\\leq x<${qL(e.z2)}`;
  return `x\\geq ${qL(e.z2)}`;
}

export const morceauL = (e: E, i: number): string => affineL(e.morceaux[i][0], e.morceaux[i][1]);

export function consigneGenerale(e: E): Frag[] {
  return [tx("Écris "), lx(fL(e)), tx(" sans valeur absolue, par morceaux.")];
}

export function libelle(_e: E, p: P): string {
  return { zeros: "Zéros", gauche: "Premier intervalle", milieu: "Deuxième intervalle", droite: "Troisième intervalle" }[p];
}

export function consigne(e: E, p: P): Frag[] {
  if (p === "zeros") return [tx("Cherche le zéro de chaque expression écrite entre des barres, puis range-les dans l'ordre croissant.")];
  const i = indiceMorceau(p);
  return [tx("Écris "), lx("f(x)"), tx(" sans valeur absolue et réduis-la pour "), lx(intervalleL(e, i)), tx(".")];
}

export function mode(_e: E, p: P): ModeEcran {
  if (p === "zeros")
    return {
      type: "champs",
      champs: [
        { label: "Plus petit zéro", labelLatex: "z_1=", placeholder: "ex. : −3/2" },
        { label: "Plus grand zéro", labelLatex: "z_2=", placeholder: "ex. : 1" },
      ],
    };
  return { type: "champs", champs: [{ label: "Expression de f(x) sur cet intervalle", labelLatex: `f(x)=`, placeholder: "ex. : −3x − 2", apercu: true }] };
}

/** Valeur test entière (ou demi-entière) dans l'intervalle i. */
export function valeurTest(e: E, i: number): Q {
  const z1 = e.z1.n / e.z1.d;
  const z2 = e.z2.n / e.z2.d;
  if (i === 0) return { n: Math.floor(z1) - 1, d: 1 };
  if (i === 2) return { n: Math.ceil(z2) + 1, d: 1 };
  const m = Math.floor(z1) + 1;
  if (m < z2) return { n: m, d: 1 };
  return q(e.z1.n * e.z2.d + e.z2.n * e.z1.d, 2 * e.z1.d * e.z2.d);
}

export function aide1(_e: E, p: P): AideEcran {
  if (p === "zeros") return { texte: [tx("Une valeur absolue change d'écriture là où ce qui est entre les barres s'annule : cherche le zéro de chaque expression, puis range ces zéros sur la droite (cours, point 4).")] };
  return { texte: [tx("Sur l'intervalle, remplace chaque valeur absolue : par l'expression elle-même si elle est positive ou nulle, par son opposé si elle est négative ; puis réduis (cours, point 4) :")], latex: "|A|=A\\ \\text{si}\\ A\\geq 0\\qquad |A|=-A\\ \\text{si}\\ A<0" };
}

export function aide2(e: E, p: P): AideEcran {
  const [t1, t2] = e.termes;
  if (p === "zeros") return { texte: [tx("Ici, résous "), lx(`${interieurL(t1)}=0`), tx(" et "), lx(`${interieurL(t2)}=0`), tx(".")] };
  const i = indiceMorceau(p);
  const v = valeurTest(e, i);
  return { texte: [tx("Ici, prends une valeur de l'intervalle, par exemple "), lx(`x=${qL(v)}`), tx(" : quel est le signe de "), lx(interieurL(t1)), tx(" et celui de "), lx(interieurL(t2)), tx(" ?")] };
}

export function messageIllisible(_e: E, p: P): string {
  if (p === "zeros") return "Écris deux nombres (par exemple −3/2 et 1). Cette saisie ne compte pas comme une tentative.";
  return "Écris une expression en x, par exemple −3x − 2. Cette saisie ne compte pas comme une tentative.";
}

export function reponse(e: E, p: P): Frag[] {
  if (p === "zeros") return [lx(`z_1=${qL(e.z1)}`), tx(" et "), lx(`z_2=${qL(e.z2)}`)];
  const i = indiceMorceau(p);
  return [tx("Pour "), lx(intervalleL(e, i)), tx(" : "), lx(`f(x)=${morceauL(e, i)}`)];
}

export const recap = reponse;

/** f par morceaux (KaTeX `cases`). */
export function casesL(e: E): string {
  return `f(x)=\\begin{cases}${[0, 1, 2].map((i) => `${morceauL(e, i)} & \\text{si } ${intervalleL(e, i)}`).join("\\\\")}\\end{cases}`;
}
