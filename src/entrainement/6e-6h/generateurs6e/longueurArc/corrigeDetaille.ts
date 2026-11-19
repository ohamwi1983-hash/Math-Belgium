import type { ExerciceLongueurArc, ExerciceLongueurArcA, ExerciceLongueurArcB, ExerciceLongueurArcC } from "../../core6e/longueurArc.types";
import type { EtapeCorrection, FragmentConsigne, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise } from "../../../export/corrigeTableau";
import { phasesPourExercice } from "../../moteur6e/typesLongueurArc";
import type { PhaseLongueurArc } from "../../moteur6e/typesLongueurArc";
import {
  borneBLatex,
  coefPrimitiveC,
  demiLatex,
  formatReponseAttenduePhaseLatex,
  formuleFPrimeA,
  formuleFPrimeCarreDeveloppeA,
  formuleIntegrandeEnTB,
  formulePrimitiveEnTB,
  formuleRacineSimplifieeA,
  kLatexC,
  unPlusKxLatex,
} from "../../ui6e/formatLongueurArc";
import { figureLongueurArcSvg } from "../../ui6e/figureLongueurArc";
import { decimalLatex, fractionLatex } from "../../ui6e/formatMonome";
import { cours, crochet, lignesFin, moins, q, qAdd, qDiv, qL, qMul, qP, qPow, qSub, qVal, substituer } from "../../ui6e/corrigeIntegrales1";
import type { Q } from "../../ui6e/corrigeIntegrales1";

/**
 * Corrigé détaillé « comme au tableau » de `6gen28` (longueur d'un arc) — règle
 * `.claude/rules/feuilles-evaluations.md`. f′ dérivée terme à terme, 1 + [f′]² regroupé en carré
 * parfait (ou en expression du premier degré), substitution t = √(x² + k²) et éléments simples,
 * L = [F]ₐᵇ avec F(b) − F(a) valeurs substituées et valeur exacte. Figure de l'arc sur la dernière
 * étape. Partagé par l'adaptateur papier et `App6gen28.tsx`.
 */

const LETTRES = "abcdefgh";
const t = (s: string): FragmentConsigne => texte(s);
const f = (s: string): FragmentConsigne => latex(s);
const C6 = cours(6);
const FORMULE = "L=\\int_a^b\\sqrt{1+[f'(x)]^2}\\,dx";

interface Contenu {
  utilise: FragmentConsigne[];
  calcul: LigneCalcul[];
  piege?: string;
}

function primitiveRacineA(e: ExerciceLongueurArcA): string {
  if (e.forme === "log") {
    const d = demiLatex(e.c);
    return `\\dfrac{x^2}{${4 * e.c}}+${d}\\ln(x)`;
  }
  const n = e.n;
  return `\\dfrac{1}{2}\\left(\\dfrac{x^{${n + 1}}}{${n + 1}}+\\dfrac{x^{${1 - n}}}{${1 - n}}\\right)`;
}

/** Valeur exacte de la primitive (puissances) en un entier x : ½(x^{n+1}/(n+1) + x^{1−n}/(1−n)). */
function primitivePuissancesQ(n: number, x: number): Q {
  const a = qDiv(qPow(q(x), n + 1), q(n + 1));
  const b = qDiv(q(1), qMul(qPow(q(x), n - 1), q(1 - n)));
  return qMul(q(1, 2), qAdd(a, b));
}

