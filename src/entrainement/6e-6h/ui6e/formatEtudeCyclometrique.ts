import type { ExArcRacine, ExArctanDroite, ExArctanInverse, ExXArctan, ExerciceEtudeCyclo, ValeurExacte } from "../core6e/etudeCyclometrique";
import { MOINS_INF, PLUS_INF, kArcRacine, val, zerosDerivee } from "../core6e/etudeCyclometrique";
import type { AideEcran, ChampEcran, Frag, OptionEcran } from "../../5e-4h/ui5e/ecransTrigo.types";
import { lx, tx } from "../../5e-4h/ui5e/ecransTrigo.types";
import type { Intervalle } from "./nombresCycloLotG";
import { MOINS_INFINI, PLUS_INFINI, intervalle } from "./nombresCycloLotG";

/**
 * Couche C — textes de `6gen157` « Étude d'une fonction cyclométrique ». Source unique de l'écran, des
 * aides, du récapitulatif, du corrigé et du papier.
 */

type E = ExerciceEtudeCyclo;
export type PhaseEtudeCyclo = "domaine" | "derivee" | "zeros" | "variations" | "valeurs";
export const PHASES_ETUDE: PhaseEtudeCyclo[] = ["domaine", "derivee", "zeros", "variations", "valeurs"];

const PI2 = Math.PI / 2;

// --- Écritures de f -------------------------------------------------------------------------

/** Coefficient k de arctan-droite en LaTeX (« 2 », « \dfrac{4}{3} »). */
export const kAD = (e: ExArctanDroite): string => (e.d.kd === 1 ? String(e.d.kn) : `\\dfrac{${e.d.kn}}{${e.d.kd}}`);
/** k − 1 en LaTeX (« 1 », « 3 », « \frac{1}{3} » : souvent dans un numérateur). */
export const kMoins1AD = (e: ExArctanDroite): string => (e.d.kd === 1 ? String(e.d.kn - 1) : `\\frac{${e.d.kn - e.d.kd}}{${e.d.kd}}`);
/** Facteur √2 ou 2 (valeur absolue de k) de arc-racine. */
export const kAbsAR = (e: ExArcRacine): string => (e.d.racine2 ? "\\sqrt{2}" : "2");
/** k signé de arc-racine devant x (« 2x », « -\sqrt{2}\,x »). */
export const kXAR = (e: ExArcRacine): string => `${e.d.signe < 0 ? "-" : ""}${e.d.racine2 ? "\\sqrt{2}\\,x" : "2x"}`;

export function fCorpsL(e: E): string {
  switch (e.variante) {
    case "arctan-droite":
      return `${kAD(e)}\\arctan x-x`;
    case "x-arctan":
      return e.k === 1 ? "x\\arctan x" : `x\\arctan\\dfrac{x}{${e.k}}`;
    case "arc-racine":
      return `\\${e.d.arc} x${e.d.signe > 0 ? "+" : "-"}${e.d.racine2 ? "\\sqrt{2}\\," : "2"}\\sqrt{1-x^{2}}`;
    case "arctan-inverse":
      return e.k > 0 ? `\\arctan\\dfrac{${e.k}}{x}` : `\\arctan\\left(-\\dfrac{${-e.k}}{x}\\right)`;
  }
}
export const fL = (e: E): string => `f(x)=${fCorpsL(e)}`;

/** f′(x) sous la forme simplifiée du corrigé. */
export function deriveeL(e: E): string {
  switch (e.variante) {
    case "arctan-droite":
      return `\\dfrac{${kMoins1AD(e)}-x^{2}}{1+x^{2}}`;
    case "x-arctan":
      return e.k === 1 ? "\\arctan x+\\dfrac{x}{1+x^{2}}" : `\\arctan\\dfrac{x}{${e.k}}+\\dfrac{${e.k}x}{${e.k * e.k}+x^{2}}`;
    case "arc-racine":
      return `\\dfrac{${e.d.arc === "arcsin" ? "1" : "-1"}${e.d.signe > 0 ? "-" : "+"}${e.d.racine2 ? "\\sqrt{2}\\,x" : "2x"}}{\\sqrt{1-x^{2}}}`;
    case "arctan-inverse":
      return e.k > 0 ? `-\\dfrac{${e.k}}{x^{2}+${e.k * e.k}}` : `\\dfrac{${-e.k}}{x^{2}+${e.k * e.k}}`;
  }
}

