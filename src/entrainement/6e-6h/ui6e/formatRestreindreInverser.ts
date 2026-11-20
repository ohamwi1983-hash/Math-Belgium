import type { ExTrig, ExTrinome, ExerciceRestreindre } from "../core6e/restreindreInverser";
import { bornesTrig, f, gY0, x0V } from "../core6e/restreindreInverser";
import type { AideEcran, ChampEcran, Frag } from "../../5e-4h/ui5e/ecransTrigo.types";
import { lx, tx } from "../../5e-4h/ui5e/ecransTrigo.types";
import type { Intervalle } from "./nombresCycloLotG";
import { MOINS_INFINI, PLUS_INFINI, bornePi, borneQ, intervalle, intervalleL, piL, q, qVal } from "./nombresCycloLotG";
import { figureCycloSvg, lignesEntieres, lignesPi } from "./figureCycloLotG";

/**
 * Couche C — textes de `6gen159` « Restreindre pour inverser ». Source unique de l'écran, des aides, du
 * récapitulatif, du corrigé et du papier (figure comprise).
 */

type E = ExerciceRestreindre;
export type PhaseRestreindre = "intervalle" | "image" | "valeur" | "expression";

export const phases = (e: E): PhaseRestreindre[] => (e.variante === "trinome" ? ["intervalle", "image", "expression"] : ["intervalle", "valeur", "expression"]);

const NOM = { sinus: "sin", cosinus: "cos", tangente: "tan" } as const;
const ARC = { sinus: "arcsin", cosinus: "arccos", tangente: "arctan" } as const;
const ent = (x: number) => (x < 0 ? `-${-x}` : String(x));

// --- Trinôme --------------------------------------------------------------------------------

/** a x² + b x + c développé : « x^{2}-4x+1 », « -x^{2}+2x+3 ». */
export function trinomeL(e: ExTrinome): string {
  const b = -2 * e.a * e.h;
  const c = e.a * e.h * e.h + e.k;
  let s = e.a === 1 ? "x^{2}" : "-x^{2}";
  if (b !== 0) s += `${b > 0 ? "+" : "-"}${Math.abs(b) === 1 ? "" : Math.abs(b)}x`;
  if (c !== 0) s += `${c > 0 ? "+" : "-"}${Math.abs(c)}`;
  return s;
}
/** Forme canonique : « (x-2)^{2}-3 », « -(x+1)^{2}+4 ». */
export function canoniqueL(e: ExTrinome, v = "x"): string {
  const carre = `(${v}${e.h > 0 ? "-" : "+"}${Math.abs(e.h)})^{2}`;
  const k = e.k === 0 ? "" : `${e.k > 0 ? "+" : "-"}${Math.abs(e.k)}`;
  return `${e.a === 1 ? "" : "-"}${carre}${k}`;
}
/** Radicande de g : « x+3 » (a = 1) ou « 4-x » (a = −1). */
export function radicandeL(e: ExTrinome): string {
  if (e.a === 1) return e.k === 0 ? "x" : `x${e.k > 0 ? "-" : "+"}${Math.abs(e.k)}`;
  return e.k === 0 ? "-x" : `${ent(e.k)}-x`;
}
/** Second membre de (x − h)² = … : « y-3 », « y+2 », « 4-y », « -y ». */
export function secondMembre(e: ExTrinome, v = "y"): string {
  if (e.a === 1) return e.k === 0 ? v : `${v}${e.k > 0 ? "-" : "+"}${Math.abs(e.k)}`;
  return e.k === 0 ? `-${v}` : `${ent(e.k)}-${v}`;
}
export function gTrinomeL(e: ExTrinome): string {
  return `${e.h}${e.s > 0 ? "+" : "-"}\\sqrt{${radicandeL(e)}}`;
}

// --- Trigonométrique ------------------------------------------------------------------------

