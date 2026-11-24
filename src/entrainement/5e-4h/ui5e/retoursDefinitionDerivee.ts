/**
 * 5gen26 (f'(a) par la définition) — lot B, règles communes : aides à deux niveaux (niveau 1 = la
 * méthode du cours, `texteAideNiveau1` ; niveau 2 = posée pour CETTE fonction et CE nombre a — les
 * anciens « Exemple : f(x) = 2x + 3… » sont remplacés —, jamais la réponse) et messages ciblés sur les
 * erreurs du cours (double produit oublié, signe de a, différence non divisée par h, f(a) donnée pour
 * f'(a)…). Le refus sans tentative est dans le moteur (`refusSaisieDefinitionDerivee`).
 */
import type { FragmentConsigne } from "../../export/genererFeuilleExercices";
import type { ExerciceDefinitionDerivee } from "../core5e/definitionDerivee.types";
import { evaluerExpressionGenerale } from "../moteur/expressionGenerale";
import { lireNombreDerivees } from "../moteur5e/saisieDerivees";
import { valeurDeriveeExacte, valeurFonction } from "../moteur5e/verificationDefinitionDerivee";
import type { EcranDefinitionDerivee } from "../moteur5e/typesDefinitionDerivee";
import { racineEnA, valeurExacte } from "../generateurs5e/definitionDerivee/index";
import type { AideTrig } from "./aidesTrigonometrie";
import { formatDeveloppementConfirmeLatex, formatQuotientConfirmeLatex, texteAideNiveau1 } from "./formatDefinitionDerivee";
import { aideDepuis, l, t } from "./retoursDerivees";

const par = (n: number) => (n < 0 ? `(${n})` : `${n}`);
const coefDevant = (m: number, groupe: string) => (m === 1 ? groupe : m === -1 ? `-${groupe}` : `${m}${groupe}`);
const plusConst = (p: number) => (p === 0 ? "" : p > 0 ? `+${p}` : `${p}`);
const fracL = (num: number, den: number) => (den === 1 ? `${num}` : `${num < 0 ? "-" : ""}\\dfrac{${Math.abs(num)}}{${den}}`);
const kRacine = (k: number) => (k === 1 ? "" : `${k}`);

