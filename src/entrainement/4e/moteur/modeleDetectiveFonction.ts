import type { FragmentConsigne } from "../../export/genererFeuilleExercices";
import type { ExerciceDetectiveFonction, TypeErreurFonction } from "../core/detectiveFonction.types";
import { ensembleLatex, type Ensemble } from "./algebreTransfertSecondDegre";
import { moinsH, plusQ, polynome, q, qp } from "../ui/corrigeChapitre3";

/**
 * Modèle de gen127 « Détective d'erreurs : fonction du second degré » : la copie de l'élève fictif
 * (lignes en fragments texte / KaTeX, cohérentes avec son erreur), la ligne fausse, le résultat
 * correct et celui de la copie. Valeurs exactes (entiers). Sans React ni `docx`.
 */

type E = ExerciceDetectiveFonction;
type Fr = FragmentConsigne[];
const t = (valeur: string): FragmentConsigne => ({ type: "texte", valeur });
const l = (valeur: string): FragmentConsigne => ({ type: "latex", valeur });

export const LIGNE_FAUSSE: Record<TypeErreurFonction, number> = {
  bSansSigne: 0,
  signeXS: 1,
  nonMultiplieParA: 2,
  signeSommet: 4,
  allureInversee: 2,
  imageAvecXS: 3,
  sommetHorsDomaine: 1,
  variationInversee: 2,
};

export function indiceLigneFausse(e: E): number {
  return LIGNE_FAUSSE[e.type];
}

export function nombreLignes(e: E): number {
  return e.variante === "canonique" ? 5 : 4;
}

export function f(e: E, x: number): number {
  return e.a * x * x + e.b * x + e.c;
}

export function developpeeLatex(e: E): string {
  return polynome([e.a, e.b, e.c]);
}

/** Coefficient devant une parenthèse : « », « - », « 2 ». */
export function coefDevant(a: number): string {
  return a === 1 ? "" : a === -1 ? "-" : q(a);
}

/** f(x) substitué : « 2\cdot 3^2-12\cdot 3+10 », « -(−2)^2+… ». */
export function substitution(e: E, x: number): string {
  const terme2 = e.a === 1 ? `${qp(x)}^2` : e.a === -1 ? `-${qp(x)}^2` : `${q(e.a)}\\cdot ${qp(x)}^2`;
  const terme1 = `${e.b < 0 ? "-" : "+"}${q(Math.abs(e.b))}\\cdot ${qp(x)}`;
  return `${terme2}${terme1}${plusQ(e.c)}`;
}

export function evidenceLatex(e: E): string {
  return `${coefDevant(e.a)}(${polynome([1, e.b / e.a, 0])})${plusQ(e.c)}`;
}

export function canoniqueLatex(a: number, h: number, k: number): string {
  return `${coefDevant(a)}(${moinsH(h)})^2${plusQ(k)}`;
}

export function intervalleLatex(m: number, M: number): string {
  return `[${q(m)}\\,;${q(M)}]`;
}

/** Image d'une parabole tournée vers le haut (minimum v) ou vers le bas (maximum v). */
export function image(versLeHaut: boolean, v: number): Ensemble {
  return versLeHaut ? [{ g: v, gFerme: true, d: Infinity, dFerme: false }] : [{ g: -Infinity, gFerme: false, d: v, dFerme: true }];
}

export const nomExtremum = (e: E): "maximum" | "minimum" => (e.a < 0 ? "maximum" : "minimum");

/** Optimum : borne la plus proche du sommet (là où est l'extremum), borne éloignée. */
export function bornes(e: E): { proche: number; loin: number; croit: boolean } {
  const m = e.m!;
  const M = e.M!;
  const gauche = e.h > M;
  return { proche: gauche ? M : m, loin: gauche ? m : M, croit: gauche === e.a < 0 };
}

// ---------------------------------------------------------------------------------------------
// Copie de l'élève
// ---------------------------------------------------------------------------------------------

/** Abscisse et ordonnée du sommet écrites par la copie (variantes sommet / canonique). */
export function sommetCopie(e: E): { x: number; y: number } {
  if (e.variante === "sommet") return { x: -e.h, y: f(e, -e.h) };
  if (e.type === "nonMultiplieParA") return { x: e.h, y: e.c - e.h * e.h };
  if (e.type === "signeSommet") return { x: -e.h, y: e.k };
  return { x: e.h, y: e.k };
}

export function ligneSommet(e: E): string {
  return `x_S=-\\dfrac{b}{2a}=-\\dfrac{${qp(e.b)}}{2\\cdot ${qp(e.a)}}=${q(e.h)}`;
}

