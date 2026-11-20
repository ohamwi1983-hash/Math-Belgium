import type { ExerciceLireTransformee } from "../core6e/lireTransformeeArc";
import { demiLargeur, f, kV } from "../core6e/lireTransformeeArc";
import type { AideEcran, ChampEcran, Frag } from "../../5e-4h/ui5e/ecransTrigo.types";
import { lx, tx } from "../../5e-4h/ui5e/ecransTrigo.types";
import type { Intervalle, Q } from "./nombresCycloLotG";
import { MOINS_INFINI, PLUS_INFINI, bornePi, borneQ, intervalle, intervalleL, piL, q, qL, qVal } from "./nombresCycloLotG";
import { figureCycloSvg, lignesEntieres, lignesPi, piTexte } from "./figureCycloLotG";

/**
 * Couche C — textes de `6gen158` « Lire une transformée c + k·arc(mx + n) ». Source unique de l'écran,
 * des aides, du récapitulatif, du corrigé et du papier (figure comprise).
 */

type E = ExerciceLireTransformee;
export type PhaseLireTransformee = "domaine" | "image" | "mn" | "kc";

/** arctan : k et c (asymptotes) AVANT m et n (le point marqué se lit avec k et c connus). */
export const phases = (e: E): PhaseLireTransformee[] => (e.variante === "arctan" ? ["domaine", "image", "kc", "mn"] : ["domaine", "image", "mn", "kc"]);

export const nQ = (e: E): Q => q(-e.m.n * e.x0, e.m.d);
export const alpha = (e: E): number => e.x0 - demiLargeur(e);
export const beta = (e: E): number => e.x0 + demiLargeur(e);
/** Point marqué à droite du centre (arctan) : x₁ = x₀ + 1/m, f(x₁) = c + kπ/4. */
export const x1 = (e: E): number => e.x0 + demiLargeur(e);
const ent = (x: number) => (x < 0 ? `-${-x}` : String(x));
const par = (x: number) => (x < 0 ? `(${x})` : String(x));

/** Bornes de l'image en multiples de π (Q). */
export function imageQ(e: E): [Q, Q] {
  const c = e.cPi;
  const k = e.k;
  const demiK = q(Math.abs(k.n), 2 * k.d);
  if (e.variante === "arccos") {
    const ck = q(c.n * k.d + k.n * c.d, c.d * k.d);
    return qVal(k) > 0 ? [c, ck] : [ck, c];
  }
  return [q(c.n * demiK.d - demiK.n * c.d, c.d * demiK.d), q(c.n * demiK.d + demiK.n * c.d, c.d * demiK.d)];
}

export function domaine(e: E): Intervalle[] {
  if (e.variante === "arctan") return [intervalle(MOINS_INFINI, PLUS_INFINI, false, false)];
  return [intervalle(borneQ(q(alpha(e))), borneQ(q(beta(e))), true, true)];
}

export function image(e: E): Intervalle[] {
  const [lo, hi] = imageQ(e);
  const ouvert = e.variante === "arctan";
  return [intervalle(bornePi(lo), bornePi(hi), !ouvert, !ouvert)];
}

/** Argument mx + n en LaTeX (« x+1 », « \dfrac{x}{2}-\dfrac{3}{2} », « x »). */
export function argumentL(e: E): string {
  const mx = e.m.d === 1 ? (e.m.n === 1 ? "x" : `${e.m.n}x`) : `\\dfrac{${e.m.n === 1 ? "" : e.m.n}x}{${e.m.d}}`;
  const n = nQ(e);
  if (n.n === 0) return mx;
  return `${mx}${n.n > 0 ? "+" : "-"}${qL(q(Math.abs(n.n), n.d))}`;
}

/** f(x) en LaTeX : « \dfrac{\pi}{4}-2\arcsin\left(x+1\right) ». */
export function expressionL(e: E): string {
  const abs = q(Math.abs(e.k.n), e.k.d);
  const coef = abs.n === 1 && abs.d === 1 ? "" : qL(abs);
  const arc = `${coef}\\${e.variante}\\left(${argumentL(e)}\\right)`;
  if (e.cPi.n === 0) return `${kV(e) < 0 ? "-" : ""}${arc}`;
  return `${piL(e.cPi)}${kV(e) < 0 ? "-" : "+"}${arc}`;
}

const NOM_ARC = { arcsin: "arcsin", arccos: "arccos", arctan: "arctan" } as const;

export function formeL(e: E): string {
  return `f(x)=c+k\\${NOM_ARC[e.variante]}(mx+n)`;
}

// --- Figure (écran, papier, corrigé) -------------------------------------------------------