function niveau2(e: ExerciceDefinitionDerivee, ecran: EcranDefinitionDerivee): AideTrig {
  const a = e.a;
  const ah = `(${a}+h)`;
  if (ecran === "developper") {
    switch (e.famille) {
      case "affine":
        return { texte: [t("Ici, remplace x par "), l(`${a}+h`), t(", puis distribue :")], formules: [`f(${a}+h)=${coefDevant(e.m, ah)}${plusConst(e.p)}`] };
      case "quadratique":
        return { texte: [t("Ici, remplace x par "), l(`${a}+h`), t(" et développe d'abord le carré :")], formules: [`f(${a}+h)=${coefDevant(e.m, `${ah}^2`)}${plusConst(e.p)}\\qquad ${ah}^2=${a * a}${plusConst(2 * a)}h+h^2`] };
      case "quadratiqueComplete":
        return {
          texte: [t("Ici, remplace x par "), l(`${a}+h`), t(" dans les deux termes, et développe d'abord le carré :")],
          formules: [`f(${a}+h)=${coefDevant(e.m, `${ah}^2`)}${e.n < 0 ? "-" : "+"}${Math.abs(e.n) === 1 ? "" : Math.abs(e.n)}${ah}${plusConst(e.p)}\\qquad ${ah}^2=${a * a}${plusConst(2 * a)}h+h^2`],
        };
      case "rationnelleSimple":
        return {
          texte: [t("Ici, f("), l(`${a}`), t(") s'obtient en remplaçant x par "), l(par(a)), t(" (simplifie la fraction si possible) ; pour f("), l(`${a}+h`), t("), x devient :")],
          formules: [e.expo === 1 ? `x\\to ${par(a)}\\qquad x\\to ${a}+h` : `x^2\\to ${par(a)}^2\\qquad x^2\\to ${ah}^2`],
        };
      case "rationnelleLineaire":
        return {
          texte: [t("Ici, remplace x par "), l(`${a}+h`), t(" au numérateur et au dénominateur, puis réduis chacun :")],
          formules: [`f(${a}+h)=\\dfrac{${coefDevant(e.m, ah)}${plusConst(e.p)}}{${ah}${plusConst(-e.q)}}`],
        };
      case "racine":
        return { texte: [t("Ici, remplace x par "), l(`${a}+h`), t(" sous la racine, puis réduis la somme :")], formules: [`f(${a})=${kRacine(e.k)}\\sqrt{${a}${plusConst(e.c)}}\\qquad f(${a}+h)=${kRacine(e.k)}\\sqrt{${ah}${plusConst(e.c)}}`] };
    }
  }
  const fa = valeurExacte(e, a);
  const faL = fracL(fa.num, fa.den);
  const moinsFa = fa.num < 0 ? `+${fracL(-fa.num, fa.den)}` : `-${faL}`;
  const dev = formatDeveloppementConfirmeLatex(e, a);
  if (ecran === "quotient") {
    if (e.famille === "racine") {
      const s = racineEnA(e);
      const r = `\\sqrt{h+${s * s}}`;
      return {
        texte: [t("Ici, multiplie le numérateur et le dénominateur par "), l(`${r}+${s}`), t(" :")],
        formules: [`\\dfrac{${dev}${moinsFa}}{h}=${e.k === 1 ? "" : `${e.k}\\cdot`}\\dfrac{\\left(${r}-${s}\\right)\\left(${r}+${s}\\right)}{h\\left(${r}+${s}\\right)}`],
      };
    }
    if (e.famille === "rationnelleSimple" || e.famille === "rationnelleLineaire") {
      return { texte: [t("Ici, soustrais "), l(`f(${a})=${faL}`), t(" en réduisant au même dénominateur, puis mets h en évidence au numérateur :")], formules: [`f(${a}+h)-f(${a})=${dev}${moinsFa}`] };
    }
    return { texte: [t("Ici, soustrais "), l(`f(${a})=${faL}`), t(" : les termes constants s'annulent, puis mets h en évidence :")], formules: [`f(${a}+h)-f(${a})=\\left(${dev}\\right)${moinsFa}`] };
  }
  if (e.famille === "affine") return { texte: [t("Ici, calcule la différence, puis simplifie par h avant de faire tendre h vers 0 :")], formules: [`\\dfrac{f(${a}+h)-f(${a})}{h}=\\dfrac{\\left(${dev}\\right)${moinsFa}}{h}`] };
  return { texte: [t("Ici, le taux simplifié de l'étape précédente n'a plus de facteur h au dénominateur : remplace h par 0 :")], formules: [`\\lim_{h\\to 0}\\left(${formatQuotientConfirmeLatex(e, a)}\\right)`] };
}

export function aidesDefinitionDerivee(e: ExerciceDefinitionDerivee, ecran: EcranDefinitionDerivee): AideTrig[] {
  const n1 = texteAideNiveau1(e, ecran);
  return [aideDepuis(n1.texte, n1.latex), niveau2(e, ecran)];
}

/** Valeur d'une expression en h (null si illisible). */
function enH(texte: string, h: number): number | null {
  try {
    const v = evaluerExpressionGenerale(texte.replace(/^[^=]*=/, "").replace(/(?<![a-zA-Z])h(?![a-zA-Z])/g, "x"), h);
    return Number.isFinite(v) ? v : null;
  } catch {
    return null;
  }
}

const H = [0.7, -0.4, 1.3, 0.2];
function egaleEnH(texte: string, g: (h: number) => number): boolean {
  let n = 0;
  for (const h of H) {
    const c = g(h);
    if (!Number.isFinite(c)) continue;
    const v = enH(texte, h);
    if (v === null || Math.abs(v - c) > 1e-6 * Math.max(1, Math.abs(c))) return false;
    n++;
  }
  return n >= 2;
}

