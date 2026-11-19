import type { EtapeCorrection, FragmentConsigne, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege as piegeLigne, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import type { ExerciceDetectiveLogarithmes } from "../../core6e/detectiveLogarithmes.types";
import { BASES_B2, TABLE_B1, TABLE_D1, TABLE_K1, TABLE_K2, affine, descriptionCorrecte, ePuissance, indiceLigneFausse, logBase, parN, signe, typeErreur, valeursAttendues } from "../../moteur6e/modeleDetectiveLogarithmes";
import { rat, ratLatex } from "../../moteur6e/modeleDetectiveIntegrales";
import { descriptionFragments, piege, valeurFragments } from "../../ui6e/formatDetectiveLogarithmes";
import { COURS_DERIVEE, COURS_EQUATIONS, COURS_INEQUATIONS, COURS_PROPRIETES } from "../../ui6e/corrigeLogarithmes2";

/**
 * Corrigé détaillé « comme au tableau » de `6gen88` (le détective d'erreurs : logarithmes) — règle
 * `.claude/rules/feuilles-evaluations.md`. Trois étapes = trois écrans : a) la ligne fausse
 * (contre-exemple numérique ou condition d'existence testée ligne à ligne), b) l'erreur (règle
 * fausse « ≠ » contre règle juste « = »), c) la résolution reprise à partir de la ligne fausse, une
 * transformation par ligne. Nombres tirés de l'instance (`donnees`, tables du modèle) ; résultat
 * final : `valeursAttendues` (même source que l'écran 3).
 */

type E = ExerciceDetectiveLogarithmes;
const t = texte;
const f = latex;

const eP = (k: number): string => ePuissance(rat(k));
const R_POS = "\\mathopen{]}0\\,;+\\infty\\mathclose{[}";

interface Contenu {
  test: { utilise: FragmentConsigne[]; lignes: LigneCalcul[] };
  regle: { utilise: FragmentConsigne[]; lignes: LigneCalcul[] };
  correction: { utilise: FragmentConsigne[]; lignes: LigneCalcul[] };
}

const UTILISE_TEST: FragmentConsigne[] = [t("On contrôle chaque ligne : une égalité doit rester vraie pour toute valeur de x où elle a un sens ; un contre-exemple numérique, ou une valeur qui vérifie l'énoncé mais pas la ligne, la condamne.")];

function contenu(e: E): Contenu {
  const d = e.donnees;
  switch (e.scenario) {
    case "S1": {
      const { a, b } = d as { a: number; b: number };
      return {
        test: { utilise: UTILISE_TEST, lignes: [ligne(`\\ln(1+${a})=\\ln(${1 + a})`, "membre de gauche de la ligne 2 pour x = 1"), ligne(`\\ln(1)+\\ln(${a})=\\ln(${a})`, "membre de droite pour x = 1 : ln(1) = 0"), ligne(`\\ln(${1 + a})\\neq\\ln(${a})`, "les deux membres diffèrent")] },
        regle: { utilise: [t(`Le logarithme transforme un produit en somme : `), f("\\ln(xy)=\\ln(x)+\\ln(y)"), t(` ; il n'y a aucune règle pour le logarithme d'une somme ${COURS_PROPRIETES}.`)], lignes: [ligne(`\\ln(x+${a})\\neq\\ln(x)+\\ln(${a})`, "règle inventée par la copie"), ligne(`\\ln(${a}x)=\\ln(${a})+\\ln(x)`, "la vraie règle porte sur un produit")] },
        correction: {
          utilise: [t("Par définition du logarithme, "), f("\\ln(X)=b\\iff X=e^{b}"), t(` ; on vérifie ensuite la CE ${COURS_EQUATIONS}.`)],
          lignes: [ligne(`\\ln(x+${a})=${b}`, "équation de départ"), ligne(`x+${a}=${eP(b)}`, "on applique exp"), ligne(`x=${eP(b)}-${a}`, `on retranche ${a}`), ligne(`${eP(b)}-${a}>-${a}`, `CE x > −${a} vérifiée`)],
        },
      };
    }
    case "S2": {
      const { k, m } = d as { k: number; m: number };
      const ek = eP(k);
      return {
        test: { utilise: UTILISE_TEST, lignes: [ligne(`\\ln(${ek}\\cdot 1)=${k}`, "membre de gauche de la ligne 2 pour x = 1"), ligne(`${k}\\ln(1)=0`, "membre de droite pour x = 1"), ligne(`${k}\\neq 0`, "les deux membres diffèrent")] },
        regle: { utilise: [t("Le logarithme d'un produit est la somme des logarithmes : "), f("\\ln(xy)=\\ln(x)+\\ln(y)"), t(` ${COURS_PROPRIETES}.`)], lignes: [ligne(`\\ln(${ek}x)\\neq\\ln(${ek})\\cdot\\ln(x)`, "produit des logarithmes : faux"), ligne(`\\ln(${ek}x)=\\ln(${ek})+\\ln(x)`, "somme des logarithmes")] },
        correction: {
          utilise: [f("\\ln(xy)=\\ln(x)+\\ln(y)"), t(" et "), f("\\ln\\left(e^{k}\\right)=k"), t(", puis "), f("\\ln(x)=c\\iff x=e^{c}"), t(` ${COURS_EQUATIONS}.`)],
          lignes: [ligne(`\\ln(${ek}x)=\\ln(${ek})+\\ln(x)`, "logarithme d'un produit"), ligne(`=${k}+\\ln(x)`, [f("\\ln\\left(e^{k}\\right)=k")]), ligne(`${k}+\\ln(x)=${m}`, "l'équation s'écrit"), ligne(`\\ln(x)=${m - k}`, `on retranche ${k}`), ligne(`x=${eP(m - k)}`, "on applique exp ; x > 0 : CE vérifiée")],
        },
      };
    }
    case "C1": {
      const { a } = d as { a: number };
      const A = a * a;
      return {
        test: { utilise: UTILISE_TEST, lignes: [ligne(`\\ln\\left((-${a})^{2}\\right)=\\ln(${A})`, `x = −${a} vérifie l'équation de départ`), ligne(`-${a}\\notin ${R_POS}`, "mais 2 ln(x) n'existe pas en x < 0 : la ligne 2 perd cette solution")] },
        regle: { utilise: [f("\\ln(x^{2})"), t(" existe pour tout "), f("x\\neq 0"), t(", alors que "), f("\\ln(x)"), t(` exige x > 0 : la règle de la puissance demande une valeur absolue ${COURS_PROPRIETES}.`)], lignes: [ligne("\\ln(x^{2})\\neq 2\\ln(x)", "faux pour x < 0"), ligne("\\ln(x^{2})=2\\ln|x|", "pour tout x ≠ 0")] },
        correction: {
          utilise: [f("\\ln(x^{2})=2\\ln|x|"), t(" pour tout "), f("x\\neq 0"), t(`, puis ln est injective ${COURS_EQUATIONS}.`)],
          lignes: [ligne(`2\\ln|x|=\\ln(${A})`, "ligne 2 corrigée"), ligne(`\\ln|x|=\\dfrac{\\ln(${A})}{2}`, "on divise par 2"), ligne(`=\\ln(${a})`, `ln(${A}) = 2 ln(${a})`), ligne(`|x|=${a}`, "ln est injective"), ligne(`x=\\pm ${a}`, "deux valeurs non nulles : CE vérifiée")],
        },
      };
    }
    case "C2": {
      const { k, s } = d as { k: number; s: number };
      const lt = `${signe(s, "<")} `;
      const ek = eP(k);
      return {
        test: { utilise: UTILISE_TEST, lignes: [ligne("\\ln\\left((-1)^{2}\\right)=0", "x = −1 dans l'inéquation de départ"), ligne(`0${lt}${2 * k}`, "−1 vérifie l'inéquation de départ"), ligne(`-1\\notin ${R_POS}`, "mais 2 ln(x) n'existe pas en x = −1")] },
        regle: { utilise: [f("\\ln(x^{2})"), t(" existe pour tout "), f("x\\neq 0"), t(", alors que "), f("\\ln(x)"), t(` exige x > 0 ${COURS_PROPRIETES}.`)], lignes: [ligne("\\ln(x^{2})\\neq 2\\ln(x)", "faux pour x < 0"), ligne("\\ln(x^{2})=2\\ln|x|", "pour tout x ≠ 0")] },
        correction: {
          utilise: [f("\\ln(x^{2})=2\\ln|x|"), t(" pour tout "), f("x\\neq 0"), t(`, puis exp, strictement croissante, conserve le sens ${COURS_INEQUATIONS}.`)],
          lignes: [ligne(`2\\ln|x|${lt}${2 * k}`, "ligne 1 corrigée"), ligne(`\\ln|x|${lt}${k}`, "on divise par 2"), ligne(`0<|x|${lt}${ek}`, "on applique exp, et x ≠ 0"), ligne(`-${ek}${lt}x${lt}${ek}`, "|x| ≤ c ⟺ −c ≤ x ≤ c, avec x ≠ 0".replace(/≤/g, s === 1 ? "≤" : "<"))],
        },
      };
    }
    case "D1": {
      const { base, q, r, s } = TABLE_D1[d.i!]!;
      const p = r - s;
      const N = base ** q;
      const lg = logBase(base);
      return {
        test: { utilise: UTILISE_TEST, lignes: [ligne(`(-${s})(-${s}-${p})=${s * r}`, `x = −${s} dans la CE regroupée de la ligne 2`), ligne(`${s * r}>0`, "la CE de la copie accepte −" + s), ligne(`-${s}\\notin ${R_POS}`, [t("mais "), f(`${lg}(-${s})`), t(" n'existe pas dans l'équation de départ")])] },
        regle: { utilise: [t(`La CE se lit sur l'équation de départ : chaque logarithme doit exister ; regrouper les logarithmes élargit le domaine ${COURS_EQUATIONS}.`)], lignes: [ligne(`x(x-${p})>0`, "CE de la copie, lue après regroupement"), ligne("x>0", [f(`${lg}(x)`), t(" existe")]), ligne(`x-${p}>0`, [f(`${lg}(x-${p})`), t(" existe")])] },
        correction: {
          utilise: [t("CE de l'équation de départ, puis la résolution de la copie (lignes 1 et 3), dont on ne garde que les solutions qui vérifient la CE " + COURS_EQUATIONS + ".")],
          lignes: [ligne("x>0", [f(`${lg}(x)`), t(" existe")]), ligne(`x-${p}>0`, [f(`${lg}(x-${p})`), t(" existe")]), ligne(`x>${p}`, "CE"), ligne(`x^{2}-${p}x-${N}=0`, "lignes 1 et 3 de la copie"), ligne(`(x-${r})(x+${s})=0`, "factorisation"), ligne(`${r}>${p}`, `x = ${r} vérifie la CE`), ligne(`-${s}<${p}`, `x = −${s} est rejetée`)],
        },
      };
    }
    case "D2": {
      const { r } = d as { r: number };
      const s = r - 1;
      const nn = r * s;
      return {
        test: { utilise: UTILISE_TEST, lignes: [ligne(`x=-${s}`, "valeur gardée par la ligne 4"), ligne(`-${s}\\notin ${R_POS}`, `2 ln(x) n'existe pas en x = −${s}`)] },
        regle: { utilise: [t(`La CE se lit sur l'équation de départ, avant de regrouper les logarithmes ; chaque solution doit la vérifier ${COURS_EQUATIONS}.`)], lignes: [ligne("x>0", "ln(x) existe"), ligne(`x+${nn}>0`, `ln(x + ${nn}) existe`), ligne(`-${s}<0`, `x = −${s} ne vérifie pas la CE : solution parasite`)] },
        correction: {
          utilise: [t("CE de l'équation de départ, puis tri des solutions de la copie et vérification " + COURS_EQUATIONS + ".")],
          lignes: [ligne("x>0", `CE : ln(x) et ln(x + ${nn}) existent`), ligne(`-${s}\\notin ${R_POS}`, "rejetée"), ligne(`2\\ln(${r})=\\ln(${r * r})`, `vérification de x = ${r}`), ligne(`=\\ln(${r}+${nn})`, `${r * r} = ${r} + ${nn}`)],
        },
      };
    }
    case "B1": {
      const { d: den, n: k } = TABLE_B1[d.i!]!;
      const { p, s } = d as { p: number; s: number };
      const M = den ** k;
      const base = `\\log_{1/${den}}`;
      const gt = `${signe(s, ">")} `;
      const lt = `${signe(s, "<")} `;
      return {
        test: { utilise: UTILISE_TEST, lignes: [ligne(`${base}(1)=0`, "une valeur test"), ligne(`${base}(${den})=-1`, `car (1/${den})⁻¹ = ${den}`), ligne(`1<${den}`, "arguments dans l'ordre croissant…"), ligne(`${base}(1)>${base}(${den})`, "…logarithmes dans l'ordre inverse : ligne 2 fausse")] },
        regle: { utilise: [t("Pour une base comprise entre 0 et 1, le logarithme est strictement décroissant : on supprime les logarithmes en inversant le sens " + COURS_INEQUATIONS + ".")], lignes: [ligne(`0<\\frac{1}{${den}}<1`, "base"), ligne(`x_1<x_2\\Rightarrow ${base}(x_1)>${base}(x_2)`, "logarithme décroissant")] },
        correction: {
          utilise: [t("CE "), f(`x>${p}`), t(", puis le logarithme de base "), f(`\\frac{1}{${den}}`), t(" est décroissant : le sens s'inverse " + COURS_INEQUATIONS + ".")],
          lignes: [ligne(`${base}(x-${p})${gt}-${k}`, "inéquation de départ"), ligne(`x-${p}${lt}\\left(\\frac{1}{${den}}\\right)^{-${k}}`, "base entre 0 et 1 : le sens s'inverse"), ligne(`=${M}`), ligne(`x${lt}${p + M}`, `on ajoute ${p}`), ligne(`x>${p}`, "CE")],
        },
      };
    }
    case "B2": {
      const { j, b, c, s } = d as { j: number; b: number; c: number; s: number };
      const bL = BASES_B2[j]!;
      const base = `\\log_{${bL}}`;
      const inv = j === 0 ? 2 : 5;
      const lt = `${signe(s, "<")} `;
      const gt = `${signe(s, ">")} `;
      const deux = affine(2, -b);
      return {
        test: { utilise: UTILISE_TEST, lignes: [ligne(`${base}(1)=0`, "une valeur test"), ligne(`${base}(${inv})=-1`, `car ${bL.replace("{,}", ",")} × ${inv} = 1`), ligne(`${base}(1)>${base}(${inv})`, `1 < ${inv} mais l'ordre s'inverse : ligne 2 fausse`)] },
        regle: { utilise: [t("Pour une base comprise entre 0 et 1, le logarithme est strictement décroissant : on supprime les logarithmes en inversant le sens " + COURS_INEQUATIONS + ".")], lignes: [ligne(`0<${bL}<1`, "base"), ligne(`x_1<x_2\\Rightarrow ${base}(x_1)>${base}(x_2)`, "logarithme décroissant")] },
        correction: {
          utilise: [t("CE, puis le logarithme de base "), f(bL), t(" est décroissant : le sens s'inverse " + COURS_INEQUATIONS + ".")],
          lignes: [ligne(`${base}(${deux})${lt}${base}(x+${c})`, "inéquation de départ"), ligne(`${deux}${gt}x+${c}`, "base entre 0 et 1 : le sens s'inverse"), ligne(`x${gt}${b + c}`, `on retranche x et on ajoute ${b}`), ligne(`x>${ratLatex(rat(b, 2))}`, "CE (la plus forte des deux)"), ligne(`${b + c}>${ratLatex(rat(b, 2))}`, "la borne trouvée respecte la CE")],
        },
      };
    }
    case "P1": {
      const { m } = d as { m: number };
      const M = m * m;
      return {
        test: { utilise: UTILISE_TEST, lignes: [ligne("(\\ln(e))^{2}=1", "membre de gauche de la ligne 2 pour x = e"), ligne("2\\ln(e)=2", "membre de droite pour x = e"), ligne("1\\neq 2", "les deux membres diffèrent")] },
        regle: { utilise: [f("(\\ln(x))^{2}"), t(" est le carré du logarithme ; seul "), f("\\ln(x^{2})"), t(` vaut 2 ln(x) ${COURS_PROPRIETES}.`)], lignes: [ligne("(\\ln(x))^{2}=\\ln(x)\\cdot\\ln(x)", "carré du logarithme"), ligne("(\\ln(x))^{2}\\neq 2\\ln(x)", "2 ln(x) = ln(x²)")] },
        correction: {
          utilise: [t("On pose "), f("t=\\ln(x)"), t(", on résout l'équation du second degré en t, puis "), f("\\ln(x)=t\\iff x=e^{t}"), t(` ${COURS_EQUATIONS}.`)],
          lignes: [ligne(`t^{2}=${M}`, "avec t = ln(x)"), ligne(`t_1=-${m}`, `racines carrées de ${M}`), ligne(`t_2=${m}`), ligne(`x_1=${eP(-m)}`, "x = eᵗ"), ligne(`x_2=${eP(m)}`, "deux nombres strictement positifs : CE vérifiée")],
        },
      };
    }
    case "P2": {
      const { k } = d as { k: number };
      const ek = eP(k);
      return {
        test: { utilise: UTILISE_TEST, lignes: [ligne("f(e)=(\\ln(e))^{2}", "ligne 2 pour x = e"), ligne("=1"), ligne("2\\ln(e)=2", "membre de droite pour x = e"), ligne("1\\neq 2", "les deux membres diffèrent")] },
        regle: { utilise: [f("(\\ln(x))^{2}"), t(" est le carré de "), f("u=\\ln(x)"), t(` : on dérive avec la règle de la puissance ${COURS_DERIVEE}.`)], lignes: [ligne("(\\ln(x))^{2}\\neq 2\\ln(x)", "confusion avec ln(x²)"), ligne("(u^{2})'=2u\\,u'", "dérivée d'un carré")] },
        correction: {
          utilise: [f("(u^{2})'=2u\\,u'"), t(" avec "), f("u=\\ln(x)"), t(", "), f("u'=\\dfrac{1}{x}"), t(` ${COURS_DERIVEE}.`)],
          lignes: [ligne("f'(x)=2\\ln(x)\\cdot\\dfrac{1}{x}", "(u²)′ = 2u u′"), ligne("=\\dfrac{2\\ln(x)}{x}"), ligne(`f'(${ek})=\\dfrac{2\\ln(${ek})}{${ek}}`, `on remplace x par ${ek.replace(/[{}]/g, "").replace("^", "")}`), ligne(`=\\dfrac{${2 * k}}{${ek}}`, [f("\\ln\\left(e^{k}\\right)=k")]), ligne(`=${2 * k}${eP(-k)}`)],
        },
      };
    }
    case "Q1": {
      const { a, q } = d as { a: number; q: number };
      return {
        test: { utilise: UTILISE_TEST, lignes: [ligne(`\\dfrac{\\ln(${a})}{\\ln(${a})}=1`, `membre de gauche de la ligne 2 pour x = ${a}`), ligne(`${a}-${a}=0`, `ln(x − ${a}) n'existe pas en x = ${a} : égalité impossible`)] },
        regle: { utilise: [t("Seule la différence de deux logarithmes donne le logarithme d'un quotient ; un quotient de logarithmes est un changement de base " + COURS_PROPRIETES + ".")], lignes: [ligne(`\\dfrac{\\ln(x)}{\\ln(${a})}\\neq\\ln(x-${a})`, "règle inventée"), ligne(`\\dfrac{\\ln(x)}{\\ln(${a})}=\\log_{${a}}(x)`, "changement de base")] },
        correction: {
          utilise: [t("Changement de base, puis "), f("\\log_a(x)=q\\iff x=a^{q}"), t(` ${COURS_EQUATIONS}.`)],
          lignes: [ligne(`\\dfrac{\\ln(x)}{\\ln(${a})}=\\log_{${a}}(x)`, "changement de base"), ligne(`\\log_{${a}}(x)=${q}`, "l'équation s'écrit"), ligne(`x=${a}^{${q}}`, "définition du logarithme"), ligne(`=${a ** q}`, "x > 0 : CE vérifiée")],
        },
      };
    }
    case "Q2": {
      const { n: k } = d as { n: number };
      const X = 2 ** (k + 1);
      const Y = 2 ** k;
      return {
        test: { utilise: UTILISE_TEST, lignes: [ligne(`\\log_2(${X})=${k + 1}`, `2^${k + 1} = ${X}`.replace(/\^(\d+)/, (_, x) => sup(x))), ligne(`\\log_2(${Y})=${k}`), ligne(`\\dfrac{${k + 1}}{${k}}\\neq ${k}`, `le quotient ne vaut pas log₂(${X - Y}) = ${k}`)] },
        regle: { utilise: [t("Seule la différence de deux logarithmes donne le logarithme d'un quotient " + COURS_PROPRIETES + ".")], lignes: [ligne(`\\dfrac{\\log_2(${X})}{\\log_2(${Y})}\\neq\\log_2(${X}-${Y})`, "règle inventée"), ligne(`\\log_2(${X})-\\log_2(${Y})=\\log_2\\left(\\dfrac{${X}}{${Y}}\\right)`, "la vraie règle : différence → quotient")] },
        correction: {
          utilise: [t("On calcule chaque logarithme avec "), f("\\log_2\\left(2^{n}\\right)=n"), t(`, puis le quotient ${COURS_PROPRIETES}.`)],
          lignes: [ligne(`\\log_2(${X})=${k + 1}`, `${X} = 2${sup(String(k + 1))}`), ligne(`\\log_2(${Y})=${k}`, `${Y} = 2${sup(String(k))}`), ligne(`\\dfrac{\\log_2(${X})}{\\log_2(${Y})}=\\dfrac{${k + 1}}{${k}}`, "on remplace")],
        },
      };
    }
    case "V1": {
      const { c, x0 } = d as { c: number; x0: number };
      const D = x0 * x0 + c;
      return {
        test: { utilise: [t("On compare la ligne 2 à la règle de dérivation "), f("(\\ln(u))'=\\dfrac{u'}{u}"), t(` ${COURS_DERIVEE}.`)], lignes: [ligne(`u(x)=x^{2}+${c}`, "argument du logarithme"), ligne("u'(x)=2x", "absent de la ligne 2"), ligne(`\\dfrac{1}{x^{2}+${c}}\\neq\\dfrac{2x}{x^{2}+${c}}`, "la ligne 2 est fausse")] },
        regle: { utilise: [t("Règle de la chaîne : "), f("(\\ln(u))'=\\dfrac{u'}{u}"), t(` ${COURS_DERIVEE}.`)], lignes: [ligne("(\\ln(u))'\\neq\\dfrac{1}{u}", "dérivée intérieure oubliée"), ligne("(\\ln(u))'=\\dfrac{u'}{u}", "règle de la chaîne")] },
        correction: {
          utilise: [f("(\\ln(u))'=\\dfrac{u'}{u}"), t(" avec "), f(`u(x)=x^{2}+${c}`), t(`, puis on remplace x par ${String(x0).replace("-", "−")} ${COURS_DERIVEE}.`)],
          lignes: [ligne("f'(x)=\\dfrac{u'(x)}{u(x)}", "règle de la chaîne"), ligne(`=\\dfrac{2x}{x^{2}+${c}}`), ligne(`f'(${x0})=\\dfrac{2\\cdot ${parN(x0)}}{${parN(x0)}^{2}+${c}}`, `on remplace x par ${String(x0).replace("-", "−")}`), ligne(`=${ratLatex(rat(2 * x0, D))}`)],
        },
      };
    }
    case "V2": {
      const { a, x0 } = d as { a: number; x0: number };
      const b = 1 - a * x0;
      const u = affine(a, b);
      return {
        test: { utilise: [t("On compare la ligne 2 à la règle de dérivation "), f("(\\ln(u))'=\\dfrac{u'}{u}"), t(` ${COURS_DERIVEE}.`)], lignes: [ligne(`u(x)=${u}`, "argument du logarithme"), ligne(`u'(x)=${a}`, "absent de la ligne 2"), ligne(`\\dfrac{1}{${u}}\\neq\\dfrac{${a}}{${u}}`, "la ligne 2 est fausse")] },
        regle: { utilise: [t("Règle de la chaîne : "), f("(\\ln(u))'=\\dfrac{u'}{u}"), t(` ${COURS_DERIVEE}.`)], lignes: [ligne("(\\ln(u))'\\neq\\dfrac{1}{u}", "dérivée intérieure oubliée"), ligne("(\\ln(u))'=\\dfrac{u'}{u}", "règle de la chaîne")] },
        correction: {
          utilise: [f("(\\ln(u))'=\\dfrac{u'}{u}"), t(", puis la tangente "), f("y=f'(x_0)(x-x_0)+f(x_0)"), t(` ${COURS_DERIVEE}.`)],
          lignes: [
            ligne(`f'(x)=\\dfrac{${a}}{${u}}`, `u′(x) = ${a}`),
            ligne(`f(${x0})=\\ln(1)`, "argument égal à 1"),
            ligne("=0"),
            ligne(`f'(${x0})=\\dfrac{${a}}{1}`, "argument égal à 1"),
            ligne(`=${a}`),
            ligne(`y=${a}(${affine(1, -x0)})+0`, "équation de la tangente"),
            ligne(`y=${affine(a, -a * x0)}`, "on développe"),
          ],
        },
      };
    }
    case "K1": {
      const [a, b] = TABLE_K1[d.i!]!;
      return {
        test: { utilise: UTILISE_TEST, lignes: [ligne(`\\ln(${a})<\\ln(${b})`, `ln est croissante et ${a} < ${b}`), ligne(`\\dfrac{\\ln(${a})}{\\ln(${b})}<1`, "le quotient de la copie est inférieur à 1"), ligne(`${a}^{1}=${a}<${b}`, "or x = 1 ne suffit pas : la solution dépasse 1")] },
        regle: { utilise: [t("Changement de base : le logarithme de l'argument au numérateur, celui de la base au dénominateur " + COURS_PROPRIETES + ".")], lignes: [ligne(`\\log_{${a}}(${b})\\neq\\dfrac{\\ln(${a})}{\\ln(${b})}`, "quotient retourné"), ligne(`\\log_{${a}}(${b})=\\dfrac{\\ln(${b})}{\\ln(${a})}`, "changement de base")] },
        correction: {
          utilise: [f(`${a}^{x}=${b}\\iff x=\\log_{${a}}(${b})`), t(", puis "), f("\\log_a(x)=\\dfrac{\\ln(x)}{\\ln(a)}"), t(` ${COURS_EQUATIONS}.`)],
          lignes: [ligne(`x=\\log_{${a}}(${b})`, "définition du logarithme"), ligne(`=\\dfrac{\\ln(${b})}{\\ln(${a})}`, "changement de base")],
        },
      };
    }
    case "K2": {
      const { c, p, q } = TABLE_K2[d.i!]!;
      const B = c ** p;
      const A = c ** q;
      return {
        test: {
          utilise: UTILISE_TEST,
          lignes: [ligne(`${B}^{r}=${A}`, `définition : r = log en base ${B} de ${A}`), ligne(`${c}^{${p}r}=${c}^{${q}}`, `${B} = ${c}${sup(String(p))}, ${A} = ${c}${sup(String(q))}`), ligne(`r=${ratLatex(rat(q, p))}`, "mêmes exposants"), ligne(`${ratLatex(rat(q, p))}\\neq ${ratLatex(rat(p, q))}`, "la copie trouve l'inverse")],
        },
        regle: { utilise: [t("Changement de base : le logarithme de l'argument au numérateur, celui de la base au dénominateur " + COURS_PROPRIETES + ".")], lignes: [ligne(`\\log_{${B}}(${A})\\neq\\dfrac{\\ln(${B})}{\\ln(${A})}`, "quotient retourné"), ligne(`\\log_{${B}}(${A})=\\dfrac{\\ln(${A})}{\\ln(${B})}`, "changement de base")] },
        correction: {
          utilise: [t("Changement de base, puis "), f("\\ln\\left(c^{n}\\right)=n\\ln(c)"), t(` ${COURS_PROPRIETES}.`)],
          lignes: [ligne(`\\log_{${B}}(${A})=\\dfrac{\\ln(${A})}{\\ln(${B})}`, "changement de base"), ligne(`=\\dfrac{\\ln(${c}^{${q}})}{\\ln(${c}^{${p}})}`, "puissances de " + c), ligne(`=\\dfrac{${q}\\ln(${c})}{${p}\\ln(${c})}`, "ln(cⁿ) = n ln(c)"), ligne(`=${ratLatex(rat(q, p))}`, "on simplifie par ln(" + c + ")")],
        },
      };
    }
  }
}

const EXP = ["⁰", "¹", "²", "³", "⁴", "⁵", "⁶", "⁷", "⁸", "⁹"];
function sup(n: string): string {
  return n.split("").map((x) => EXP[Number(x)] ?? x).join("");
}

export function correctionDetailleeDetectiveLogarithmes(e: E): EtapeCorrection[] {
  const n = indiceLigneFausse(e) + 1;
  const c = contenu(e);
  const valeurs = valeursAttendues(e).flatMap((v, i) => (i === 0 ? valeurFragments(v) : [t(" ; "), ...valeurFragments(v)]));
  const verif: EtapeCorrection[] =
    typeErreur(e) === "domaine" || typeErreur(e) === "carre" || typeErreur(e) === "puissance"
      ? [verification("c", [t("Chaque valeur gardée vérifie la condition d'existence de l'énoncé de départ.")])]
      : [];
  return [
    utilise("a", c.test.utilise),
    calcul("a", c.test.lignes),
    resultat("a", [t(`La ligne ${n} est fausse.`)]),
    utilise("b", c.regle.utilise),
    calcul("b", c.regle.lignes),
    resultat("b", descriptionFragments(descriptionCorrecte(e), e)),
    piegeLigne("b", piege(e)),
    utilise("c", c.correction.utilise),
    calcul("c", c.correction.lignes, [t(`On reprend à partir de la ligne ${n} :`)]),
    resultat("c", valeurs),
    ...verif,
  ];
}
