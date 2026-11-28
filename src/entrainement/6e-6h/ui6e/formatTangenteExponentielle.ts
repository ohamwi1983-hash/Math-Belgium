import type { ExerciceTangenteExpo, IdSigne } from "../core6e/tangenteExponentielle";
import { aVal, coefPente, image, imageExacte, ordonneeOrigine, pente, signeAttendu } from "../core6e/tangenteExponentielle";
import type { AideEcran, ChampEcran, Frag, OptionEcran } from "../../5e-4h/ui5e/ecransTrigo.types";
import { lx, tx } from "../../5e-4h/ui5e/ecransTrigo.types";
import type { Rat } from "./nombresExpoLotG";
import { nbL, nbT, ratL } from "./nombresExpoLotG";

/**
 * Couche C — textes de `6gen149` « Tangente à une exponentielle et nombre ln a ». Source unique de
 * l'écran, des aides, du récapitulatif, du corrigé et du papier.
 */

type E = ExerciceTangenteExpo;
export type PhaseTangenteExpo = "signe" | "image" | "pente" | "tangente";

export function phases(e: E): PhaseTangenteExpo[] {
  return e.variante === "en-zero" ? ["signe", "pente", "tangente"] : ["image", "pente", "tangente"];
}

const n = (v: number) => (v < 0 ? `-${-v}` : String(v));
const nT = (v: number) => nbT(v, 0);

/** Base en LaTeX : entier, décimal (`en-zero` : 0,5, 1,5, 0,2…) ou fraction. */
export function aL(e: E): string {
  const b = e.base!;
  if (b.den === 1) return String(b.num);
  if (e.variante === "en-zero" && [2, 5, 10].includes(b.den)) return nbL(b.num / b.den, 1);
  return ratL(b);
}
const baseEntiere = (e: E) => e.base !== null && e.base.den === 1;
/** Puissance de la base : « 3^{x} », « (0{,}5)^{x} », « \left(\dfrac{1}{3}\right)^{2} ». */
export function puissanceL(e: E, exp: string): string {
  if (baseEntiere(e)) return `${aL(e)}^{${exp}}`;
  return aL(e).includes("frac") ? `\\left(${aL(e)}\\right)^{${exp}}` : `(${aL(e)})^{${exp}}`;
}
/** « \ln 3 », « \ln(0{,}5) », « \ln\left(\dfrac{1}{3}\right) ». */
export function lnL(e: E): string {
  if (baseEntiere(e)) return `\\ln(${aL(e)})`;
  return aL(e).includes("frac") ? `\\ln\\left(${aL(e)}\\right)` : `\\ln(${aL(e)})`;
}
/** Coefficient devant un facteur : 1 → «  », −1 → « - », 3 → « 3 », 3/4 → « \dfrac{3}{4} ». */
function coefDevant(r: Rat): string {
  if (r.num === r.den) return "";
  if (r.num === -r.den) return "-";
  return ratL(r);
}
const expoE = (m: number, v = "x") => (m === 1 ? v : m === -1 ? `-${v}` : `${m}${v}`);
const eL = (p: number) => (p === 1 ? "e" : `e^{${p}}`);

export function expressionL(e: E): string {
  if (!e.base) return `${coefDevant({ num: e.k, den: 1 })}e^{${expoE(e.m)}}`;
  if (e.k === 1) return puissanceL(e, "x");
  return `${e.k === -1 ? "-" : `${e.k}\\cdot `}${puissanceL(e, "x")}`;
}
export const fonctionL = (e: E) => `f(x)=${expressionL(e)}`;

/** f(x₀) exact : « 18 », « \dfrac{3}{4} », « 2e^{2} », « -e^{-1} ». */
export function imageL(e: E): string {
  if (e.base) return ratL(imageExacte(e));
  return `${coefDevant({ num: e.k, den: 1 })}${eL(e.m * e.x0)}`;
}
/** f′(x₀) exact : « \ln 3 », « 18\ln 3 », « -\dfrac{3}{4}\ln 2 », « 6e^{2} ». */
export function penteL(e: E): string {
  if (e.base) return `${coefDevant(coefPente(e))}${lnL(e)}`;
  return `${coefDevant(coefPente(e))}${eL(e.m * e.x0)}`;
}
const approx = (v: number) => nbL(v, 2, true);