/** g(x) : « \pi-\arcsin x », « 2\pi+\arccos x », « \arctan x-\pi ». */
export function gTrigL(e: ExTrig): string {
  const arc = `\\${ARC[e.variante]} x`;
  switch (e.variante) {
    case "sinus": {
      const c = piL(q(e.j + 1));
      return (e.j + 1) % 2 === 0 ? `${c}+${arc}` : `${c}-${arc}`;
    }
    case "cosinus":
      if (e.j === -1) return `-${arc}`;
      return Math.abs(e.j) % 2 === 0 ? `${piL(q(e.j))}+${arc}` : `${piL(q(e.j + 1))}-${arc}`;
    case "tangente":
      return `${arc}${e.j > 0 ? "+" : "-"}${piL(q(Math.abs(e.j)))}`;
  }
}

export const gL = (e: E): string => (e.variante === "trinome" ? gTrinomeL(e) : gTrigL(e));

export function restriction(e: E): Intervalle[] {
  if (e.variante === "trinome") {
    const h = borneQ(q(e.h));
    return [e.s > 0 ? intervalle(h, PLUS_INFINI, true, false) : intervalle(MOINS_INFINI, h, false, true)];
  }
  const [a, b] = bornesTrig(e);
  const ouvert = e.variante === "tangente";
  return [intervalle(bornePi(a), bornePi(b), !ouvert, !ouvert)];
}

export function imageTrinome(e: ExTrinome): Intervalle[] {
  const k = borneQ(q(e.k));
  return [e.a > 0 ? intervalle(k, PLUS_INFINI, true, false) : intervalle(MOINS_INFINI, k, false, true)];
}

export const fL = (e: E): string => (e.variante === "trinome" ? `f(x)=${trinomeL(e)}` : `f(x)=\\${NOM[e.variante]} x`);
export const x0L = (e: E): string => (e.variante === "trinome" ? ent(e.x0) : piL(e.x0));

// --- Figure ---------------------------------------------------------------------------------

export function figure(e: E, mode: "ecran" | "papier" | "corrige"): string {
  const p = mode === "ecran" ? 12 : 11;
  if (e.variante === "trinome") {
    const xMin = e.h - 3;
    const xMax = e.h + 3;
    const yMin = e.a > 0 ? e.k - 1 : e.k - 9;
    const yMax = e.a > 0 ? e.k + 9 : e.k + 1;
    return figureCycloSvg({
      x: { min: xMin, max: xMax, lignes: lignesEntieres(xMin, xMax) },
      y: { min: yMin, max: yMax, lignes: lignesEntieres(yMin, yMax, 2) },
      courbes: [{ f: (x) => f(e, x), de: xMin, a: xMax }],
      points: [{ x: e.x0, y: f(e, e.x0), plein: true, label: "x₀" }],
      echelle: 26,
      police: p,
    });
  }
  const [a] = bornesTrig(e);
  const A = qVal(a) * Math.PI;
  const xMin = A - Math.PI;
  const xMax = A + 2 * Math.PI;
  const tan = e.variante === "tangente";
  const yMin = tan ? -3 : -1.5;
  const yMax = tan ? 3 : 1.5;
  const asymptotes: number[] = [];
  if (tan) for (let k = -6; k <= 6; k++) {
    const x = Math.PI / 2 + k * Math.PI;
    if (x > xMin + 1e-9 && x < xMax - 1e-9) asymptotes.push(x);
  }
  const courbes = tan
    ? [xMin, ...asymptotes, xMax].slice(0, -1).map((de, i, arr) => ({ f: (x: number) => Math.tan(x), de: de + 0.02, a: (i + 1 < arr.length ? arr[i + 1] : xMax) - 0.02 }))
    : [{ f: (x: number) => f(e, x), de: xMin, a: xMax }];
  return figureCycloSvg({
    x: { min: xMin, max: xMax, lignes: lignesPi(xMin, xMax, 2) },
    y: { min: yMin, max: yMax, lignes: lignesEntieres(Math.ceil(yMin), Math.floor(yMax)).filter((l) => l.v >= yMin && l.v <= yMax) },
    courbes,
    asymptotesX: asymptotes,
    points: [{ x: x0V(e), y: f(e, x0V(e)), plein: true, label: "x₀" }],
    echelle: tan ? 30 : 34,
    police: p,
  });
}