export function figure(e: E, mode: "ecran" | "papier" | "corrige"): string {
  const [lo, hi] = imageQ(e);
  const yMin = (qVal(lo) - 0.25) * Math.PI;
  const yMax = (qVal(hi) + 0.25) * Math.PI;
  const d = demiLargeur(e);
  const xMin = e.variante === "arctan" ? e.x0 - 4 : alpha(e) - 1;
  const xMax = e.variante === "arctan" ? e.x0 + 4 : beta(e) + 1;
  const hauteur = yMax - yMin;
  const echelle = Math.max(18, Math.min(32, Math.floor(360 / hauteur), Math.floor(330 / (xMax - xMin))));
  const de = e.variante === "arctan" ? xMin : alpha(e);
  const a = e.variante === "arctan" ? xMax : beta(e);
  const xs = e.variante === "arctan" ? [e.x0 - d, e.x0, e.x0 + d] : [alpha(e), e.x0, beta(e)];
  // Corrigé : coordonnées des nœuds marqués (ordonnée en multiples de π/4).
  const etiquette = (x: number) => (mode === "corrige" ? `(${x < 0 ? `−${-x}` : x} ; ${piTexte(Math.round((4 * f(e, x)) / Math.PI), 4)})` : undefined);
  const points = xs.map((x) => ({ x, y: f(e, x), plein: true, label: etiquette(x) }));
  const svg = figureCycloSvg({
    x: { min: xMin, max: xMax, lignes: lignesEntieres(xMin, xMax) },
    y: { min: yMin, max: yMax, lignes: lignesPi(yMin, yMax, 4) },
    courbes: [{ f: (x) => f(e, x), de, a }],
    asymptotesY: e.variante === "arctan" ? [qVal(lo) * Math.PI, qVal(hi) * Math.PI] : [],
    points,
    echelle,
    police: mode === "ecran" ? 12 : 11,
  });
  return mode === "corrige" ? `<div style="max-width:8cm;margin:0 auto">${svg}</div>` : svg;
}

// --- Textes ---------------------------------------------------------------------------------

export function consigneGenerale(e: E): Frag[] {
  return [
    tx("La courbe ci-dessous est celle de "),
    lx(formeL(e)),
    tx(", où "),
    lx("m>0"),
    tx(" et "),
    lx("k\\neq 0"),
    tx(" sont rationnels et "),
    lx("c"),
    tx(" est réel. Lignes verticales : entiers ; lignes horizontales : multiples de "),
    lx("\\dfrac{\\pi}{4}"),
    tx(". Les points marqués sont des nœuds du quadrillage."),
  ];
}

export function libelle(_e: E, phase: PhaseLireTransformee): string {
  return { domaine: "Domaine", image: "Image", mn: "m et n", kc: "k et c" }[phase];
}

export function consigne(e: E, phase: PhaseLireTransformee): Frag[] {
  switch (phase) {
    case "domaine":
      return [tx("Lis le domaine de "), lx("f"), tx(" sur le graphique.")];
    case "image":
      return [tx("Lis l'image de "), lx("f"), tx(" sur le graphique (valeurs exactes en "), lx("\\pi"), tx(").")];
    case "mn":
      return [tx("Déduis-en "), lx("m"), tx(" et "), lx("n"), tx(" (valeurs exactes).")];
    case "kc":
      return [tx("Déduis-en "), lx("k"), tx(" et "), lx("c"), tx(e.variante === "arctan" ? " à partir des asymptotes et du sens de variation (valeurs exactes)." : " (valeurs exactes) ; l'expression de f s'en déduit.")];
  }
}

export function champs(_e: E, phase: PhaseLireTransformee): ChampEcran[] {
  if (phase === "mn")
    return [
      { label: "m", labelLatex: "m=", placeholder: "ex. : 1/2" },
      { label: "n", labelLatex: "n=", placeholder: "ex. : -3/2" },
    ];
  return [
    { label: "k", labelLatex: "k=", placeholder: "ex. : -2 ou 1/2" },
    { label: "c", labelLatex: "c=", placeholder: "ex. : π/4" },
  ];
}