function contenuA(e: ExerciceLongueurArcA, phase: PhaseLongueurArc): Contenu {
  const racine = formuleRacineSimplifieeA(e);
  if (phase === "aEcran1") {
    if (e.forme === "log") {
      const d = demiLatex(e.c);
      return {
        utilise: [t(`On dérive terme à terme ${C6} : `), f("(x^2)'=2x,\\quad(\\ln x)'=\\dfrac{1}{x}"), t(".")],
        calcul: [ligne(`f'(x)=\\dfrac{2x}{${4 * e.c}}-${d}${d === "" ? "" : "\\cdot "}\\dfrac{1}{x}`, "dérivée terme à terme"), ligne(`=${formuleFPrimeA(e)}`, "on simplifie")],
      };
    }
    const n = e.n;
    return {
      utilise: [t(`On dérive terme à terme ${C6} : `), f("(x^k)'=kx^{k-1}"), t(".")],
      calcul: [ligne(`f'(x)=\\dfrac{1}{2}\\left(\\dfrac{${n + 1}x^{${n}}}{${n + 1}}${n - 1 === 1 ? "-x^{-2}" : `-\\dfrac{${n - 1}x^{-${n}}}{${n - 1}}`}\\right)`, [f("(x^k)'=kx^{k-1}"), t(", avec "), f(`1-${n}=-${n - 1}`)]), ligne(`=${formuleFPrimeA(e)}`, "on simplifie")],
    };
  }
  if (phase === "aEcran2") {
    const dev = formuleFPrimeCarreDeveloppeA(e);
    if (e.forme === "log") {
      const c = e.c;
      const plus = dev.replace("-\\dfrac{1}{2}+", "+\\dfrac{1}{2}+");
      return {
        utilise: [t(`L'expression sous la racine est construite pour être un carré parfait ${C6} : on développe `), f("[f'(x)]^2"), t(", on ajoute 1, puis on reconnaît "), f("(a+b)^2"), t(".")],
        calcul: [
          ligne(`[f'(x)]^2=${dev}`, [t("identité "), f("(a-b)^2=a^2-2ab+b^2"), t(", double produit "), f(`2\\cdot\\dfrac{x}{${2 * c}}\\cdot\\dfrac{${c}}{2x}=\\dfrac{1}{2}`)]),
          ligne(`1+[f'(x)]^2=${plus}`, [f("1-\\dfrac{1}{2}=\\dfrac{1}{2}")]),
          ligne(`=\\left(${racine}\\right)^2`, [t("identité "), f("(a+b)^2=a^2+2ab+b^2")]),
          ligne(`\\sqrt{1+[f'(x)]^2}=${racine}`, "racine d'un carré : l'expression est positive (x > 0)"),
        ],
        piege: "Écrire √(1 + [f′(x)]²) = 1 + f′(x) : la racine d'une somme n'est pas la somme des racines.",
      };
    }
    const n = e.n;
    return {
      utilise: [t(`L'expression sous la racine est construite pour être un carré parfait ${C6} : on développe `), f("[f'(x)]^2"), t(", on ajoute 1, puis on reconnaît "), f("(a+b)^2"), t(".")],
      calcul: [
        ligne(`[f'(x)]^2=\\dfrac{1}{4}\\left(x^{${n}}-x^{-${n}}\\right)^2`, "carré d'un produit"),
        ligne(`=${dev}`, [t("identité "), f("(a-b)^2=a^2-2ab+b^2"), t(", avec "), f(`x^{${n}}\\cdot x^{-${n}}=1`)]),
        ligne(`1+[f'(x)]^2=\\frac{1}{4}\\left(x^{${2 * n}}+2+x^{${-2 * n}}\\right)`, [f("1=\\dfrac{4}{4}"), t(", et "), f("-2+4=2")]),
        ligne(`=\\left(${racine}\\right)^2`, [t("identité "), f("(a+b)^2=a^2+2ab+b^2")]),
        ligne(`\\sqrt{1+[f'(x)]^2}=${racine}`, "racine d'un carré : l'expression est positive (x > 0)"),
      ],
      piege: "Écrire √(1 + [f′(x)]²) = 1 + f′(x) : la racine d'une somme n'est pas la somme des racines.",
    };
  }
  const P = primitiveRacineA(e);
  const { a, b } = e;
  const lignes: LigneCalcul[] = [ligne(`L=\\int_{${a}}^{${b}}\\sqrt{1+[f'(x)]^2}\\,dx`, "formule de la longueur d'arc"), ligne(`=\\int_{${a}}^{${b}} ${racine}\\,dx`, "forme simplifiée de l'étape précédente"), ligne(`=${crochet(P, `${a}`, `${b}`)}`, "primitive terme à terme")];
  const subB = substituer(P, `${b}`);
  const subA = substituer(P, `${a}`);
  lignes.push(ligne(`=${moins(subB, subA)}`, "F(b) − F(a)"));
  const L = e.primitiveReference(b) - e.primitiveReference(a);
  if (e.forme === "puissances") {
    const Pb = primitivePuissancesQ(e.n, b);
    const Pa = primitivePuissancesQ(e.n, a);
    lignes.push(ligne(`=${moins(qL(Pb), qL(Pa))}`, "on calcule F(b) et F(a)"));
    lignes.push(...lignesFin(L, null, "on réduit"));
  } else {
    const d = demiLatex(e.c);
    const qq = fractionLatex(b, a);
    const ln = qq.includes("dfrac") ? `\\ln\\left(${qq}\\right)` : `\\ln(${qq})`;
    lignes.push(ligne(`=${fractionLatex(b * b - a * a, 4 * e.c)}+${d}${ln}`, [t("on regroupe, avec "), f("\\ln b-\\ln a=\\ln\\dfrac{b}{a}")]));
    lignes.push(ligne(`\\approx ${decimalLatex(L, 2)}`, "valeur approchée"));
  }
  return { utilise: [t(`Longueur d'un arc ${C6} : `), f(FORMULE), t(", avec la racine simplifiée de l'étape précédente.")], calcul: lignes };
}