// --- Domaine, zéros, variations, valeurs ----------------------------------------------------

const B = (v: number, l: string, t: string) => ({ valeur: v, latex: l, texte: t });

export function domaine(e: E): Intervalle[] {
  switch (e.variante) {
    case "arctan-droite":
    case "x-arctan":
      return [intervalle(MOINS_INFINI, PLUS_INFINI, false, false)];
    case "arc-racine":
      return [intervalle(B(-1, "-1", "−1"), B(1, "1", "1"), true, true)];
    case "arctan-inverse":
      return [intervalle(MOINS_INFINI, B(0, "0", "0"), false, false), intervalle(B(0, "0", "0"), PLUS_INFINI, false, false)];
  }
}

export function domaineL(e: E): string {
  switch (e.variante) {
    case "arctan-droite":
    case "x-arctan":
      return "\\mathbb{R}";
    case "arc-racine":
      return "[-1\\,;\\,1]";
    case "arctan-inverse":
      return "\\mathbb{R}_0";
  }
}

/** Morceau de variation : intervalle (LaTeX) et sens. */
export interface Morceau {
  I: string;
  sens: "croissante" | "décroissante";
}

const iv = (g: string, d: string, gF: boolean, dF: boolean) => `${gF ? "[" : "]"}${g}\\,;\\,${d}${dF ? "]" : "["}`;

/** Variations justes. */
export function variations(e: E): Morceau[] {
  switch (e.variante) {
    case "arctan-droite": {
      const c = e.d.c.l;
      return [
        { I: iv("-\\infty", `-${c}`, false, true), sens: "décroissante" },
        { I: iv(`-${c}`, c, true, true), sens: "croissante" },
        { I: iv(c, "+\\infty", true, false), sens: "décroissante" },
      ];
    }
    case "x-arctan":
      return [
        { I: iv("-\\infty", "0", false, true), sens: "décroissante" },
        { I: iv("0", "+\\infty", true, false), sens: "croissante" },
      ];
    case "arc-racine": {
      const x0 = e.d.x0.l;
      const max = e.d.signe > 0;
      return [
        { I: iv("-1", x0, true, true), sens: max ? "croissante" : "décroissante" },
        { I: iv(x0, "1", true, true), sens: max ? "décroissante" : "croissante" },
      ];
    }
    case "arctan-inverse": {
      const s = e.k > 0 ? "décroissante" : "croissante";
      return [
        { I: iv("-\\infty", "0", false, false), sens: s },
        { I: iv("0", "+\\infty", false, false), sens: s },
      ];
    }
  }
}

function morceauxFrags(ms: Morceau[]): Frag[] {
  // Même sens sur deux intervalles : « décroissante sur I et sur J » (jamais sur leur réunion).
  if (ms.length === 2 && ms[0].sens === ms[1].sens) return [tx(`${ms[0].sens} sur `), lx(ms[0].I), tx(" et sur "), lx(ms[1].I)];
  const r: Frag[] = [];
  ms.forEach((m, i) => {
    if (i > 0) r.push(tx(", "));
    r.push(tx(`${m.sens} sur `), lx(m.I));
  });
  return r;
}

const inverse = (ms: Morceau[]): Morceau[] => ms.map((m) => ({ ...m, sens: m.sens === "croissante" ? "décroissante" : "croissante" }));