const proche = (v: number | null, c: number) => v !== null && Math.abs(v - c) < 1e-9 * Math.max(1, Math.abs(c));

/** Message ciblé sur l'erreur trahie par la réponse fausse (null : message générique). */
export function cibleDefinitionDerivee(e: ExerciceDefinitionDerivee, ecran: EcranDefinitionDerivee, valeurs: string[]): FragmentConsigne[] | null {
  const a = e.a;
  const f = (x: number) => valeurFonction(e, x);
  if (ecran === "developper") {
    const [fA, fAH] = valeurs;
    const vA = lireNombreDerivees(fA);
    if (!proche(vA, f(a))) {
      if (a < 0 && proche(vA, f(-a))) return [t("Pour f("), l(`${a}`), t("), remplace x par "), l(`(${a})`), t(" entre parenthèses : le signe compte, par exemple "), l(`(${a})^2=${a * a}`), t(".")];
      return [t("Revois f("), l(`${a}`), t(") : remplace x par "), l(par(a)), t(" dans f(x), puis calcule.")];
    }
    if (e.famille === "quadratique" || e.famille === "quadratiqueComplete") {
      const n = e.famille === "quadratiqueComplete" ? e.n : 0;
      if (egaleEnH(fAH, (h) => e.m * (a * a + h * h) + n * (a + h) + e.p)) return [t("Le double produit manque : "), l(`(${a}+h)^2=${a * a}${plusConst(2 * a)}h+h^2`), t(", pas "), l(`${a * a}+h^2`), t(".")];
      if (e.famille === "quadratiqueComplete" && egaleEnH(fAH, (h) => e.m * (a + h) ** 2 + e.n * a + e.p)) return [t("Le terme "), l(`${e.n}(${a}+h)`), t(" donne aussi un terme en h : distribue "), l(`${e.n}`), t(" sur h.")];
      if (e.m !== 1 && egaleEnH(fAH, (h) => e.m * a * a + 2 * a * h + h * h + n * (a + h) + e.p)) return [t("Le coefficient "), l(`${e.m}`), t(" multiplie tout le carré développé, pas seulement son premier terme.")];
    }
    if (egaleEnH(fAH, (h) => f(a) + h)) return [t("f("), l(`${a}+h`), t(") n'est pas f("), l(`${a}`), t(") + h : remplace x par "), l(`${a}+h`), t(" dans l'expression de f.")];
    return null;
  }
  if (ecran === "quotient") {
    const [q] = valeurs;
    if (egaleEnH(q, (h) => f(a + h) - f(a))) return [t("Tu as écrit la différence "), l(`f(${a}+h)-f(${a})`), t(" : il reste à la diviser par h, puis à simplifier.")];
    if (egaleEnH(q, (h) => (f(a) - f(a + h)) / h)) return [t("Attention à l'ordre : c'est "), l(`f(${a}+h)-f(${a})`), t(", pas l'inverse (le signe est changé).")];
    if (egaleEnH(q, (h) => (f(a + h) + f(a)) / h)) return [t("On soustrait f("), l(`${a}`), t(") : vérifie le signe devant f("), l(`${a}`), t(").")];
    return null;
  }
  const [v] = valeurs;
  const x = lireNombreDerivees(v);
  const d = valeurDeriveeExacte(e, a);
  if (proche(x, f(a)) && !proche(f(a), d)) return [t("C'est f("), l(`${a}`), t(") : on demande la limite du taux d'accroissement, le nombre dérivé f'("), l(`${a}`), t(").")];
  if (d !== 0 && proche(x, -d)) return [t("Le signe est changé : reprends le taux simplifié, puis remplace h par 0.")];
  if (e.famille === "racine" && proche(x, 2 * d)) return [t("En h = 0, le dénominateur vaut "), l(`\\sqrt{0+${racineEnA(e) ** 2}}+${racineEnA(e)}=${2 * racineEnA(e)}`), t(" : les deux termes comptent.")];
  return null;
}