function contenuB(e: ExerciceLongueurArcB, phase: PhaseLongueurArc): Contenu {
  const { k, t1, t2 } = e;
  const k2 = k * k;
  if (phase === "bEcran1") {
    const lignesBorne = (nom: string, tv: number): LigneCalcul[] => {
      const x = borneBLatex(tv, k);
      const carre = /^\d+$/.test(x) ? `${x}^2` : `\\left(${x}\\right)^2`;
      return [ligne(`${nom}=\\sqrt{${carre}+${k2}}`, [t("on remplace x par "), f(x)]), ligne(`=\\sqrt{${tv * tv - k2}+${k2}}`), ligne(`=\\sqrt{${tv * tv}}`), ligne(`=${tv}`)];
    };
    return { utilise: [t("On remplace x par chaque borne dans "), f(`t=\\sqrt{x^2+${k2}}`), t(` ${C6}.`)], calcul: [...lignesBorne("t_1", t1), ...lignesBorne("t_2", t2)] };
  }
  if (phase === "bEcran2") {
    const kk = k === 1 ? "" : `${k}`;
    return {
      utilise: [t(`On calcule la racine de la formule ${C6}, puis on change de variable : `), f(`t^2=x^2+${k2}`), t(" donne "), f("x\\,dx=t\\,dt"), t(".")],
      calcul: [
        ligne(`f'(x)=\\dfrac{${k}}{x}`, [t("dérivée de "), f(`${kk}\\ln(x)`)]),
        ligne(`1+[f'(x)]^2=1+\\dfrac{${k2}}{x^2}`),
        ligne(`=\\dfrac{x^2+${k2}}{x^2}`, "même dénominateur"),
        ligne(`\\sqrt{1+[f'(x)]^2}=\\dfrac{\\sqrt{x^2+${k2}}}{x}`, "x > 0"),
        ligne(`t^2=x^2+${k2}`, "on élève t au carré"),
        ligne("2t\\,dt=2x\\,dx", "on dérive les deux membres"),
        ligne(`\\int\\dfrac{\\sqrt{x^2+${k2}}}{x}\\,dx=\\int\\dfrac{t}{x^2}\\cdot x\\,dx`, "on multiplie et on divise par x"),
        ligne(`=\\int\\dfrac{t}{t^2-${k2}}\\cdot t\\,dt`, [f(`x^2=t^2-${k2}`), t(", "), f("x\\,dx=t\\,dt")]),
        ligne(`=\\int ${formuleIntegrandeEnTB(k)}\\,dt`),
      ],
    };
  }
  if (phase === "bEcran3") {
    const A = fractionLatex(k, 2);
    const B = fractionLatex(-k, 2);
    const primBrute = `t+${k === 2 ? "" : `\\dfrac{${k}}{2}`}\\ln|t-${k}|-${k === 2 ? "" : `\\dfrac{${k}}{2}`}\\ln|t+${k}|`;
    return {
      utilise: [t(`On écrit la fraction comme 1 plus une fraction, puis on la décompose en éléments simples, avec `), f(`t^2-${k2}=(t-${k})(t+${k})`), t(` ${C6}.`)],
      calcul: [
        ligne(`${formuleIntegrandeEnTB(k)}=1+\\dfrac{${k2}}{t^2-${k2}}`, [f(`t^2=(t^2-${k2})+${k2}`)]),
        ligne(`\\dfrac{${k2}}{t^2-${k2}}=\\dfrac{A}{t-${k}}+\\dfrac{B}{t+${k}}`, "éléments simples"),
        ligne(`${k2}=A(t+${k})+B(t-${k})`, "même dénominateur"),
        ligne(`${k2}=${2 * k}A`, [t("on remplace t par "), f(`${k}`)]),
        ligne(`A=${A}`),
        ligne(`${k2}=-${2 * k}B`, [t("on remplace t par "), f(`-${k}`)]),
        ligne(`B=${B}`),
        ligne(`\\int ${formuleIntegrandeEnTB(k)}\\,dt=${primBrute}`, [t("primitives de "), f("1"), t(" et de "), f("\\dfrac{1}{t-a}"), t(" : "), f("\\ln|t-a|")]),
        ligne(`=${formulePrimitiveEnTB(k)}`, [f("\\ln|a|-\\ln|b|=\\ln\\left|\\dfrac{a}{b}\\right|")]),
      ],
    };
  }
  const P = formulePrimitiveEnTB(k);
  const kd = k === 2 ? "" : `\\dfrac{${k}}{2}`;
  const qq = fractionLatex((t2 - k) * (t1 + k), (t2 + k) * (t1 - k));
  const ln = qq.includes("dfrac") ? `\\ln\\left(${qq}\\right)` : `\\ln(${qq})`;
  const L = e.primitiveEnTReference(t2) - e.primitiveEnTReference(t1);
  return {
    utilise: [t("On évalue la primitive en t entre les bornes en t trouvées à l'étape 1 "), f(`(t_1=${t1},\\ t_2=${t2})`), t(` ${C6}.`)],
    calcul: [
      ligne(`L=\\int_{${t1}}^{${t2}} ${formuleIntegrandeEnTB(k)}\\,dt`, "intégrale en t"),
      ligne(`=${crochet(P, `${t1}`, `${t2}`)}`, "primitive de l'étape précédente"),
      ligne(`=${moins(substituer(P, `${t2}`, "t"), substituer(P, `${t1}`, "t"))}`, "F(t₂) − F(t₁)"),
      ligne(`=${t2 - t1}+${kd}\\left(\\ln\\dfrac{${t2 - k}}{${t2 + k}}-\\ln\\dfrac{${t1 - k}}{${t1 + k}}\\right)`, "on regroupe (les quotients sont positifs)"),
      ligne(`=${t2 - t1}+${kd}${ln}`, [f("\\ln a-\\ln b=\\ln\\dfrac{a}{b}")]),
      ligne(`\\approx ${decimalLatex(L, 2)}`, "valeur approchée"),
    ],
    piege: "Évaluer la primitive en t aux bornes en x (a et b) au lieu des bornes en t.",
  };
}

