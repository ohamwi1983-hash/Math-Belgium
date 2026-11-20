import type { Q } from "../../5e-4h/ui5e/nombresTrigo";
import { nbL, nbT, piL, piT, q, qL, qT, qVal } from "../../5e-4h/ui5e/nombresTrigo";

export type { Q };
export { nbL, nbT, piL, piT, q, qL, qT, qVal };

/**
 * Écriture des nombres des générateurs 6gen156–6gen159 (6e ch. 1, lot G de l'audit) : virgule
 * `{,}`, « − » typographique en texte, angles en degrés (`^{\circ}`), multiples rationnels de π,
 * bornes d'intervalles (±∞ toujours ouvertes). Une seule source pour l'écran, les aides, le papier et
 * le corrigé.
 */

const DEG = Math.PI / 180;
export const enRadians = (deg: number): number => deg * DEG;
export const enDegres = (rad: number): number => rad / DEG;

/** Angle en degrés (LaTeX) : « 40^{\circ} », « 28{,}9^{\circ} ». */
export function degL(x: number, dec = 1, fixe = false): string {
  return `${nbL(x, dec, fixe)}^{\\circ}`;
}

/** Angle en degrés (texte) : « 40° », « 28,9° ». */
export function degT(x: number, dec = 1, fixe = false): string {
  return `${nbT(x, dec, fixe)}°`;
}

/** Une borne d'intervalle : valeur numérique, écriture LaTeX et texte. ±∞ : `valeur` infinie. */
export interface Borne {
  valeur: number;
  latex: string;
  texte: string;
}

export const MOINS_INFINI: Borne = { valeur: -Infinity, latex: "-\\infty", texte: "−∞" };
export const PLUS_INFINI: Borne = { valeur: Infinity, latex: "+\\infty", texte: "+∞" };

export function borneQ(a: Q): Borne {
  return { valeur: qVal(a), latex: qL(a), texte: qT(a) };
}

export function bornePi(a: Q): Borne {
  return { valeur: qVal(a) * Math.PI, latex: piL(a), texte: piT(a) };
}

/** Intervalle réel : bornes et crochets (fermé = crochet tourné vers l'intérieur). */
export interface Intervalle {
  g: Borne;
  d: Borne;
  gFerme: boolean;
  dFerme: boolean;
}

export function intervalle(g: Borne, d: Borne, gFerme: boolean, dFerme: boolean): Intervalle {
  return { g, d, gFerme: gFerme && Number.isFinite(g.valeur), dFerme: dFerme && Number.isFinite(d.valeur) };
}

/** Écriture d'un intervalle comme le cours : « [-1\,;\,1] », « ]-\infty\,;\,0[ ». */
export function intervalleL(I: Intervalle): string {
  return `${I.gFerme ? "[" : "]"}${I.g.latex}\\,;\\,${I.d.latex}${I.dFerme ? "]" : "["}`;
}

export function intervalleT(I: Intervalle): string {
  return `${I.gFerme ? "[" : "]"}${I.g.texte} ; ${I.d.texte}${I.dFerme ? "]" : "["}`;
}

/** Ensemble (réunion d'intervalles) : ℝ et ℝ₀ écrits comme le cours quand c'est le cas. */
export function ensembleL(Is: Intervalle[], options: { symboles?: boolean } = {}): string {
  const { symboles = true } = options;
  if (symboles && Is.length === 1 && !Number.isFinite(Is[0].g.valeur) && !Number.isFinite(Is[0].d.valeur)) return "\\mathbb{R}";
  if (symboles && Is.length === 2 && Is[0].g.valeur === -Infinity && Is[1].d.valeur === Infinity && Is[0].d.valeur === 0 && Is[1].g.valeur === 0 && !Is[0].dFerme && !Is[1].gFerme) return "\\mathbb{R}_0";
  return Is.map(intervalleL).join("\\cup ");
}

/** Coefficient devant une expression : « 2\arctan x », « -\arctan x », « \arctan x », « \dfrac{1}{2}x ». */
export function coefDevantL(k: Q, corps: string): string {
  if (k.n === k.d) return corps;
  if (k.n === -k.d) return `-${corps}`;
  return `${qL(k)}${corps}`;
}