/** Quatre descriptions (la juste en premier), mêlées par `e.ordre`. */
function descriptions(e: E): Frag[][] {
  const juste = variations(e);
  switch (e.variante) {
    case "arctan-droite": {
      const c = e.d.c.l;
      return [
        morceauxFrags(juste),
        morceauxFrags(inverse(juste)),
        [tx("décroissante sur "), lx("\\mathbb{R}")],
        morceauxFrags([
          { I: iv("-\\infty", c, false, true), sens: "croissante" },
          { I: iv(c, "+\\infty", true, false), sens: "décroissante" },
        ]),
      ];
    }
    case "x-arctan":
      return [morceauxFrags(juste), morceauxFrags(inverse(juste)), [tx("croissante sur "), lx("\\mathbb{R}")], [tx("décroissante sur "), lx("\\mathbb{R}")]];
    case "arc-racine": {
      const x0 = e.d.x0.l;
      const s1 = juste[0].sens;
      return [
        morceauxFrags(juste),
        morceauxFrags(inverse(juste)),
        [tx(`${s1} sur `), lx("[-1\\,;\\,1]")],
        morceauxFrags([
          { I: iv("-\\infty", x0, false, true), sens: s1 },
          { I: iv(x0, "+\\infty", true, false), sens: juste[1].sens },
        ]),
      ];
    }
    case "arctan-inverse": {
      const s = juste[0].sens;
      const autre = s === "croissante" ? "décroissante" : "croissante";
      return [
        morceauxFrags(juste),
        [tx(`${s} sur `), lx("\\mathbb{R}_0")],
        morceauxFrags(inverse(juste)),
        morceauxFrags([
          { I: iv("-\\infty", "0", false, false), sens: s },
          { I: iv("0", "+\\infty", false, false), sens: autre },
        ]),
      ];
    }
  }
}

export const ID_JUSTE = "d0";

export function options(e: E): OptionEcran[] {
  const d = descriptions(e);
  return e.ordre.map((i) => ({ id: `d${i}`, fragments: [tx("f est "), ...d[i], tx(".")] }));
}

/** Champs de l'écran « valeurs » : libellé et valeur exacte attendue (ou ±∞). */
/** Argument d'une fonction : parenthèses simples, `\\left…\\right` seulement autour d'une fraction. */
export const parF = (arg: string): string => (arg.includes("\\dfrac") ? `\\left(${arg}\\right)` : `(${arg})`);

export interface ValeurDemandee {
  label: string;
  labelLatex: string;
  attendue: ValeurExacte;
}

export function valeursDemandees(e: E): ValeurDemandee[] {
  switch (e.variante) {
    case "arctan-droite": {
      const c = e.d.c;
      return [
        { label: `f(${c.t})`, labelLatex: `f${parF(c.l)}=`, attendue: e.d.fc },
        { label: `f(−${c.t})`, labelLatex: `f${parF(`-${c.l}`)}=`, attendue: e.d.fmc },
      ];
    }
    case "x-arctan":
      return [
        { label: "f(0)", labelLatex: "f(0)=", attendue: val(0, "0", "0") },
        { label: "limite en +∞", labelLatex: "\\lim\\limits_{x\\to+\\infty}f(x)=", attendue: PLUS_INF },
      ];
    case "arc-racine": {
      const bas = e.d.arc === "arcsin" ? val(-PI2, "-\\dfrac{\\pi}{2}", "−π/2") : val(Math.PI, "\\pi", "π");
      const haut = e.d.arc === "arcsin" ? val(PI2, "\\dfrac{\\pi}{2}", "π/2") : val(0, "0", "0");
      return [
        { label: `f(${e.d.x0.t})`, labelLatex: `f${parF(e.d.x0.l)}=`, attendue: e.d.fx0 },
        { label: "f(−1)", labelLatex: "f(-1)=", attendue: bas },
        { label: "f(1)", labelLatex: "f(1)=", attendue: haut },
      ];
    }
    case "arctan-inverse": {
      const s = Math.sign(e.k);
      const p = val(PI2, "\\dfrac{\\pi}{2}", "π/2");
      const m = val(-PI2, "-\\dfrac{\\pi}{2}", "−π/2");
      return [
        { label: "limite en 0 à gauche", labelLatex: "\\lim\\limits_{x\\to 0^-}f(x)=", attendue: s > 0 ? m : p },
        { label: "limite en 0 à droite", labelLatex: "\\lim\\limits_{x\\to 0^+}f(x)=", attendue: s > 0 ? p : m },
        { label: "limite en +∞", labelLatex: "\\lim\\limits_{x\\to+\\infty}f(x)=", attendue: val(0, "0", "0") },
      ];
    }
  }
}