function contenuC(e: ExerciceLongueurArcC, phase: PhaseLongueurArc): Contenu {
  const c = q(e.cNum, e.cDen);
  const k = q(e.kNum, e.kDen);
  const d = qMul(c, q(3, 2));
  const u = unPlusKxLatex(e);
  const cL = qL(c) === "1" ? "" : `${qL(c)}\\cdot `;
  if (phase === "cEcran1") {
    return {
      utilise: [t(`On dérive `), f("x^{3/2}"), t(" avec "), f("(x^k)'=kx^{k-1}"), t(", puis on élève au carré et on ajoute 1 "), t(C6), t(".")],
      calcul: [
        ligne(`f'(x)=${cL}\\dfrac{3}{2}x^{1/2}`, [f("(x^{3/2})'=\\dfrac{3}{2}x^{1/2}")]),
        ligne(`=${qL(d) === "1" ? "" : qL(d)}\\sqrt{x}`, [f("x^{1/2}=\\sqrt{x}")]),
        ligne(`[f'(x)]^2=${qP(d)}^2\\cdot x`, [f("(\\sqrt{x})^2=x")]),
        ligne(`=${qL(k) === "1" ? "" : qL(k)}x`),
        ligne(`1+[f'(x)]^2=${u}`),
      ],
    };
  }
  const inv = qDiv(q(1), k);
  const coef = coefPrimitiveC(e);
  if (phase === "cEcran2") {
    return {
      utilise: [t(`Racine d'une expression du premier degré : on pose `), f(`u=${u}`), t(", donc "), f(`du=${kLatexC(e)}\\,dx`), t(` ${C6}.`)],
      calcul: [
        ligne(`u=${u}`, "on pose"),
        ligne(`du=${kLatexC(e) === "1" ? "" : `${kLatexC(e)}\\,`}dx`, "on dérive"),
        ligne(`\\int\\sqrt{${u}}\\,dx=\\int\\sqrt{u}\\cdot ${qL(inv)}\\,du`, [f(`dx=${qL(inv)}\\,du`)]),
        ligne(`=${qL(inv) === "1" ? "" : `${qL(inv)}\\cdot `}\\dfrac{2}{3}u^{3/2}`, [t("primitive de "), f("u^{1/2}"), t(" : "), f("\\dfrac{2}{3}u^{3/2}")]),
        ligne(`=${coef}\\left(${u}\\right)^{3/2}`, [t("on revient à x : "), f(`u=${u}`)]),
      ],
      piege: "Oublier le facteur 1/k de la composée affine.",
    };
  }
  const { a, b } = e;
  const ub = qAdd(q(1), qMul(k, q(b)));
  const ua = qAdd(q(1), qMul(k, q(a)));
  const racineQ = (x: Q): Q => {
    const n = Math.round(Math.sqrt(Math.abs(x.n)));
    const dd = Math.round(Math.sqrt(x.d));
    return q(n, dd);
  };
  const rb = racineQ(ub);
  const ra = racineQ(ua);
  const coefQ = qDiv(q(2), qMul(q(3), k));
  const L = qMul(coefQ, qSub(qPow(rb, 3), qPow(ra, 3)));
  const P = `${coef}\\left(${u}\\right)^{3/2}`;
  const lignes: LigneCalcul[] = [
    ligne(`L=\\int_{${a}}^{${b}}\\sqrt{${u}}\\,dx`, "formule de la longueur d'arc"),
    ligne(`=${crochet(P, `${a}`, `${b}`)}`, "primitive de l'étape précédente"),
    ligne(`=${coef}\\left(${substituer(`\\left(${u}\\right)^{3/2}`, `${b}`)}-${substituer(`\\left(${u}\\right)^{3/2}`, `${a}`)}\\right)`, "F(b) − F(a)"),
    ligne(`=${coef}\\left(${qP(ub)}^{3/2}-${qP(ua)}^{3/2}\\right)`, "on calcule"),
    ligne(`=${coef}\\left(${qP(rb)}^{3}-${qP(ra)}^{3}\\right)`, [f(`${qP(ub)}=${qP(rb)}^2`), t(", donc "), f("(s^2)^{3/2}=s^3")]),
    ligne(`=${coef}\\cdot ${qP(qSub(qPow(rb, 3), qPow(ra, 3)))}`),
    ...lignesFin(qVal(L), null, "on réduit"),
  ];
  return { utilise: [t(`Longueur d'un arc ${C6} : `), f(FORMULE), t(", avec la primitive de l'étape précédente.")], calcul: lignes };
}

function contenu(e: ExerciceLongueurArc, phase: PhaseLongueurArc): Contenu {
  switch (e.famille) {
    case "A":
      return contenuA(e, phase);
    case "B":
      return contenuB(e, phase);
    case "C":
      return contenuC(e, phase);
  }
}

export function piegeLongueurArc(e: ExerciceLongueurArc, phase: PhaseLongueurArc): string | undefined {
  return contenu(e, phase).piege;
}

export function correctionDetailleeLongueurArc(e: ExerciceLongueurArc): EtapeCorrection[] {
  const phases = phasesPourExercice(e);
  return phases.flatMap((phase, i) => {
    const sq = LETTRES[i];
    const c = contenu(e, phase);
    const etapes: EtapeCorrection[] = [utilise(sq, c.utilise), calcul(sq, c.calcul)];
    const figure = i === phases.length - 1 ? { figureHtml: figureLongueurArcSvg(e) } : {};
    etapes.push({ ...resultat(sq, [f(formatReponseAttenduePhaseLatex(e, phase).join(",\\quad "))]), ...figure });
    if (c.piege) etapes.push(piege(sq, [t(c.piege)]));
    return etapes;
  });
}