// --- Textes ---------------------------------------------------------------------------------

export function consigneGenerale(e: E): Frag[] {
  const nonInj: Frag[] = e.variante === "trinome" ? [tx(" n'est pas injective sur "), lx("\\mathbb{R}"), tx(".")] : [tx(" n'est pas injective sur son domaine.")];
  return [
    tx("La fonction "),
    lx(fL(e)),
    ...nonInj,
    tx(" On la restreint au plus grand intervalle contenant "),
    lx(`x_0=${x0L(e)}`),
    tx(" sur lequel elle est strictement monotone ; on note "),
    lx("g"),
    tx(" la réciproque de cette restriction."),
  ];
}

export function libelle(_e: E, phase: PhaseRestreindre): string {
  return { intervalle: "Restriction", image: "Domaine de g", valeur: "Une valeur de g", expression: "Expression de g" }[phase];
}

export function consigne(e: E, phase: PhaseRestreindre): Frag[] {
  switch (phase) {
    case "intervalle":
      return [tx("Quel est cet intervalle ?")];
    case "image":
      return [tx("Quelle est l'image de "), lx("f"), tx(" sur cet intervalle, c'est-à-dire le domaine de "), lx("g"), tx(" ?")];
    case "valeur": {
      const t = e as ExTrig;
      return [tx("Calcule "), lx(`g\\left(${t.y0.l}\\right)`), tx(` : l'angle de l'intervalle dont le ${t.variante === "sinus" ? "sinus" : t.variante === "cosinus" ? "cosinus" : "la tangente"} vaut `), lx(t.y0.l), tx(" (valeur exacte).")];
    }
    case "expression":
      return e.variante === "trinome" ? [tx("Exprime "), lx("g(x)"), tx(".")] : [tx("Exprime "), lx("g(x)"), tx(` à l'aide de ${ARC[e.variante]}.`)];
  }
}

export function champs(e: E, phase: PhaseRestreindre): ChampEcran[] {
  if (phase === "valeur") return [{ label: "g(y₀)", labelLatex: `g\\left(${(e as ExTrig).y0.l}\\right)=`, placeholder: "ex. : 5π/6" }];
  return [{ label: "g(x)", labelLatex: "g(x)=", placeholder: e.variante === "trinome" ? "ex. : 2-√(x+3)" : `ex. : π-${ARC[(e as ExTrig).variante]}(x)`, apercu: true }];
}

export function aide1(e: E, phase: PhaseRestreindre): AideEcran {
  switch (phase) {
    case "intervalle":
      return e.variante === "trinome"
        ? { texte: [tx("Une parabole change de sens de variation à son sommet : la plus grande restriction monotone va du sommet à l'infini, du côté de "), lx("x_0"), tx(". Mets f sous forme canonique pour lire le sommet.")] }
        : e.variante === "tangente"
          ? { texte: [tx("tan est strictement croissante sur chaque intervalle entre deux asymptotes consécutives "), lx("x=\\dfrac{\\pi}{2}+k\\pi"), tx(" (bornes exclues).")] }
          : { texte: [tx(`${NOM[e.variante]} change de sens de variation à chacun de ses extremums (là où elle vaut 1 ou −1) : la restriction va d'un extremum au suivant, bornes comprises.`)] };
    case "image":
      return { texte: [tx("Le sommet donne la valeur extrême de f sur la restriction ; de l'autre côté, f tend vers l'infini.")] };
    case "valeur": {
      const t = e as ExTrig;
      return { texte: [tx(`La calculatrice (${ARC[t.variante]}) donne l'angle de la restriction principale du cours ; cherche l'angle de même ${t.variante === "tangente" ? "tangente" : t.variante === "sinus" ? "sinus" : "cosinus"} situé dans l'intervalle de l'énoncé :`)], latex: t.variante === "sinus" ? "\\sin(\\pi-a)=\\sin a\\qquad\\sin(a+2\\pi)=\\sin a" : t.variante === "cosinus" ? "\\cos(-a)=\\cos a\\qquad\\cos(a+2\\pi)=\\cos a" : "\\tan(a+\\pi)=\\tan a" };
    }
    case "expression":
      return e.variante === "trinome"
        ? { texte: [tx("Pose "), lx("y=f(x)"), tx(" sous forme canonique et isole "), lx("x"), tx(" ; le signe devant la racine est imposé par la restriction (x à droite ou à gauche du sommet). Échange ensuite les noms des variables.")] }
        : { texte: [tx("Généralise le calcul de la question précédente : pour "), lx("x"), tx(" dans le domaine de g, "), lx(`\\${ARC[e.variante]} x`), tx(" est l'angle principal, et g(x) l'angle de même "), tx(e.variante === "tangente" ? "tangente" : e.variante === "sinus" ? "sinus" : "cosinus"), tx(" dans l'intervalle.")] };
  }
}