/** Tangente, forme du cours : « y = f′(x₀)(x − x₀) + f(x₀) » substituée. */
export function tangenteL(e: E): string {
  if (e.variante === "en-zero") return `y=${lnL(e)}\\,x+1`;
  const facteur = e.x0 > 0 ? `(x-${e.x0})` : `(x+${-e.x0})`;
  const im = imageL(e);
  const p = penteL(e);
  const pAvant = p === "" ? "" : p === "-" ? "-" : /[+-]/.test(p.slice(1)) ? `\\left(${p}\\right)` : `${p}\\,`;
  return `y=${pAvant}${facteur}${im.startsWith("-") ? im : `+${im}`}`;
}
/** Tangente développée, coefficients arrondis au centième. */
export function tangenteApproxL(e: E): string {
  const p = ordonneeOrigine(e);
  const r = Math.round(p * 100) / 100;
  return `y\\approx ${approx(pente(e))}x${r === 0 ? "" : r > 0 ? `+${approx(p)}` : `-${approx(-p)}`}`;
}

// ---------------------------------------------------------------------------
// Écrans.
// ---------------------------------------------------------------------------

export function consigneGenerale(e: E): Frag[] {
  if (e.variante === "en-zero") return [tx("Soit "), lx(fonctionL(e)), tx(". On étudie la tangente à sa courbe au point "), lx("(0\\,;1)"), tx(".")];
  return [tx("Soit "), lx(fonctionL(e)), tx(". On cherche la tangente à sa courbe au point d'abscisse "), lx(`x_0=${n(e.x0)}`), tx(".")];
}

export function libelle(_e: E, phase: PhaseTangenteExpo): string {
  return { signe: "Signe de la pente", image: "Image f(x₀)", pente: "Pente", tangente: "Équation de la tangente" }[phase];
}

const PRECISION: Frag = tx(" (valeur exacte, ou arrondie au centième).");

export function consigne(e: E, phase: PhaseTangenteExpo): Frag[] {
  switch (phase) {
    case "signe":
      return [tx("Sans calculatrice : la tangente à la courbe en "), lx("(0\\,;1)"), tx(" a-t-elle une pente positive, négative ou nulle ?")];
    case "image":
      return [tx("Calcule "), lx(`f(${n(e.x0)})`), tx(e.base ? " (valeur exacte)." : " (valeur exacte, ou arrondie au centième).")];
    case "pente":
      return e.variante === "en-zero" ? [tx("Donne la pente "), lx("f'(0)"), tx(" de cette tangente"), PRECISION] : [tx("Calcule la pente "), lx(`f'(${n(e.x0)})`), tx(" de la tangente"), PRECISION];
    case "tangente":
      return [tx("Écris l'équation de la tangente"), PRECISION];
  }
}

const LIBELLES_SIGNE: Record<IdSigne, Frag[]> = {
  positive: [tx("Positive : la tangente monte")],
  negative: [tx("Négative : la tangente descend")],
  nulle: [tx("Nulle : la tangente est horizontale")],
};

export function options(e: E): OptionEcran[] {
  return e.ordreSigne.map((id) => ({ id, fragments: LIBELLES_SIGNE[id] }));
}

export function champs(e: E, phase: PhaseTangenteExpo): ChampEcran[] {
  switch (phase) {
    case "image":
      return [{ label: "image", labelLatex: `f(${n(e.x0)}) =`, placeholder: "ex. : 7/4" }];
    case "pente":
      return [{ label: "pente", labelLatex: `f'(${n(e.x0)}) =`, placeholder: "ex. : 7ln(6) ou 12,54", apercu: true }];
    default:
      return [{ label: "tangente", labelLatex: "\\text{Tangente :}", placeholder: "ex. : y = 7ln(6)·x − 4", apercu: true }];
  }
}

export function aide1(e: E, phase: PhaseTangenteExpo): AideEcran {
  switch (phase) {
    case "signe":
      return { texte: [tx("La pente de la tangente en "), lx("(0\\,;1)"), tx(" à la courbe de "), lx("a^{x}"), tx(" est le nombre "), lx("\\ln a"), tx(" (cours, point 2). Il a le signe du sens de variation de "), lx("a^{x}"), tx(" :")], latex: "a>1\\Rightarrow \\ln a>0\\qquad 0<a<1\\Rightarrow \\ln a<0" };
    case "image":
      return e.base ? { texte: [tx("Remplace "), lx("x"), tx(" par "), lx("x_0"), tx(" :")], latex: `f(x_0)=k\\cdot a^{x_0}` } : { texte: [tx("Remplace "), lx("x"), tx(" par "), lx("x_0"), tx(" :")], latex: `f(x_0)=k\\cdot e^{m x_0}` };
    case "pente":
      if (e.variante === "en-zero") return { texte: [tx("Dérivée d'une exponentielle (cours, point 2) :")], latex: "(a^{x})'=\\ln a\\cdot a^{x}" };
      if (e.base) return { texte: [tx("Dérivée d'une exponentielle (cours, point 2), multipliée par la constante "), lx("k"), tx(" :")], latex: "(a^{x})'=\\ln a\\cdot a^{x}\\qquad (k\\cdot a^{x})'=k\\cdot\\ln a\\cdot a^{x}" };
      return { texte: [tx("Base "), lx("e"), tx(" : "), lx("\\ln e=1"), tx(", et la règle de la chaîne (cours, point 2) :")], latex: "(e^{u})'=u'\\cdot e^{u}" };
    case "tangente":
      return { texte: [tx("Équation de la tangente au point d'abscisse "), lx("x_0"), tx(" :")], latex: "y=f'(x_0)\\,(x-x_0)+f(x_0)" };
  }
}