export function aide1(e: E, phase: PhaseLireTransformee): AideEcran {
  switch (phase) {
    case "domaine":
      return e.variante === "arctan"
        ? { texte: [tx("La courbe se prolonge sans fin des deux côtés, entre ses deux asymptotes horizontales : y a-t-il une abscisse interdite ?")] }
        : { texte: [tx(`La courbe de ${e.variante} est un arc borné : le domaine va de l'abscisse du point plein de gauche à celle du point plein de droite (bornes atteintes).`)] };
    case "image":
      return e.variante === "arctan"
        ? { texte: [tx("L'image est l'intervalle des ordonnées atteintes : ici, entre les deux asymptotes horizontales, qui ne sont jamais atteintes.")] }
        : { texte: [tx("L'image est l'intervalle des ordonnées atteintes, de la plus basse à la plus haute (points pleins compris).")] };
    case "mn":
      return e.variante === "arctan"
        ? { texte: [tx("Au centre de symétrie, "), lx("\\arctan(mx+n)=0"), tx(", donc "), lx("mx+n=0"), tx(" ; au point marqué suivant, "), lx("f(x)-c=k\\cdot\\dfrac{\\pi}{4}"), tx(", donc "), lx("\\arctan(mx+n)=\\dfrac{\\pi}{4}"), tx(" et "), lx("mx+n=1"), tx(".")] }
        : { texte: [lx(`\\${e.variante}(u)`), tx(" n'existe que pour "), lx("-1\\leq u\\leq 1"), tx(" : aux bornes "), lx("\\alpha<\\beta"), tx(" du domaine, "), lx("u=mx+n"), tx(" vaut −1 et 1 ("), lx("m>0"), tx(") :")], latex: "m\\alpha+n=-1\\qquad m\\beta+n=1" };
    case "kc":
      if (e.variante === "arccos")
        return { texte: [tx("arccos parcourt "), lx("[0\\,;\\,\\pi]"), tx(" en décroissant : "), lx("\\arccos 1=0"), tx(" à la borne droite (là, "), lx("f=c"), tx(") et "), lx("\\arccos(-1)=\\pi"), tx(" à la borne gauche (là, "), lx("f=c+k\\pi"), tx(").")] };
      return {
        texte: [
          tx(e.variante === "arcsin" ? "arcsin parcourt " : "arctan parcourt "),
          lx(e.variante === "arcsin" ? "\\left[-\\dfrac{\\pi}{2}\\,;\\,\\dfrac{\\pi}{2}\\right]" : "\\left]-\\dfrac{\\pi}{2}\\,;\\,\\dfrac{\\pi}{2}\\right["),
          tx(", de longueur "),
          lx("\\pi"),
          tx(", centré en 0 : l'image de f a la longueur "),
          lx("|k|\\cdot\\pi"),
          tx(" et pour milieu "),
          lx("c"),
          tx(". Comme "),
          lx("m>0"),
          tx(", "),
          lx("k>0"),
          tx(" si f est croissante, "),
          lx("k<0"),
          tx(" si elle est décroissante."),
        ],
      };
  }
}

export function aide2(e: E, phase: PhaseLireTransformee): AideEcran | null {
  const [lo, hi] = imageQ(e);
  switch (phase) {
    case "domaine":
      return e.variante === "arctan" ? { texte: [tx("arctan est définie sur "), lx("\\mathbb{R}"), tx(", donc pour toute valeur de "), lx("mx+n"), tx(".")] } : { texte: [tx("Lis les abscisses des deux points pleins extrêmes sur les lignes verticales (entières).")] };
    case "image":
      return { texte: [tx("Les lignes horizontales sont espacées de "), lx("\\dfrac{\\pi}{4}"), tx(" : compte les lignes depuis l'axe des abscisses, ou depuis une ligne étiquetée.")] };
    case "mn":
      return e.variante === "arctan"
        ? { texte: [tx("Ici, résous le système :")], latex: `m\\cdot ${par(e.x0)}+n=0\\qquad m\\cdot ${par(x1(e))}+n=1` }
        : { texte: [tx("Ici, résous le système :")], latex: `m\\cdot ${par(alpha(e))}+n=-1\\qquad m\\cdot ${par(beta(e))}+n=1` };
    case "kc":
      if (e.variante === "arccos") return { texte: [tx("Ici, lis "), lx(`f(${ent(beta(e))})`), tx(" et "), lx(`f(${ent(alpha(e))})`), tx(" :")], latex: `c=f(${ent(beta(e))})\\qquad f(${ent(alpha(e))})=c+k\\pi` };
      return { texte: [tx("Ici :")], latex: `|k|\\cdot\\pi=${piL(hi)}-\\left(${piL(lo)}\\right)\\qquad c=\\dfrac{1}{2}\\left(${piL(lo)}${hi.n < 0 ? "" : "+"}${piL(hi)}\\right)` };
  }
}

export function messageIllisible(_e: E, phase: PhaseLireTransformee): string {
  if (phase === "domaine" || phase === "image") return "Borne non reconnue : écris par exemple -3, π/4, -3π/4, +∞ ou -∞. Cette saisie ne compte pas comme une tentative.";
  return "Valeur non reconnue : écris une valeur exacte, par exemple 1/2, -3/2 ou π/4. Cette saisie ne compte pas comme une tentative.";
}

export function reponse(e: E, phase: PhaseLireTransformee): Frag[] {
  switch (phase) {
    case "domaine":
      return [lx(`\\mathrm{dom}\\,f=${e.variante === "arctan" ? "\\mathbb{R}" : intervalleL(domaine(e)[0])}`)];
    case "image":
      return [lx(`\\mathrm{im}\\,f=${intervalleL(image(e)[0])}`)];
    case "mn":
      return [lx(`m=${qL(e.m)}`), tx(" et "), lx(`n=${qL(nQ(e))}`)];
    case "kc":
      return [lx(`k=${qL(e.k)}`), tx(" et "), lx(`c=${piL(e.cPi)}`), tx(", donc "), lx(`f(x)=${expressionL(e)}`)];
  }
}

export const recap = reponse;
export { par as parX };