// --- Textes d'écran -------------------------------------------------------------------------

export function consigneGenerale(e: E): Frag[] {
  return [tx("On étudie la fonction "), lx(fL(e)), tx(".")];
}

export function libelle(_e: E, phase: PhaseEtudeCyclo): string {
  return { domaine: "Domaine", derivee: "Dérivée", zeros: "Zéros de f′", variations: "Variations", valeurs: "Valeurs du tableau" }[phase];
}

export function consigne(e: E, phase: PhaseEtudeCyclo): Frag[] {
  switch (phase) {
    case "domaine":
      return [tx("Détermine le domaine de "), lx("f"), tx(".")];
    case "derivee":
      return e.variante === "arc-racine"
        ? [tx("Calcule "), lx("f'(x)"), tx(" pour "), lx("x\\in\\,]-1\\,;\\,1["), tx(" (aux bornes, arcsin, arccos et la racine ne sont pas dérivables).")]
        : [tx("Calcule "), lx("f'(x)"), tx(" sur le domaine de "), lx("f"), tx(".")];
    case "zeros":
      return [tx("Pour quelles valeurs de "), lx("x"), tx(" la dérivée "), lx("f'(x)"), tx(" s'annule-t-elle ?")];
    case "variations":
      return [tx("Quelles sont les variations de "), lx("f"), tx(" ?")];
    case "valeurs":
      switch (e.variante) {
        case "arctan-droite":
          return [tx("Calcule la valeur exacte du maximum local et du minimum local de "), lx("f"), tx(".")];
        case "x-arctan":
          return [tx("Donne la valeur exacte du minimum de "), lx("f"), tx(" et sa limite en "), lx("+\\infty"), tx(".")];
        case "arc-racine":
          return [tx(`Donne la valeur exacte du ${e.d.signe > 0 ? "maximum" : "minimum"} de `), lx("f"), tx(" et ses valeurs aux bornes du domaine.")];
        case "arctan-inverse":
          return [tx("Donne les limites de "), lx("f"), tx(" en 0 (à gauche et à droite) et en "), lx("+\\infty"), tx(".")];
      }
  }
}

export function champs(e: E, phase: PhaseEtudeCyclo): ChampEcran[] {
  switch (phase) {
    case "derivee":
      return [{ label: "f′(x)", labelLatex: "f'(x)=", placeholder: e.variante === "arc-racine" ? "ex. : (1-x)/√(1-x²)" : "ex. : 1/(1+x²)-x", apercu: true }];
    case "zeros":
      return [{ label: "zéros de f′", labelLatex: "x=", placeholder: "ex. : -√3 ; √3 ou aucune" }];
    case "valeurs":
      return valeursDemandees(e).map((v) => ({ label: v.label, labelLatex: v.labelLatex, placeholder: "ex. : π/3 - √3 ou +∞" }));
    default:
      return [];
  }
}