export function aide2(e: E, phase: PhaseRestreindre): AideEcran | null {
  switch (phase) {
    case "intervalle":
      if (e.variante === "trinome") return { texte: [tx("Ici :")], latex: `f(x)=${canoniqueL(e)}` };
      if (e.variante === "tangente") {
        return { texte: [tx("Ici, cherche les deux asymptotes consécutives "), lx("x=\\dfrac{\\pi}{2}+k\\pi"), tx(" qui encadrent "), lx(`x_0=${x0L(e)}`), tx(".")] };
      }
      return { texte: [tx(`Ici, repère les deux extremums de ${NOM[e.variante]} qui encadrent `), lx(`x_0=${x0L(e)}`), tx(" (multiples de "), lx(e.variante === "sinus" ? "\\dfrac{\\pi}{2}" : "\\pi"), tx(").")] };
    case "image":
      return { texte: [tx("Ici, le sommet est "), lx(`(${ent((e as ExTrinome).h)}\\,;\\,${ent((e as ExTrinome).k)})`), tx(` et la parabole est tournée vers le ${(e as ExTrinome).a > 0 ? "haut" : "bas"}.`)] };
    case "valeur": {
      const t = e as ExTrig;
      return { texte: [tx("Ici, l'angle principal est :")], latex: `\\${ARC[t.variante]}\\left(${t.y0.l}\\right)=${piL(t.y0.principale)}` };
    }
    case "expression":
      if (e.variante === "trinome") return { texte: [tx("Ici :")], latex: `y=${canoniqueL(e)}\\iff (x${e.h > 0 ? "-" : "+"}${Math.abs(e.h)})^{2}=${secondMembre(e)}` };
      return { texte: [tx("Ici, vérifie ta formule avec la valeur trouvée : elle doit donner "), lx(`g\\left(${(e as ExTrig).y0.l}\\right)=${piL(gY0(e as ExTrig))}`), tx(" et un résultat dans l'intervalle pour tout x.")] };
  }
}

export function messageIllisible(_e: E, phase: PhaseRestreindre): string {
  if (phase === "intervalle" || phase === "image") return "Borne non reconnue : écris par exemple 2, π/2, 3π/2, +∞ ou -∞. Cette saisie ne compte pas comme une tentative.";
  if (phase === "valeur") return "Valeur non reconnue : écris une valeur exacte, par exemple 5π/6. Cette saisie ne compte pas comme une tentative.";
  return "Expression non reconnue : écris par exemple π-arcsin(x), 2π+arccos(x), arctan(x)+π ou 2-√(x+3). Cette saisie ne compte pas comme une tentative.";
}

export function reponse(e: E, phase: PhaseRestreindre): Frag[] {
  switch (phase) {
    case "intervalle":
      return [lx(`I=${intervalleL(restriction(e)[0])}`)];
    case "image":
      return [lx(`\\mathrm{dom}\\,g=${intervalleL(imageTrinome(e as ExTrinome)[0])}`)];
    case "valeur": {
      const t = e as ExTrig;
      return [lx(`g\\left(${t.y0.l}\\right)=${piL(gY0(t))}`)];
    }
    case "expression":
      return [lx(`g(x)=${gL(e)}`)];
  }
}

export const recap = reponse;