export function copieEleve(e: E): Fr[] {
  const ext = nomExtremum(e);
  switch (e.variante) {
    case "sommet": {
      const bc = e.type === "bSansSigne" ? -e.b : e.b;
      const x = -e.h;
      return [
        [l(`a=${q(e.a)}\\qquad b=${q(bc)}\\qquad c=${q(e.c)}`)],
        [l(e.type === "signeXS" ? `x_S=\\dfrac{b}{2a}=\\dfrac{${qp(e.b)}}{2\\cdot ${qp(e.a)}}=${q(x)}` : `x_S=-\\dfrac{b}{2a}=-\\dfrac{${qp(bc)}}{2\\cdot ${qp(e.a)}}=${q(x)}`)],
        [l(`y_S=f(${q(x)})=${substitution(e, x)}=${q(f(e, x))}`)],
        [l(`S(${q(x)}\\,;${q(f(e, x))})`)],
      ];
    }
    case "canonique": {
      const s = sommetCopie(e);
      const h2 = e.h * e.h;
      return [
        [l(`f(x)=${evidenceLatex(e)}`)],
        [l(`f(x)=${coefDevant(e.a)}[(${moinsH(e.h)})^2-${q(h2)}]${plusQ(e.c)}`)],
        [l(`f(x)=${coefDevant(e.a)}(${moinsH(e.h)})^2${e.type === "nonMultiplieParA" ? `-${q(h2)}` : plusQ(-e.a * h2)}${plusQ(e.c)}`)],
        [l(`f(x)=${canoniqueLatex(e.a, e.h, s.y)}`)],
        [l(`S(${q(s.x)}\\,;${q(s.y)})`)],
      ];
    }
    case "image": {
      const haut = (e.a > 0) !== (e.type === "allureInversee");
      const v = e.type === "imageAvecXS" ? e.h : e.k;
      return [
        [l(ligneSommet(e))],
        [l(`y_S=f(${q(e.h)})=${substitution(e, e.h)}=${q(e.k)}`)],
        [l(`a=${q(e.a)}${e.a < 0 ? "<0" : ">0"}`), t(` : la parabole est tournée vers le ${haut ? "haut" : "bas"}, son sommet est un ${haut ? "minimum" : "maximum"}.`)],
        [l(`\\operatorname{im} f=${ensembleLatex(image(haut, v))}`)],
      ];
    }
    case "optimum": {
      const { proche, loin, croit } = bornes(e);
      const dom = intervalleLatex(e.m!, e.M!);
      const signeA = l(`a${e.a < 0 ? "<" : ">"}0`);
      if (e.type === "sommetHorsDomaine") {
        return [
          [l(ligneSommet(e))],
          [signeA, t(` : le ${ext} est atteint au sommet, en `), l(`x=${q(e.h)}\\text{.}`)],
          [l(`f(${q(e.h)})=${substitution(e, e.h)}=${q(e.k)}`)],
          [t(`Le ${ext} de f sur `), l(dom), t(" vaut "), l(`${q(e.k)}\\text{.}`)],
        ];
      }
      void proche;
      return [
        [l(ligneSommet(e))],
        [l(`${q(e.h)}\\notin${dom}`), t(" : le sommet n'est pas dans le domaine.")],
        [signeA, t(" : sur "), l(dom), t(`, f ${croit ? "décroît" : "croît"}, donc le ${ext} est atteint en `), l(`x=${q(loin)}\\text{.}`)],
        [l(`f(${q(loin)})=${substitution(e, loin)}=${q(f(e, loin))}`), t(` : le ${ext} vaut `), l(`${q(f(e, loin))}\\text{.}`)],
      ];
    }
  }
}

// ---------------------------------------------------------------------------------------------
// Résultats
// ---------------------------------------------------------------------------------------------

export function imageCorrecte(e: E): Ensemble {
  return image(e.a > 0, e.k);
}

export function imageCopie(e: E): Ensemble {
  const haut = (e.a > 0) !== (e.type === "allureInversee");
  return image(haut, e.type === "imageAvecXS" ? e.h : e.k);
}

export function optimumCorrect(e: E): { x: number; v: number } {
  const { proche } = bornes(e);
  return { x: proche, v: f(e, proche) };
}

export function optimumCopie(e: E): { x: number; v: number } {
  if (e.type === "sommetHorsDomaine") return { x: e.h, v: e.k };
  const { loin } = bornes(e);
  return { x: loin, v: f(e, loin) };
}