export function aide1(e: E, phase: PhaseEtudeCyclo): AideEcran {
  switch (phase) {
    case "domaine":
      return { texte: [tx("Cherche morceau par morceau les valeurs interdites : arcsin et arccos demandent un argument dans "), lx("[-1\\,;\\,1]"), tx(", une racine un radicande positif ou nul, une fraction un dénominateur non nul ; arctan est définie sur "), lx("\\mathbb{R}"), tx(".")] };
    case "derivee":
      if (e.variante === "arc-racine")
        return { texte: [tx("Formules du cours (point 4), avec la règle de la chaîne :")], latex: `(\\${e.d.arc} x)'=${e.d.arc === "arcsin" ? "" : "-"}\\dfrac{1}{\\sqrt{1-x^{2}}}\\qquad (\\sqrt{u})'=\\dfrac{u'}{2\\sqrt{u}}` };
      return { texte: [tx("Formule du cours (point 4), avec la règle de la chaîne"), ...(e.variante === "x-arctan" ? [tx(" et celle du produit "), lx("(uv)'=u'v+uv'")] : []), tx(" :")], latex: "(\\arctan u)'=\\dfrac{u'}{1+u^{2}}" };
    case "zeros":
      if (e.variante === "x-arctan") return { texte: [tx("On ne sait pas résoudre "), lx("f'(x)=0"), tx(" par calcul : étudie le signe de chaque terme de "), lx("f'(x)"), tx(" selon que "), lx("x"), tx(" est positif, nul ou négatif.")] };
      return { texte: [tx("Un quotient est nul quand son numérateur est nul (le dénominateur ne s'annule pas sur le domaine de dérivabilité). Garde seulement les valeurs du domaine.")] };
    case "variations":
      return { texte: [tx("f est croissante où "), lx("f'(x)>0"), tx(", décroissante où "), lx("f'(x)<0"), tx(". Sur chaque intervalle du domaine délimité par les zéros de "), lx("f'"), tx(", le signe est constant : teste une valeur.")] };
    case "valeurs":
      switch (e.variante) {
        case "arctan-droite":
          return { texte: [tx("Valeurs remarquables (cours, point 2) et parité : "), lx("f"), tx(" est impaire.")], latex: "\\arctan\\dfrac{\\sqrt{3}}{3}=\\dfrac{\\pi}{6}\\qquad\\arctan 1=\\dfrac{\\pi}{4}\\qquad\\arctan\\sqrt{3}=\\dfrac{\\pi}{3}" };
        case "x-arctan":
          return { texte: [tx("Le minimum est la valeur de "), lx("f"), tx(" au zéro de "), lx("f'"), tx(". Pour la limite, utilise :")], latex: "\\lim\\limits_{u\\to+\\infty}\\arctan u=\\dfrac{\\pi}{2}" };
        case "arc-racine":
          return { texte: [tx("Remplace "), lx("x"), tx(" par chaque valeur ; valeurs remarquables (cours, point 2) :")], latex: "\\arcsin\\dfrac{1}{2}=\\dfrac{\\pi}{6}\\qquad\\arccos\\dfrac{1}{2}=\\dfrac{\\pi}{3}\\qquad\\arcsin\\dfrac{\\sqrt{2}}{2}=\\arccos\\dfrac{\\sqrt{2}}{2}=\\dfrac{\\pi}{4}" };
        case "arctan-inverse":
          return { texte: [tx("Cherche d'abord la limite de "), lx("u=\\dfrac{k}{x}"), tx(" (à gauche et à droite de 0, puis en "), lx("+\\infty"), tx("), puis utilise les asymptotes horizontales de arctan (cours, point 2) et "), lx("\\arctan 0=0"), tx(".")] };
      }
  }
}