export function aide2(e: E, phase: PhaseTangenteExpo): AideEcran {
  switch (phase) {
    case "signe":
      return { texte: [tx("Ici, compare la base "), lx(`a=${aL(e)}`), tx(" à 1.")] };
    case "image":
      return e.base ? { texte: [tx("Ici :")], latex: `f(${n(e.x0)})=${e.k === 1 ? "" : `${n(e.k)}\\cdot `}${puissanceL(e, n(e.x0))}` } : { texte: [tx("Ici, l'exposant vaut "), lx(`${e.m === 1 ? "" : `${n(e.m)}\\cdot `}${e.x0 < 0 ? `(${e.x0})` : e.x0}`), tx(" ; calcule-le avant d'écrire la puissance de "), lx("e"), tx(".")] };
    case "pente":
      if (e.variante === "en-zero") return { texte: [tx("Ici, remplace "), lx("x"), tx(" par 0 : "), lx("a^{0}=1"), tx(". Attention, la pente n'est ni "), lx("a"), tx(" ni 1. Touche ln de la calculatrice si tu veux une valeur approchée.")] };
      if (e.base) return { texte: [tx("Ici :")], latex: `f'(${n(e.x0)})=${n(e.k)}\\cdot ${lnL(e)}\\cdot ${puissanceL(e, n(e.x0))}` };
      return { texte: [tx("Ici, "), lx(`u=${expoE(e.m)}`), tx(", donc "), lx(`u'=${e.m}`), tx(" ; remplace ensuite "), lx("x"), tx(" par "), lx(n(e.x0)), tx(".")] };
    case "tangente":
      if (e.variante === "en-zero") return { texte: [tx("Ici, "), lx("x_0=0"), tx(" et "), lx("f(0)=a^{0}=1"), tx(" :")], latex: "y=f'(0)\\,(x-0)+1" };
      return { texte: [tx(`Ici, remplace f(${nT(e.x0)}) et f′(${nT(e.x0)}) par les valeurs trouvées aux écrans précédents ; attention au signe de `), lx(`x-x_0=x${e.x0 > 0 ? "-" : "+"}${Math.abs(e.x0)}`), tx(".")] };
  }
}

export function messageIllisible(_e: E, phase: PhaseTangenteExpo): string {
  if (phase === "tangente") return "Équation non reconnue : écris par exemple y = 7ln(6)·(x − 2) + 3 ou y = 12,54x − 4,1. Cette saisie ne compte pas comme une tentative.";
  return "Nombre non reconnu : écris par exemple 7/4, 7ln(6), 2e^3 ou 12,54 (virgule ou point). Cette saisie ne compte pas comme une tentative.";
}

export function reponse(e: E, phase: PhaseTangenteExpo): Frag[] {
  switch (phase) {
    case "signe":
      return signeAttendu(e) === "positive" ? [lx(`${lnL(e)}>0`), tx(" : la pente est positive, la tangente monte")] : [lx(`${lnL(e)}<0`), tx(" : la pente est négative, la tangente descend")];
    case "image": {
      const ex = imageL(e);
      return e.base ? [lx(`f(${n(e.x0)})=${ex}`)] : [lx(`f(${n(e.x0)})=${ex}\\approx ${approx(image(e))}`)];
    }
    case "pente":
      return [lx(`f'(${n(e.x0)})=${penteL(e)}\\approx ${approx(pente(e))}`)];
    case "tangente":
      return [lx(tangenteL(e)), tx(", soit "), lx(tangenteApproxL(e))];
  }
}

export function recap(e: E, phase: PhaseTangenteExpo): Frag[] {
  if (phase === "signe") return [tx(signeAttendu(e) === "positive" ? "positive" : "négative")];
  return reponse(e, phase);
}

export function explicationChoix(e: E): string {
  return aVal(e) > 1 ? `La base ${nbT(aVal(e), 2)} est supérieure à 1 : aˣ croît, ln a > 0.` : `La base est comprise entre 0 et 1 : aˣ décroît, ln a < 0.`;
}