export function aide2(e: E, phase: PhaseEtudeCyclo): AideEcran | null {
  switch (phase) {
    case "domaine":
      switch (e.variante) {
        case "arctan-droite":
        case "x-arctan":
          return { texte: [tx("Ici, "), lx("f"), tx(" n'est faite que de arctan et de polynômes : y a-t-il une seule valeur interdite ?")] };
        case "arc-racine":
          return { texte: [tx("Ici, deux conditions à réunir :")], latex: "-1\\leq x\\leq 1\\qquad\\text{et}\\qquad 1-x^{2}\\geq 0" };
        case "arctan-inverse":
          return { texte: [tx("Ici, le seul morceau à surveiller est le quotient "), lx(`\\dfrac{${e.k}}{x}`), tx(".")] };
      }
      break;
    case "derivee":
      switch (e.variante) {
        case "arctan-droite":
          return { texte: [tx("Ici, "), lx(kAD(e)), tx(" reste devant "), lx("\\arctan x"), tx(", et la dérivée de "), lx("-x"), tx(" est "), lx("-1"), tx(". Mets ensuite au même dénominateur.")] };
        case "x-arctan":
          return { texte: [tx("Ici, "), lx("u=x"), tx(" et "), lx(e.k === 1 ? "v=\\arctan x" : `v=\\arctan\\dfrac{x}{${e.k}}`), tx(e.k === 1 ? "." : ", où ")].concat(e.k === 1 ? [] : [lx(`\\left(\\dfrac{x}{${e.k}}\\right)'=\\dfrac{1}{${e.k}}`), tx(".")]) };
        case "arc-racine":
          return { texte: [tx("Ici, "), lx("u=1-x^{2}"), tx(" et "), lx("u'=-2x"), tx(" ; mets les deux termes sur le dénominateur commun "), lx("\\sqrt{1-x^{2}}"), tx(".")] };
        case "arctan-inverse":
          return { texte: [tx("Ici, "), lx(e.k > 0 ? `u=\\dfrac{${e.k}}{x}` : `u=-\\dfrac{${-e.k}}{x}`), tx(" et "), lx(e.k > 0 ? `u'=-\\dfrac{${e.k}}{x^{2}}` : `u'=\\dfrac{${-e.k}}{x^{2}}`), tx(" ; multiplie ensuite numérateur et dénominateur par "), lx("x^{2}"), tx(".")] };
      }
      break;
    case "zeros":
      switch (e.variante) {
        case "arctan-droite":
          return { texte: [tx("Ici, résous :")], latex: `${kMoins1AD(e)}-x^{2}=0` };
        case "x-arctan":
          return { texte: [tx("Pour "), lx("x>0"), tx(", les deux termes de "), lx("f'(x)"), tx(" sont positifs ; que se passe-t-il pour "), lx("x<0"), tx(", puis en "), lx("x=0"), tx(" ?")] };
        case "arc-racine":
          return { texte: [tx("Ici, résous (puis vérifie que la solution est dans "), lx("]-1\\,;\\,1["), tx(") :")], latex: `${e.d.arc === "arcsin" ? "1" : "-1"}${e.d.signe > 0 ? "-" : "+"}${e.d.racine2 ? "\\sqrt{2}\\,x" : "2x"}=0` };
        case "arctan-inverse":
          return { texte: [tx("Ici, le numérateur de "), lx("f'(x)"), tx(" est la constante "), lx(String(-e.k)), tx(" : peut-il valoir 0 ?")] };
      }
      break;
    case "variations":
      switch (e.variante) {
        case "arctan-droite":
          return { texte: [tx("Ici, le dénominateur "), lx("1+x^{2}"), tx(" est positif : teste le signe du numérateur en "), lx("x=0"), tx(" et en "), lx("x=2"), tx(" (f′ est paire).")] };
        case "x-arctan":
          return { texte: [tx("Ici, "), lx("f'(x)"), tx(" a le signe de "), lx("x"), tx(" (question précédente).")] };
        case "arc-racine":
          return { texte: [tx("Ici, "), lx("\\sqrt{1-x^{2}}>0"), tx(" sur "), lx("]-1\\,;\\,1["), tx(" : f′ a le signe du numérateur, du premier degré, qui change de signe en "), lx(e.d.x0.l), tx(".")] };
        case "arctan-inverse":
          return { texte: [tx("Ici, "), lx(`x^{2}+${e.k * e.k}>0`), tx(" : quel est le signe de "), lx("f'(x)"), tx(" ? N'oublie pas que le domaine est formé de deux intervalles.")] };
      }
      break;
    case "valeurs":
      switch (e.variante) {
        case "arctan-droite":
          return { texte: [tx("Ici :")], latex: `f\\left(${e.d.c.l}\\right)=${kAD(e)}\\arctan ${e.d.c.l.startsWith("\\dfrac") ? `\\left(${e.d.c.l}\\right)` : e.d.c.l}-${e.d.c.l}` };
        case "x-arctan":
          return { texte: [tx("Ici, quand "), lx("x\\to+\\infty"), tx(", "), lx(e.k === 1 ? "\\arctan x" : `\\arctan\\dfrac{x}{${e.k}}`), tx(" tend vers "), lx("\\dfrac{\\pi}{2}"), tx(" et "), lx("x"), tx(" vers "), lx("+\\infty"), tx(".")] };
        case "arc-racine":
          return { texte: [tx("Ici :")], latex: `f\\left(${e.d.x0.l}\\right)=\\${e.d.arc}\\left(${e.d.x0.l}\\right)${e.d.signe > 0 ? "+" : "-"}${kAbsAR(e)}\\sqrt{1-\\left(${e.d.x0.l}\\right)^{2}}` };
        case "arctan-inverse":
          return { texte: [tx("Ici, "), lx(e.k > 0 ? `\\dfrac{${e.k}}{x}` : `-\\dfrac{${-e.k}}{x}`), tx(" tend vers "), lx(e.k > 0 ? "-\\infty" : "+\\infty"), tx(" quand "), lx("x\\to 0^-"), tx(", et vers 0 quand "), lx("x\\to+\\infty"), tx(".")] };
      }
  }
  return null;
}

export function messageIllisible(_e: E, phase: PhaseEtudeCyclo): string {
  if (phase === "domaine") return "Borne non reconnue : écris par exemple -1, π/2, +∞ ou -∞. Cette saisie ne compte pas comme une tentative.";
  if (phase === "derivee") return "Expression non reconnue : écris par exemple (1-x²)/(1+x²), arctan(x/2)+2x/(4+x²) ou 1/√(1-x²). Cette saisie ne compte pas comme une tentative.";
  if (phase === "zeros") return "Liste non reconnue : écris les valeurs séparées par « ; » (par exemple -√3 ; √3), ou « aucune ». Cette saisie ne compte pas comme une tentative.";
  return "Valeur non reconnue : écris une valeur exacte, par exemple π/3 - √3, -π/2 ou +∞. Cette saisie ne compte pas comme une tentative.";
}

/** Réponse attendue (fragments) — écran, récapitulatif, papier, corrigé. */
export function reponse(e: E, phase: PhaseEtudeCyclo): Frag[] {
  switch (phase) {
    case "domaine":
      return [lx(`\\mathrm{dom}\\,f=${domaineL(e)}`)];
    case "derivee":
      return [lx(`f'(x)=${deriveeL(e)}`)];
    case "zeros": {
      const z = zerosDerivee(e);
      if (z.length === 0) return [tx("aucune : "), lx("f'(x)\\neq 0"), tx(" pour tout "), lx("x\\in\\mathbb{R}_0")];
      const r: Frag[] = [];
      z.forEach((v, i) => {
        if (i > 0) r.push(tx(" et "));
        r.push(lx(`x=${v.l}`));
      });
      return r;
    }
    case "variations":
      return [tx("f est "), ...morceauxFrags(variations(e))];
    case "valeurs": {
      const r: Frag[] = [];
      valeursDemandees(e).forEach((v, i) => {
        if (i > 0) r.push(tx(" ; "));
        r.push(lx(`${v.labelLatex}${v.attendue.l}`));
      });
      return r;
    }
  }
}

export const recap = reponse;

export { MOINS_INF, PLUS_INF, kArcRacine };
export type { ExArcRacine, ExArctanDroite, ExArctanInverse, ExXArctan };
