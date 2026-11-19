import type {
  ExerciceCalculPrimitives,
  ExerciceFamilleA,
  ExerciceFamilleB,
  ExerciceFamilleC,
  ExerciceFamilleD,
  ExerciceFamilleE,
  ExerciceFamilleF,
  ExerciceFamilleG,
} from "../../core6e/calculPrimitives.types";
import type { EtapeCorrection, FragmentConsigne, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import type { PhaseCalculPrimitives } from "../../moteur6e/typesCalculPrimitives";
import { phasesPourExercice } from "../../moteur6e/typesCalculPrimitives";
import {
  FORMULE_PRIMITIVE_TERME,
  argumentK,
  carreCompleteG4,
  cycloLatex,
  decompositionNumeriqueG,
  decompositionPoseeG,
  denominateurG1,
  denominateurG4,
  facteurAffine,
  facteurLatexB,
  formatReponseAttenduePhaseLatex,
  formeReecriteA,
  formeReecriteF,
  fractionSignee,
  gCorpsLatex,
  gPrimitiveLatexB,
  integrandeLatex,
  numerateurG1,
  numerateurG3,
  piecesC,
  piecesD,
  piecesE,
  primitiveLatex,
  radicalC1,
  termeFLatexA,
  termePrimitiveLatexA,
  uLatexB,
  uPrimeLatexB,
} from "../../ui6e/formatCalculPrimitives";
import { coefDevant, monome, polynomeLatex, puissanceX, sommeLatex, xPlus } from "../../ui6e/formatMonome";
import { cours, par, q, qP, qTerme } from "../../ui6e/corrigeIntegrales1";

/**
 * Corrigé détaillé « comme au tableau » de `6gen23` (calcul de primitives) — règle
 * `.claude/rules/feuilles-evaluations.md` (« Corrigé détaillé — comme au tableau »). Une étape par
 * écran (`phasesPourExercice`) : Ce qu'on utilise → Calcul (une transformation par ligne) →
 * Résultat (la réponse de l'écran, `formatReponseAttenduePhaseLatex`) → Vérification (dernière
 * étape : on dérive) → Piège (sur l'étape où il se commet). Valeurs tirées des paramètres de
 * l'instance et des pièces de l'écran (`piecesC`, `piecesD`, `piecesE`, `formeReecriteA/F`…).
 *
 * `etapesPhasePrimitive` est réutilisé tel quel par 6gen24 et 6gen25, dont les premiers écrans sont
 * ceux de 6gen23. Sans `docx` : importé aussi par `App6gen23/24/25.tsx` (étape échouée).
 */

type Fr = FragmentConsigne[];
const t = (s: string): FragmentConsigne => texte(s);
const f = (s: string): FragmentConsigne => latex(s);
const C1 = cours(1);

/** « \int corps\,dx », avec parenthèses si le corps est une somme ou commence par « − ». */
function intg(corps: string, v = "x"): string {
  const p = par(corps);
  return p === corps ? `\\int ${corps}\\,d${v}` : `\\int${p}\\,d${v}`;
}

/** Facteur devant un produit : « 3\cdot », « -3\cdot », « - » (−1), « » (1). */
function facteur(num: number, den = 1): string {
  const c = coefDevant(num, den);
  if (c === "" || c === "-") return c;
  return `${c}\\cdot `;
}

function jPrimitive(fx: string, Fx: string): Fr {
  return [t("primitive de "), f(fx), t(" : "), f(Fx)];
}

// ============================================================================
// Pièges (une ligne ciblée, sur l'étape où l'erreur se commet).
// ============================================================================

export function piegePrimitive(e: ExerciceCalculPrimitives): string {
  switch (e.famille) {
    case "A":
      if (e.sousType === "direct") {
        return e.termes.some((x) => x.type === "invX")
          ? "Oublier la valeur absolue : une primitive de 1/x est ln|x|, car 1/x est aussi définie pour x < 0."
          : "Oublier de diviser par l'exposant augmenté de 1, ou se tromper de signe sur une primitive usuelle.";
      }
      return e.sousType === "diviserFraction"
        ? "Primitiver séparément le numérateur et le dénominateur : il faut d'abord diviser chaque terme."
        : "Multiplier les exposants au lieu de les additionner : dans x·√x, l'exposant de x vaut 1 + 1/2 = 3/2.";
    case "B":
      return "Oublier le facteur λ, ou diviser par u′(x) au lieu d'ajuster le coefficient.";
    case "C":
      return "Laisser des x dans l'intégrale en u (dx aussi doit être remplacé), ou oublier de revenir à x.";
    case "D":
      if (e.sousType === "5") return "Se lancer dans une intégration par parties : le produit de deux exponentielles est une seule exponentielle.";
      if (e.sousType === "2") return "S'arrêter après la première intégration par parties : l'intégrale restante en demande une seconde.";
      if (e.sousType === "4") return "Faire la seconde intégration par parties en inversant les rôles : on retombe sur une identité sans intérêt.";
      return "Choisir u et dv à l'envers : l'intégrale restante devient plus compliquée au lieu de se simplifier.";
    case "E":
      return "Oublier de remplacer dx (le facteur de dθ), ou revenir à x sans le triangle rectangle de référence.";
    case "F":
      if (e.sousType === "tan") return "Oublier le signe moins : une primitive de tan(x) est −ln|cos(x)|.";
      if (e.sousType === "angleDoubleSin" || e.sousType === "angleDoubleCos") return "Se tromper de signe dans la formule de duplication : sin²(x) = (1 − cos(2x))/2 et cos²(x) = (1 + cos(2x))/2.";
      return "Primitiver une puissance de sin ou de cos sans la réécrire : seule la forme u′·g(u) se primitive directement.";
    case "G":
      return "Oublier la valeur absolue dans les logarithmes, ou identifier les coefficients sans vérifier la décomposition.";
  }
}

/** Étape (écran) où le piège se commet. */
function phasePiege(e: ExerciceCalculPrimitives): PhaseCalculPrimitives {
  switch (e.famille) {
    case "A":
      return e.sousType === "direct" ? "aEcranDirect" : "aEcran1";
    case "B":
      return "bEcran2";
    case "C":
      return "cEcran2";
    case "D":
      if (e.sousType === "5") return "dEcranDirect";
      return e.sousType === "2" || e.sousType === "4" ? "dEcran4" : "dEcran1";
    case "E":
      return "eEcran3";
    case "F":
      return e.sousType === "tan" ? "fEcran2" : "fEcran1";
    case "G":
      return "gEcran4";
  }
}

interface Contenu {
  utilise: Fr;
  calcul: LigneCalcul[];
}

// ============================================================================
// Famille A — primitives immédiates.
// ============================================================================

function lignesTermeA(e: Extract<ExerciceFamilleA, { sousType: "direct" }>, i: number): LigneCalcul[] {
  const terme = e.termes[i];
  const fx = termeFLatexA(terme, true);
  const Fx = termePrimitiveLatexA(terme, true);
  if (terme.type === "puissance") {
    const n = terme.n as number;
    const brut = `${facteur(terme.coef)}\\dfrac{${puissanceX(n + 1)}}{${n + 1}}`;
    const lignes = [ligne(`${intg(fx)}=${brut}`, jPrimitive(puissanceX(n), `\\dfrac{${puissanceX(n + 1)}}{${n + 1}}`))];
    if (brut !== Fx) lignes.push(ligne(`=${Fx}`, "on simplifie"));
    return lignes;
  }
  if (terme.type === "constante") return [ligne(`${intg(fx)}=${Fx}`, jPrimitive("k", "kx"))];
  return [ligne(`${intg(fx)}=${Fx}`, [t("primitive usuelle "), f(FORMULE_PRIMITIVE_TERME[terme.type])])];
}

/** Primitive d'un monôme c·x^(num/den) : brut (division par l'exposant augmenté de 1), puis simplifié. */
function lignesMonomeA(c: number, num: number, den: number): LigneCalcul[] {
  const fx = monome(c, 1, puissanceX(num, den), true);
  if (num === 0) return [ligne(`${intg(fx)}=${monome(c, 1, "x", true)}`, jPrimitive("k", "kx"))];
  if (num === -den) return [ligne(`${intg(fx)}=${monome(c, 1, "\\ln|x|", true)}`, jPrimitive("\\dfrac{1}{x}", "\\ln|x|"))];
  const n1 = num + den;
  const simplifie = monome(c * den, n1, puissanceX(n1, den), true);
  if (den === 1) {
    const brut = `${facteur(c)}\\dfrac{${puissanceX(n1)}}{${n1}}`;
    const lignes = [ligne(`${intg(fx)}=${brut}`, jPrimitive("x^{n}", "\\dfrac{x^{n+1}}{n+1}"))];
    if (brut !== simplifie) lignes.push(ligne(`=${simplifie}`, "on simplifie"));
    return lignes;
  }
  // Exposant fractionnaire : diviser par n1/den, c'est multiplier par den/n1.
  const brut = `${facteur(c)}\\dfrac{${den}}{${n1}}${puissanceX(n1, den)}`;
  const lignes = [ligne(`${intg(fx)}=${brut}`, [t("primitive de "), f("x^{n}"), t(" : diviser par "), f(`n+1=\\frac{${n1}}{${den}}`), t(", c'est multiplier par "), f(`\\frac{${den}}{${n1}}`)])];
  if (brut !== simplifie) lignes.push(ligne(`=${simplifie}`, "on simplifie"));
  return lignes;
}

function contenuA(e: ExerciceFamilleA, phase: PhaseCalculPrimitives): Contenu {
  const final = ligne(`F(x)=${primitiveLatex(e)}+C`, "on additionne les primitives (linéarité)");
  if (e.sousType === "direct") {
    const types = [...new Set(e.termes.map((x) => x.type))];
    return {
      utilise: [t(`Linéarité : on primitive terme à terme, chaque terme avec sa primitive usuelle ${C1} : `), f(types.map((x) => FORMULE_PRIMITIVE_TERME[x]).join(",\\quad "))],
      calcul: [...e.termes.flatMap((_, i) => lignesTermeA(e, i)), final],
    };
  }
  if (phase === "aEcran1") {
    if (e.sousType === "diviserFraction") {
      const { a, p, b, qq } = { a: e.a, p: e.p, b: e.b, qq: e.q };
      const xr = puissanceX(e.r);
      const deuxieme = `${b < 0 ? "-" : "+"}\\dfrac{${monome(Math.abs(b), 1, puissanceX(qq), true)}}{${xr}}`;
      return {
        utilise: [t(`On divise chaque terme du numérateur par le dénominateur, avec la règle des exposants ${C1} : `), f("\\dfrac{x^a}{x^b}=x^{a-b}")],
        calcul: [
          ligne(`f(x)=\\dfrac{${monome(a, 1, puissanceX(p), true)}}{${xr}}${deuxieme}`, "on divise chaque terme par le dénominateur"),
          ligne(`=${formeReecriteA(e)}`, [f("\\dfrac{x^a}{x^b}=x^{a-b}")]),
        ],
      };
    }
    return {
      utilise: [t(`On écrit la racine comme une puissance, puis on additionne les exposants ${C1} : `), f("\\sqrt{x}=x^{1/2},\\qquad x^a\\cdot x^b=x^{a+b}")],
      calcul: [
        ligne(`f(x)=${monome(e.c, 1, `${puissanceX(e.k)}\\cdot x^{1/2}`, true)}`, [f("\\sqrt{x}=x^{1/2}")]),
        ligne(`=${formeReecriteA(e)}`, [f(`x^{${e.k}}\\cdot x^{1/2}=x^{${e.k}+1/2}`)]),
      ],
    };
  }
  // aEcran2 : primitive de la forme réécrite, terme à terme.
  if (e.sousType === "diviserFraction") {
    const termes = [
      { c: e.a, n: e.p - e.r },
      { c: e.b, n: e.q - e.r },
    ].filter((x) => x.c !== 0);
    return {
      utilise: [t(`Primitive d'une puissance de x, terme à terme ${C1} : `), f("x^n\\to\\dfrac{x^{n+1}}{n+1}\\quad(n\\neq-1)")],
      calcul: [...termes.flatMap((x) => lignesMonomeA(x.c, x.n, 1)), final],
    };
  }
  return {
    utilise: [t(`Primitive d'une puissance de x, même pour un exposant fractionnaire ${C1} : `), f("x^n\\to\\dfrac{x^{n+1}}{n+1}\\quad(n\\neq-1)")],
    calcul: [...lignesMonomeA(e.c, 2 * e.k + 1, 2), final],
  };
}

// ============================================================================
// Famille B — fonction composée, ajustement du coefficient.
// ============================================================================

const NOM_G: Record<ExerciceFamilleB["typeG"], string> = {
  puissance: "la puissance",
  invU: "la fraction 1/u",
  expU: "l'exponentielle",
  cosU: "le cosinus",
  sinU: "le sinus",
  invUsq: "la fraction 1/(1 + u²)",
  invSqrtU: "la fraction 1/√(1 − u²)",
};

function contenuB(e: ExerciceFamilleB, phase: PhaseCalculPrimitives): Contenu {
  const u = uLatexB(e);
  const up = uPrimeLatexB(e);
  if (phase === "bEcran1") {
    return {
      utilise: [t(`Primitive d'une fonction composée ${C1} : on repère la fonction intérieure u, puis on la dérive. La formule à appliquer est `), f("\\int u'(x)\\,g\\big(u(x)\\big)\\,dx=G\\big(u(x)\\big)+C"), t(".")],
      calcul: [ligne(`u(x)=${u}`, `expression à l'intérieur de ${NOM_G[e.typeG]}`), ligne(`u'(x)=${up}`, "on dérive u")],
    };
  }
  const xPart = e.expPart === 0 ? "" : puissanceX(e.expPart);
  if (phase === "bEcran2") {
    const affiche = monome(e.k, 1, xPart, true);
    const lignes = [ligne(`${affiche}=\\lambda\\cdot ${par(up)}`, "on compare le facteur de f à u′(x)"), ligne(`\\lambda=\\dfrac{${e.k}}{${e.mCoef}}`, xPart ? `on divise par ${e.mCoef < 0 ? "−" : ""}${Math.abs(e.mCoef)}${xPart ? " (les puissances de x se simplifient)" : ""}` : "on divise")];
    const lam = facteurLatexB(e);
    if (lam !== `\\dfrac{${e.k}}{${e.mCoef}}`) lignes.push(ligne(`=${lam}`, "on simplifie"));
    return {
      utilise: [t(`La formule exige exactement u′(x) en facteur ; on écrit le facteur de f comme λ fois u′(x) ${C1} : `), f("f(x)=\\lambda\\cdot u'(x)\\,g\\big(u(x)\\big)")],
      calcul: lignes,
    };
  }
  const lam = facteurLatexB(e);
  const Gu = gPrimitiveLatexB(e.typeG, "u", e.nG);
  const Gx = gPrimitiveLatexB(e.typeG, u, e.nG);
  const pg = par(Gx);
  const produit = lam === "1" ? Gx : lam === "-1" ? `-${pg}` : /^(\d|\\d?frac)/.test(pg) ? `${lam}\\cdot ${pg}` : `${lam}${pg}`;
  const lignes = [ligne(`F(x)=${produit}+C`, [t("on remplace u par "), f(u), t(" dans "), f(`G(u)=${Gu}`)])];
  const P = primitiveLatex(e);
  if (P !== produit) lignes.push(ligne(`=${P}+C`, "on simplifie"));
  return {
    utilise: [t(`On multiplie par λ la primitive G de g, évaluée en u(x) ${C1} ; ici `), f(`g(u)=${gCorpsLatex(e.typeG, "u", e.nG)}`), t(", donc "), f(`G(u)=${Gu}`), t(".")],
    calcul: lignes,
  };
}

// ============================================================================
// Famille C — changement de variable.
// ============================================================================

function contenuC(e: ExerciceFamilleC, phase: PhaseCalculPrimitives): Contenu {
  const p = piecesC(e);
  if (phase === "cEcran1") {
    const lignes: LigneCalcul[] = [ligne(`u=${p.u}`, "on pose l'expression intérieure")];
    switch (e.sousType) {
      case "1": {
        if (e.a !== 1) lignes.push(ligne(`${e.a}x=${xPlus(-e.b, "u")}`, "on isole le terme en x"));
        lignes.push(ligne(`x=${p.xDeU}`, e.a === 1 ? "on isole x" : `on divise par ${e.a}`));
        lignes.push(ligne(`du=${e.a === 1 ? "" : `${e.a}\\,`}dx`, [t("on dérive : "), f(`u'(x)=${e.a}`)]));
        if (e.a !== 1) lignes.push(ligne(`dx=${p.dx}`, "on isole dx"));
        break;
      }
      case "2":
        if (e.cyclo === "arctan") lignes.push(ligne("du=\\dfrac{1}{1+x^2}\\,dx", [t("dérivée de "), f("\\arctan(x)")]), ligne(`dx=${p.dx}`, "on isole dx"));
        else lignes.push(ligne("du=\\dfrac{1}{\\sqrt{1-x^2}}\\,dx", [t("dérivée de "), f("\\arcsin(x)")]), ligne(`dx=${p.dx}`, "on isole dx"));
        break;
      case "3":
        lignes.push(ligne("x=u^{2}", "on élève au carré (u ≥ 0)"), ligne("du=\\dfrac{1}{2\\sqrt{x}}\\,dx", [t("dérivée de "), f("\\sqrt{x}")]), ligne("dx=2\\sqrt{x}\\,du", "on isole dx"), ligne(`=${p.dx}`, [t("car "), f("\\sqrt{x}=u")]));
        break;
      case "4":
        lignes.push(ligne("du=e^{x}\\,dx", [t("dérivée de "), f("e^{x}+1")]), ligne(`dx=${p.dx}`, "on isole dx"));
        break;
    }
    return { utilise: [t(`Changement de variable ${C1} : on pose u, on le dérive, puis on isole dx : `), f("du=u'(x)\\,dx\\ \\Longrightarrow\\ dx=\\dfrac{du}{u'(x)}")], calcul: lignes };
  }
  if (phase === "cEcran2") {
    const debut = intg(integrandeLatexSansDomaine(e));
    let lignes: LigneCalcul[];
    switch (e.sousType) {
      case "1": {
        const { a, b, k } = e;
        const pref = coefDevant(k, a * a);
        const xu = a === 1 ? `(${xPlus(-b, "u")})` : `\\dfrac{${xPlus(-b, "u")}}{${a}}`;
        const sub = `${facteur(k)}${xu}\\sqrt{u}${a === 1 ? "" : `\\cdot\\dfrac{1}{${a}}`}`;
        lignes = [
          ligne(`${debut}=${intg(sub, "u")}`, [f(`x=${p.xDeU}`), t(", "), f(`\\sqrt{${radicalC1(e)}}=\\sqrt{u}`), t(", "), f(`dx=${p.dx}`)]),
          ligne(`=${intg(`${pref}${pref === "" || pref === "-" ? "" : "\\cdot "}(${xPlus(-b, "u")})\\,u^{1/2}`, "u")}`, [t("on regroupe les constantes ; "), f("\\sqrt{u}=u^{1/2}")]),
          ligne(`=${intg(p.integrandeU, "u")}`, [t("on distribue : "), f("u\\cdot u^{1/2}=u^{3/2}")]),
        ];
        break;
      }
      case "2": {
        const den = e.cyclo === "arctan" ? "1+x^2" : "\\sqrt{1-x^2}";
        lignes = [
          ligne(`${debut}=${intg(`${monome(e.k, 1, "u^{2}", true)}\\cdot\\dfrac{1}{${den}}\\cdot ${e.cyclo === "arctan" ? "(1+x^2)" : "\\sqrt{1-x^2}"}`, "u")}`, [f(`${cycloLatex(e.cyclo)}=u`), t(", "), f(`dx=${p.dx}`)]),
          ligne(`=${intg(p.integrandeU, "u")}`, [t("on simplifie par "), f(den)]),
        ];
        break;
      }
      case "3":
        lignes = [
          ligne(`${debut}=\\int\\dfrac{${e.k}}{(1+u^2)\\,u}\\cdot 2u\\,du`, [f("x=u^2"), t(", "), f("\\sqrt{x}=u"), t(", "), f("dx=2u\\,du")]),
          ligne(`=${intg(p.integrandeU, "u")}`, "on simplifie par u"),
        ];
        break;
      case "4":
        lignes = [
          ligne(`${debut}=\\int\\dfrac{${e.k === 1 ? "" : e.k === -1 ? "-" : e.k}e^{x}}{\\sqrt{u}}\\cdot\\dfrac{1}{e^{x}}\\,du`, [f("e^{x}+1=u"), t(", "), f(`dx=${p.dx}`)]),
          ligne(`=${intg(p.integrandeU, "u")}`, [t("on simplifie par "), f("e^{x}")]),
        ];
        break;
    }
    return { utilise: [t(`On remplace x, l'expression intérieure et dx par leur expression en u : il ne doit plus rester de x ${C1}.`)], calcul: lignes };
  }
  if (phase === "cEcran3") {
    const debut = intg(p.integrandeU, "u");
    let lignes: LigneCalcul[];
    switch (e.sousType) {
      case "1": {
        const { a, b, k } = e;
        const pref = coefDevant(k, a * a);
        const interieur = sommeLatex([
          { num: 2, den: 5, corps: "u^{5/2}" },
          { num: -2 * b, den: 3, corps: "u^{3/2}" },
        ]);
        const brut = pref === "" ? interieur : `${pref}\\left(${interieur}\\right)`;
        lignes = [ligne(`${debut}=${brut}`, [t("primitive de "), f("u^{n}"), t(" : "), f("\\dfrac{u^{n+1}}{n+1}"), t(" ; diviser par "), f("\\frac{5}{2}"), t(" ou "), f("\\frac{3}{2}"), t(", c'est multiplier par "), f("\\frac{2}{5}"), t(" ou "), f("\\frac{2}{3}")])];
        if (brut !== p.primitiveU) lignes.push(ligne(`=${p.primitiveU}`, "on distribue"));
        break;
      }
      case "2": {
        const brut = `${facteur(e.k)}\\dfrac{u^{3}}{3}`;
        lignes = [ligne(`${debut}=${brut}`, jPrimitive("u^{2}", "\\dfrac{u^{3}}{3}"))];
        if (brut !== p.primitiveU) lignes.push(ligne(`=${p.primitiveU}`, "on simplifie"));
        break;
      }
      case "3":
        lignes = [ligne(`${debut}=${facteur(2 * e.k)}\\int\\dfrac{1}{1+u^2}\\,du`, "on sort la constante"), ligne(`=${p.primitiveU}`, jPrimitive("\\dfrac{1}{1+u^2}", "\\arctan(u)"))];
        break;
      default:
        lignes = [
          ligne(`${debut}=${facteur(e.k)}\\int u^{-1/2}\\,du`, [f("\\dfrac{1}{\\sqrt{u}}=u^{-1/2}")]),
          ligne(`=${facteur(e.k)}2u^{1/2}`, [t("primitive de "), f("u^{-1/2}"), t(" : "), f("\\dfrac{u^{1/2}}{1/2}=2u^{1/2}")]),
          ligne(`=${p.primitiveU}`, [f("u^{1/2}=\\sqrt{u}")]),
        ];
    }
    return { utilise: [t(`Primitive usuelle, appliquée à la variable u ${C1} : `), f(p.formuleAide)], calcul: lignes };
  }
  return {
    utilise: [t(`On revient à la variable x en remplaçant u par son expression ${C1}.`)],
    calcul: [ligne(`u=${p.u}`, "changement de variable de l'étape 1"), ligne(`F(x)=${primitiveLatex(e)}+C`, [t("on remplace u par "), f(p.u), t(" dans "), f(p.primitiveU)])],
  };
}

/** Intégrande sans la mention de domaine « \quad(x>0) » (famille E). */
function integrandeLatexSansDomaine(e: ExerciceCalculPrimitives): string {
  return integrandeLatex(e).replace(/\\quad\(x>0\)$/, "");
}

// ============================================================================
// Famille D — intégration par parties.
// ============================================================================

const sansDx = (d: string): string => d.replace(/\\,dx$/, "").replace(/dx$/, "").trim();

function contenuD(e: ExerciceFamilleD, phase: PhaseCalculPrimitives): Contenu {
  const FORMULE_IPP = "\\int u\\,dv=uv-\\int v\\,du";
  if (e.sousType === "5") {
    const { base, k } = e;
    const coef = k === 1 ? "" : `${k}\\cdot `;
    return {
      utilise: [t(`Deux exponentielles multipliées se combinent en une seule ${C1} : `), f("a^x\\cdot e^x=(ae)^x"), t(" ; et une primitive de "), f("b^x"), t(" est "), f("\\dfrac{b^x}{\\ln(b)}"), t(". Aucune intégration par parties n'est nécessaire.")],
      calcul: [
        ligne(`f(x)=${coef}(${base}e)^{x}`, [f("a^x\\cdot e^x=(ae)^x")]),
        ligne(`F(x)=${coef}\\dfrac{(${base}e)^{x}}{\\ln(${base}e)}+C`, jPrimitive("b^x", "\\dfrac{b^x}{\\ln(b)}")),
        ligne(`\\ln(${base}e)=\\ln(${base})+\\ln(e)`, [f("\\ln(ab)=\\ln(a)+\\ln(b)")]),
        ligne(`=1+\\ln(${base})`, [f("\\ln(e)=1")]),
        ligne(`F(x)=${primitiveLatex(e)}+C`, [t("on remplace "), f(`\\ln(${base}e)`)]),
      ],
    };
  }
  const p = piecesD(e);
  if (phase === "dEcran1") {
    const raison: Record<"1" | "2" | "3" | "4", string> = {
      "1": "le polynôme se simplifie en le dérivant",
      "2": "le polynôme : deux dérivations le font disparaître",
      "3": e.sousType === "3" && e.cyclo === "ln" ? "ln n'a pas de primitive immédiate, mais une dérivée simple" : "arctan n'a pas de primitive immédiate, mais une dérivée simple",
      "4": "la fonction trigonométrique (l'exponentielle reste dans dv)",
    };
    return {
      utilise: [
        t(`Intégration par parties (IPP) ${C1} : `),
        f(FORMULE_IPP),
        t(". Pour u, priorité au logarithme, puis à la fonction cyclométrique, au polynôme, et enfin à la fonction trigonométrique ou exponentielle : u doit se simplifier en le dérivant, dv doit se primitiver facilement."),
      ],
      calcul: [ligne(`u=${p.u}`, raison[e.sousType]), ligne(`dv=${p.dv}`, "le reste du produit")],
    };
  }
  if (phase === "dEcran2") {
    const g = sansDx(p.dv) || "1";
    const vLignes: LigneCalcul[] = [ligne(`v=${intg(g)}`, "v est une primitive de dv")];
    vLignes.push(ligne(`=${p.v}`, g === "1" ? jPrimitive("1", "x") : "primitive usuelle (constante nulle)"));
    return {
      utilise: [t("On dérive u ("), f("du=u'(x)\\,dx"), t(`) et on primitive dv, avec une constante nulle ${C1}.`)],
      calcul: [ligne(`du=${p.du}`, "on dérive u"), ...vLignes],
    };
  }
  const integrande = integrandeLatex(e);
  if (phase === "dEcran3") {
    const du = sansDx(p.du);
    const vdu = du === "" ? par(p.v) : `${par(p.v)}\\cdot ${par(du)}`;
    return {
      utilise: [t(`Formule de l'intégration par parties ${C1} : `), f(FORMULE_IPP)],
      calcul: [ligne(`${intg(integrande)}=${par(p.u)}\\cdot ${par(p.v)}-\\int ${vdu}\\,dx`, "on remplace u, v et du"), ligne(`=${p.uv}-${intg(p.vDu)}`, "on simplifie")],
    };
  }
  // dEcran4 — primitive finale.
  const P = primitiveLatex(e);
  const assembler = (I: string): LigneCalcul[] => [ligne(`F(x)=${p.uv}-${par(I)}+C`, [t("on assemble : "), f("uv-\\int v\\,du")]), ligne(`=${P}+C`, "on simplifie")];
  switch (e.sousType) {
    case "1": {
      const { a, kTrig, trig } = e;
      const arg = argumentK(kTrig);
      const autre = trig === "cos" ? "\\sin" : "\\cos";
      const I = trig === "cos" ? monome(-a, kTrig * kTrig, `\\cos(${arg})`, true) : monome(-a, kTrig * kTrig, `\\sin(${arg})`, true);
      const jf = trig === "cos" ? jPrimitive(`\\sin(${arg})`, kTrig === 1 ? "-\\cos(x)" : `-\\dfrac{\\cos(${arg})}{${kTrig}}`) : jPrimitive(`\\cos(${arg})`, kTrig === 1 ? "\\sin(x)" : `\\dfrac{\\sin(${arg})}{${kTrig}}`);
      void autre;
      return { utilise: [t(`On calcule la nouvelle intégrale (primitive usuelle), puis on assemble ${C1} : `), f("F(x)=uv-\\int v\\,du")], calcul: [ligne(`${intg(p.vDu)}=${I}`, jf), ...assembler(I)] };
    }
    case "2": {
      const { c, kExp: k } = e;
      const P1 = xPlus(c);
      const ex = `e^{${argumentK(k)}}`;
      const v2 = monome(1, k, ex, true);
      const J1 = monome(1, k, `(${P1})${ex}`, true);
      const J = sommeLatex([
        { num: 1, den: k, corps: `(${P1})${ex}` },
        { num: -1, den: k * k, corps: ex },
      ]);
      const c2 = coefDevant(2, k);
      const I = `${c2}\\left(${J}\\right)`;
      return {
        utilise: [t(`La nouvelle intégrale contient encore un polynôme : une deuxième IPP ${C1}, avec `), f(`u=${P1}`), t(" et "), f(`dv=${ex}\\,dx`), t(", donc "), f("du=dx"), t(" et "), f(`v=${v2}`), t(".")],
        calcul: [
          ligne(`${intg(p.vDu)}=${c2}\\int(${P1})${ex}\\,dx`, "on sort la constante"),
          ligne(`\\int(${P1})${ex}\\,dx=${J1}-${intg(v2)}`, [t("2ᵉ IPP : "), f(`u=${P1}`), t(", "), f(`dv=${ex}\\,dx`)]),
          ligne(`=${J}`, jPrimitive(ex, monome(1, k, ex, true))),
          ligne(`F(x)=${p.uv}-${I}+C`, [t("on assemble : "), f("uv-\\int v\\,du")]),
          ligne(
            `=${sommeLatex([
              { num: 1, den: k, corps: `\\left(${P1}\\right)^{2}${ex}` },
              { num: -2, den: k * k, corps: `\\left(${P1}\\right)${ex}` },
              { num: 2, den: k * k * k, corps: ex },
            ])}+C`,
            "on distribue",
          ),
          ligne(`=${P}+C`, [t("on met "), f(ex), t(" en évidence")]),
        ],
      };
    }
    case "3": {
      const { k } = e;
      if (e.cyclo === "ln") {
        const I = monome(k, 1, "x", true);
        return { utilise: [t(`La nouvelle intégrale est celle d'une constante ${C1} : `), f("\\int k\\,dx=kx")], calcul: [ligne(`${intg(p.vDu)}=${I}`, jPrimitive("k", "kx")), ...assembler(I)] };
      }
      const I = monome(k, 2, "\\ln(1+x^2)", true);
      const ck = coefDevant(k, 2);
      return {
        utilise: [t(`La nouvelle intégrale est de la forme u′/u (avec u = 1 + x²), au facteur près ${C1} : `), f("\\int\\dfrac{u'}{u}\\,dx=\\ln|u|+C")],
        calcul: [
          ligne(`${intg(p.vDu)}=${ck}${ck === "" || ck === "-" ? "" : "\\cdot "}\\int\\dfrac{2x}{1+x^2}\\,dx`, [t("on fait apparaître "), f("u'=2x")]),
          ligne(`=${I}`, [t("primitive de u′/u : "), f("\\ln|u|"), t(", et "), f("1+x^2>0")]),
          ...assembler(I),
        ],
      };
    }
    case "4": {
      const { kExp: k, trig } = e;
      const ex = `e^{${argumentK(k)}}`;
      const autre = trig === "sin" ? "\\cos(x)" : "\\sin(x)";
      const ik = coefDevant(1, k);
      // J = ∫ e^{kx}·autre dx = e^{kx}·autre/k ± (1/k)·I (deuxième IPP, u = autre).
      const signeJ = trig === "sin" ? 1 : -1;
      const J = `${monome(1, k, `${ex}${autre}`, true)}${signeJ > 0 ? "+" : "-"}${ik}${ik === "" ? "" : "\\,"}I`;
      const debutJ = `\\int ${ex}${autre}\\,dx`;
      const reste = `\\int ${ex}\\${trig}(x)\\,dx`;
      const signeDu = trig === "sin" ? 1 : -1;
      const equation =
        trig === "sin"
          ? sommeLatex([
              { num: 1, den: k, corps: `${ex}\\sin(x)` },
              { num: -1, den: k * k, corps: `${ex}\\cos(x)` },
              { num: -1, den: k * k, corps: "I" },
            ])
          : sommeLatex([
              { num: 1, den: k, corps: `${ex}\\cos(x)` },
              { num: 1, den: k * k, corps: `${ex}\\sin(x)` },
              { num: -1, den: k * k, corps: "I" },
            ]);
      const sansI = equation.replace(/ - (\\dfrac\{1\}\{\d+\})?I$/, "");
      const inverse = k === 1 ? "\\dfrac{1}{2}" : `\\dfrac{${k * k}}{${k * k + 1}}`;
      return {
        utilise: [
          t(`Une deuxième IPP fait réapparaître l'intégrale de départ, notée `),
          f(`I=\\int ${integrande}\\,dx`),
          t(` : on obtient une équation d'inconnue I, que l'on résout ${C1}.`),
        ],
        calcul: [
          ligne(`${debutJ}=${monome(1, k, `${ex}${autre}`, true)}${signeJ > 0 ? "+" : "-"}${ik}${ik === "" ? "" : "\\,"}${reste}`, [t("2ᵉ IPP : "), f(`u=${autre}`), t(", "), f(`dv=${ex}\\,dx`)]),
          ligne(`=${J}`, "on reconnaît l'intégrale de départ I"),
          ligne(`I=${p.uv}-${signeDu > 0 ? "" : "\\left(-"}${ik}${ik === "" ? "" : "\\,"}\\left(${J}\\right)${signeDu > 0 ? "" : "\\right)"}`, [t("1ʳᵉ IPP : "), f("I=uv-\\int v\\,du")]),
          ligne(`=${equation}`, "on distribue"),
          ligne(`${k === 1 ? "2" : `\\left(1+\\dfrac{1}{${k * k}}\\right)`}I=${sansI}`, "on regroupe les termes en I"),
          ligne(`I=${inverse}\\left(${sansI}\\right)`, [t("on multiplie par "), f(inverse)]),
          ligne(`=${P}`, "on réduit au même dénominateur"),
        ],
      };
    }
  }
}

// ============================================================================
// Famille E — substitution trigonométrique.
// ============================================================================

function contenuE(e: ExerciceFamilleE, phase: PhaseCalculPrimitives): Contenu {
  const p = piecesE(e);
  const a = e.a;
  const a2 = a * a;
  const sinus = e.sousType === "sinus";
  if (phase === "eEcran1") {
    return {
      utilise: [t(`Substitution trigonométrique ${C1}, selon la racine : `), f("\\sqrt{a^2-x^2}:\\ x=a\\sin(\\theta)\\qquad\\sqrt{a^2+x^2}:\\ x=a\\tan(\\theta)")],
      calcul: sinus
        ? [ligne(`x=${p.xTheta}`, [t("racine "), f(`\\sqrt{${a2}-x^2}`), t(", avec "), f(`a=${a}`)]), ligne(`dx=${p.dx}`, [t("on dérive : "), f(`(${a}\\sin\\theta)'=${a}\\cos\\theta`)])]
        : [ligne(`x=${p.xTheta}`, [t("racine "), f(`\\sqrt{${a2}+x^2}`), t(", avec "), f(`a=${a}`)]), ligne(`dx=${p.dx}`, [t("on dérive : "), f(`(${a}\\tan\\theta)'=\\dfrac{${a}}{\\cos^2\\theta}`)])],
    };
  }
  if (phase === "eEcran2") {
    return sinus
      ? {
          utilise: [t(`Identité pythagoricienne ${C1} : `), f("1-\\sin^2(\\theta)=\\cos^2(\\theta)")],
          calcul: [
            ligne(`\\sqrt{${a2}-x^2}=\\sqrt{${a2}-${a2}\\sin^2(\\theta)}`, [t("on remplace x par "), f(p.xTheta)]),
            ligne(`=\\sqrt{${a2}\\left(1-\\sin^2(\\theta)\\right)}`, [t("on met "), f(`${a2}`), t(" en évidence")]),
            ligne(`=\\sqrt{${a2}\\cos^2(\\theta)}`, [f("1-\\sin^2\\theta=\\cos^2\\theta")]),
            ligne(`=${p.simplifiee}`, [f("\\cos\\theta\\geq 0"), t(" pour "), f("\\theta\\in\\left[-\\frac{\\pi}{2}\\,;\\frac{\\pi}{2}\\right]")]),
          ],
        }
      : {
          utilise: [t(`Identité ${C1} : `), f("1+\\tan^2(\\theta)=\\dfrac{1}{\\cos^2(\\theta)}")],
          calcul: [
            ligne(`\\sqrt{${a2}+x^2}=\\sqrt{${a2}+${a2}\\tan^2(\\theta)}`, [t("on remplace x par "), f(p.xTheta)]),
            ligne(`=\\sqrt{${a2}\\left(1+\\tan^2(\\theta)\\right)}`, [t("on met "), f(`${a2}`), t(" en évidence")]),
            ligne(`=\\sqrt{\\dfrac{${a2}}{\\cos^2(\\theta)}}`, [f("1+\\tan^2\\theta=\\dfrac{1}{\\cos^2\\theta}")]),
            ligne(`=${p.simplifiee}`, [f("\\cos\\theta>0"), t(" pour "), f("\\theta\\in\\left]-\\frac{\\pi}{2}\\,;\\frac{\\pi}{2}\\right[")]),
          ],
        };
  }
  if (phase === "eEcran3") {
    return sinus
      ? {
          utilise: [t(`On multiplie la racine simplifiée par le facteur de dθ, puis on abaisse le degré ${C1} : `), f("\\cos^2(\\theta)=\\dfrac{1+\\cos(2\\theta)}{2}")],
          calcul: [
            ligne(`\\int\\sqrt{${a2}-x^2}\\,dx=\\int ${a}\\cos(\\theta)\\cdot ${a}\\cos(\\theta)\\,d\\theta`, [t("racine simplifiée et "), f(`dx=${p.dx}`)]),
            ligne(`=\\int ${a2}\\cos^2(\\theta)\\,d\\theta`),
            ligne(`=\\int ${a2}\\cdot\\dfrac{1+\\cos(2\\theta)}{2}\\,d\\theta`, "on abaisse le degré"),
            ligne(`=${a2}\\left(\\dfrac{\\theta}{2}+\\dfrac{\\sin(2\\theta)}{4}\\right)`, jPrimitive("\\cos(2\\theta)", "\\dfrac{\\sin(2\\theta)}{2}")),
            ligne(`=${p.primitiveTheta}`, "on distribue"),
          ],
        }
      : {
          utilise: [t(`On remplace x, dx et la racine, on simplifie avec `), f("\\tan\\theta=\\dfrac{\\sin\\theta}{\\cos\\theta}"), t(`, puis on reconnaît la forme u′/u² avec u = sin θ ${C1} : `), f("\\dfrac{u'}{u^2}\\to-\\dfrac{1}{u}")],
          calcul: [
            ligne(`\\int\\dfrac{1}{x^2\\sqrt{${a2}+x^2}}\\,dx=\\int\\dfrac{1}{${a2}\\tan^2(\\theta)}\\cdot\\dfrac{\\cos(\\theta)}{${a}}\\cdot\\dfrac{${a}}{\\cos^2(\\theta)}\\,d\\theta`, [f(`x^2=${a2}\\tan^2\\theta`), t(", "), f(`\\dfrac{1}{\\sqrt{\\ldots}}=\\dfrac{\\cos\\theta}{${a}}`), t(", "), f("dx")]),
            ligne(`=\\int\\dfrac{1}{${a2}\\tan^2(\\theta)\\cos(\\theta)}\\,d\\theta`, [t("on simplifie par "), f(`${a}`), t(" et par "), f("\\cos\\theta")]),
            ligne(`=\\int\\dfrac{\\cos(\\theta)}{${a2}\\sin^2(\\theta)}\\,d\\theta`, [f("\\tan^2\\theta\\cos\\theta=\\dfrac{\\sin^2\\theta}{\\cos\\theta}")]),
            ligne(`=${p.primitiveTheta}`, [t("forme u′/u², "), f("u=\\sin\\theta")]),
          ],
        };
  }
  // eEcran4 — retour à x.
  if (sinus) {
    return {
      utilise: [t(`On revient à x grâce au triangle rectangle de référence (hypoténuse ${a}, côté opposé x) ${C1} : `), f(`\\sin\\theta=\\dfrac{x}{${a}},\\quad\\cos\\theta=\\dfrac{\\sqrt{${a2}-x^2}}{${a}}`)],
      calcul: [
        ligne(`\\theta=\\arcsin\\left(\\dfrac{x}{${a}}\\right)`, [t("car "), f(`x=${a}\\sin\\theta`)]),
        ligne(`\\sin(2\\theta)=2\\sin(\\theta)\\cos(\\theta)`, "formule de duplication"),
        ligne(`=2\\cdot\\dfrac{x}{${a}}\\cdot\\dfrac{\\sqrt{${a2}-x^2}}{${a}}`, "triangle de référence"),
        ligne(`=\\dfrac{2x\\sqrt{${a2}-x^2}}{${a2}}`),
        ligne(`F(x)=\\dfrac{${a2}}{2}\\arcsin\\left(\\dfrac{x}{${a}}\\right)+\\dfrac{${a2}}{4}\\cdot\\dfrac{2x\\sqrt{${a2}-x^2}}{${a2}}+C`, [t("on remplace "), f("\\theta"), t(" et "), f("\\sin(2\\theta)")]),
        ligne(`=${primitiveLatex(e)}+C`, "on simplifie"),
      ],
    };
  }
  return {
    utilise: [t(`On revient à x grâce au triangle rectangle de référence (côtés x et ${a}, hypoténuse `), f(`\\sqrt{${a2}+x^2}`), t(`) ${C1}.`)],
    calcul: [
      ligne(`\\sin(\\theta)=\\dfrac{x}{\\sqrt{${a2}+x^2}}`, [t("car "), f(`\\tan\\theta=\\dfrac{x}{${a}}`)]),
      ligne(`F(x)=-\\dfrac{1}{${a2}}\\cdot\\dfrac{\\sqrt{${a2}+x^2}}{x}+C`, [t("on remplace "), f("\\dfrac{1}{\\sin\\theta}")]),
      ligne(`=${primitiveLatex(e)}+C`, "on simplifie"),
    ],
  };
}

// ============================================================================
// Famille F — identités trigonométriques.
// ============================================================================

function contenuF(e: ExerciceFamilleF, phase: PhaseCalculPrimitives): Contenu {
  const k = e.k;
  const c = coefDevant(k);
  const forme = formeReecriteF(e);
  const fx = integrandeLatex(e);
  if (phase === "fEcran1") {
    switch (e.sousType) {
      case "tan":
        return { utilise: [t(`La tangente est le quotient du sinus par le cosinus ${C1} : `), f("\\tan(x)=\\dfrac{\\sin(x)}{\\cos(x)}")], calcul: [ligne(`f(x)=${fx}`), ligne(`=${forme}`, [f("\\tan x=\\dfrac{\\sin x}{\\cos x}")])] };
      case "angleDoubleSin":
      case "angleDoubleCos": {
        const sin = e.sousType === "angleDoubleSin";
        const brut = `${facteur(k)}\\dfrac{1${sin ? "-" : "+"}\\cos(2x)}{2}`;
        const lignes = [ligne(`f(x)=${fx}`), ligne(`=${brut}`, [t("car "), f(sin ? "\\cos(2x)=1-2\\sin^2(x)" : "\\cos(2x)=2\\cos^2(x)-1")])];
        if (brut !== forme) lignes.push(ligne(`=${forme}`, "on simplifie"));
        return { utilise: [t(`Formule de duplication du cosinus, d'où l'on isole le carré ${C1} : `), f(sin ? "\\sin^2(x)=\\dfrac{1-\\cos(2x)}{2}" : "\\cos^2(x)=\\dfrac{1+\\cos(2x)}{2}")], calcul: lignes };
      }
      case "pythagoreanFactor":
        return {
          utilise: [t(`Identité pythagoricienne ${C1} : `), f("\\sin^2(x)=1-\\cos^2(x)"), t(", puis l'identité remarquable "), f("a^2-b^2=(a-b)(a+b)"), t(".")],
          calcul: [
            ligne(`f(x)=${fx}`),
            ligne(`=${c}\\dfrac{1-\\cos^2(x)}{1-\\cos(x)}`, [f("\\sin^2x=1-\\cos^2x")]),
            ligne(`=${c}\\dfrac{(1-\\cos(x))(1+\\cos(x))}{1-\\cos(x)}`, [f("a^2-b^2=(a-b)(a+b)")]),
            ligne(`=${forme}`, [t("on simplifie par "), f("1-\\cos(x)\\neq 0")]),
          ],
        };
      case "oddPowerSin":
      case "oddPowerCos": {
        const s = e.sousType === "oddPowerSin";
        const fn = s ? "\\sin" : "\\cos";
        return {
          utilise: [t(`On sépare un facteur ${s ? "sin x" : "cos x"}, puis on utilise l'identité pythagoricienne ${C1} : `), f("\\sin^2(x)+\\cos^2(x)=1")],
          calcul: [ligne(`f(x)=${fx}`), ligne(`=${c}${fn}(x)\\cdot ${fn}^2(x)`, [t("on sépare un facteur "), f(`${fn}(x)`)]), ligne(`=${forme}`, [f(s ? "\\sin^2x=1-\\cos^2x" : "\\cos^2x=1-\\sin^2x")])],
        };
      }
    }
  }
  const P = primitiveLatex(e);
  const finale = ligne(`F(x)=${P}+C`, "primitive de f");
  switch (e.sousType) {
    case "tan": {
      const moinsK = k === 1 ? "-" : `-${k}`;
      return {
        utilise: [t(`Le quotient est de la forme u′/u au signe près, avec u = cos x ${C1} : `), f("\\int\\dfrac{u'}{u}\\,dx=\\ln|u|+C")],
        calcul: [ligne(`${intg(forme)}=${moinsK}\\int\\dfrac{-\\sin(x)}{\\cos(x)}\\,dx`, [t("on fait apparaître "), f("u'=-\\sin(x)")]), ligne(`=${P}`, [t("primitive de u′/u : "), f("\\ln|u|")]), finale],
      };
    }
    case "angleDoubleSin":
    case "angleDoubleCos": {
      const sin = e.sousType === "angleDoubleSin";
      const ck = coefDevant(k, 2);
      const fac = ck;
      return {
        utilise: [t(`Primitive d'un cosinus d'argument 2x ${C1} : `), f("\\cos(2x)\\to\\dfrac{\\sin(2x)}{2}")],
        calcul: [
          ligne(`${intg(forme)}=${fac}\\int\\left(1${sin ? "-" : "+"}\\cos(2x)\\right)dx`, "on sort la constante"),
          ligne(`=${fac}\\left(x${sin ? "-" : "+"}\\dfrac{\\sin(2x)}{2}\\right)`, jPrimitive("\\cos(2x)", "\\dfrac{\\sin(2x)}{2}")),
          ligne(`=${P}`, "on distribue"),
          finale,
        ],
      };
    }
    case "pythagoreanFactor":
      return { utilise: [t(`Primitives immédiates ${C1} : `), f("1\\to x,\\qquad\\cos(x)\\to\\sin(x)")], calcul: [ligne(`${intg(forme)}=${P}`, [t("primitives de "), f("1"), t(" et de "), f("\\cos(x)")]), finale] };
    case "oddPowerSin":
      return {
        utilise: [t(`Le second terme est de la forme u′·u² (au signe près), avec u = cos x ${C1} : `), f("\\sin(x)\\cos^2(x)\\to-\\dfrac{\\cos^3(x)}{3}")],
        calcul: [
          ligne(`${intg(forme)}=${c}${c === "" ? "" : "\\cdot "}\\int\\left(\\sin(x)-\\sin(x)\\cos^2(x)\\right)dx`, "on distribue"),
          ligne(`=${c === "" ? "-\\cos(x)+\\dfrac{\\cos^3(x)}{3}" : `${c}\\left(-\\cos(x)+\\dfrac{\\cos^3(x)}{3}\\right)`}`, [t("primitives de "), f("\\sin x"), t(" et de "), f("\\sin x\\cos^2x=-u'u^2")]),
          finale,
        ],
      };
    case "oddPowerCos":
      return {
        utilise: [t(`Le second terme est de la forme u′·u², avec u = sin x ${C1} : `), f("\\cos(x)\\sin^2(x)\\to\\dfrac{\\sin^3(x)}{3}")],
        calcul: [
          ligne(`${intg(forme)}=${c}${c === "" ? "" : "\\cdot "}\\int\\left(\\cos(x)-\\cos(x)\\sin^2(x)\\right)dx`, "on distribue"),
          ligne(`=${c === "" ? "\\sin(x)-\\dfrac{\\sin^3(x)}{3}" : `${c}\\left(\\sin(x)-\\dfrac{\\sin^3(x)}{3}\\right)`}`, [t("primitives de "), f("\\cos x"), t(" et de "), f("\\cos x\\sin^2x=u'u^2")]),
          finale,
        ],
      };
  }
}

// ============================================================================
// Famille G — décomposition en éléments simples.
// ============================================================================

function contenuG(e: ExerciceFamilleG, phase: PhaseCalculPrimitives): Contenu {
  const fx = integrandeLatex(e);
  if (phase === "gEcran1" && e.sousType === "2") {
    const { r, d, e: reste } = e;
    const N = polynomeLatex([1, d - r, reste - r * d]);
    const den = facteurAffine(-r);
    return {
      utilise: [t(`Le degré du numérateur (2) dépasse celui du dénominateur (1) : division euclidienne ${C1}, `), f("N(x)=D(x)\\cdot Q(x)+R"), t(".")],
      calcul: [
        ligne(`${N}=${den}(${xPlus(d)})${qTerme(q(reste))}`, [t("quotient "), f(xPlus(d)), t(", reste "), f(`${reste}`)]),
        ligne(`f(x)=\\dfrac{${den}(${xPlus(d)})${qTerme(q(reste))}}{${xPlus(-r)}}`, "on remplace le numérateur"),
        ligne(`=${xPlus(d)}${reste < 0 ? "" : "+"}${fractionSignee(reste, xPlus(-r))}`, [t("on simplifie par "), f(xPlus(-r))]),
      ],
    };
  }
  if (phase === "gEcran2") {
    switch (e.sousType) {
      case "1": {
        const { r1, r2 } = e;
        const fact = `${facteurAffine(-r1)}${facteurAffine(-r2)}`;
        return {
          utilise: [t(`On factorise le dénominateur, puis on pose un élément simple par facteur du premier degré ${C1} : `), f("\\dfrac{A}{x-r_1}+\\dfrac{B}{x-r_2}")],
          calcul: [
            ligne(`${denominateurG1(e)}=${fact}`, [t("racines "), f(`${r1}`), t(" et "), f(`${r2}`), t(" (somme "), f(`${r1 + r2}`), t(", produit "), f(`${r1 * r2}`), t(")")]),
            ligne(`f(x)=\\dfrac{${numerateurG1(e)}}{${fact}}`, "dénominateur factorisé"),
            ligne(`=${decompositionPoseeG(e)}`, "A et B à déterminer"),
          ],
        };
      }
      case "2":
        return {
          utilise: [t(`La fraction propre a un dénominateur du premier degré : un seul élément simple ${C1}.`)],
          calcul: [ligne(`${fractionSignee(e.e, xPlus(-e.r))}=${decompositionPoseeG(e)}`, "élément simple posé, A à déterminer")],
        };
      case "3":
        return {
          utilise: [t("Le facteur "), f("x^2+1"), t(" n'a pas de racine réelle : on pose "), f("\\dfrac{A}{x}"), t(" pour le facteur x et "), f("\\dfrac{Bx+C}{x^2+1}"), t(` pour le facteur irréductible ${C1}.`)],
          calcul: [ligne("x^3+x=x(x^2+1)", "mise en évidence de x"), ligne(`f(x)=\\dfrac{${numerateurG3(e)}}{x(x^2+1)}`, "dénominateur factorisé"), ligne(`=${decompositionPoseeG(e)}`, "A, B et C à déterminer")],
        };
      case "4": {
        const { p, q: qq } = e;
        const delta = p * p - 4 * qq;
        return {
          utilise: [t(`Le dénominateur n'a pas de racine réelle : on complète le carré ${C1}, `), f("x^2+px+q=\\left(x+\\dfrac{p}{2}\\right)^2+q-\\dfrac{p^2}{4}"), t(".")],
          calcul: [
            ligne(`\\Delta=${qP(q(p))}^2-4\\cdot ${qq}`, "discriminant du dénominateur"),
            ligne(`=${delta}`, "Δ < 0 : pas de racine réelle"),
            ligne(`${denominateurG4(e)}=\\left(x+\\dfrac{${p}}{2}\\right)^2+${qq}-\\dfrac{${qP(q(p))}^2}{4}`, "on complète le carré"),
            ligne(`f(x)=${decompositionPoseeG(e)}`, [t("forme posée, avec "), f("h=\\dfrac{p}{2}"), t(" et "), f("m^2=q-h^2")]),
          ],
        };
      }
    }
  }
  if (phase === "gEcran3") {
    switch (e.sousType) {
      case "1": {
        const { A, B, r1, r2 } = e;
        return {
          utilise: [t(`On réduit au même dénominateur et on identifie les numérateurs ; remplacer x par une racine annule un des deux termes ${C1}.`)],
          calcul: [
            ligne(`A${facteurAffine(-r2)}+B${facteurAffine(-r1)}=${numerateurG1(e)}`, "même dénominateur, numérateurs égaux"),
            ligne(`${monome(r1 - r2, 1, "A", true)}=${A * (r1 - r2)}`, [t("on remplace x par "), f(`${r1}`)]),
            ligne(`A=${A}`, `on divise par ${r1 - r2 < 0 ? "−" : ""}${Math.abs(r1 - r2)}`),
            ligne(`${monome(r2 - r1, 1, "B", true)}=${B * (r2 - r1)}`, [t("on remplace x par "), f(`${r2}`)]),
            ligne(`B=${B}`, `on divise par ${r2 - r1 < 0 ? "−" : ""}${Math.abs(r2 - r1)}`),
          ],
        };
      }
      case "2":
        return { utilise: [t(`On identifie avec la fraction propre trouvée à l'étape 1 ${C1}.`)], calcul: [ligne(`A=${e.e}`, "même dénominateur, numérateurs égaux")] };
      case "3": {
        const { A, B, C } = e;
        return {
          utilise: [t(`On réduit au même dénominateur, on développe, puis on identifie les coefficients des mêmes puissances de x ${C1}.`)],
          calcul: [
            ligne(`A(x^2+1)+(Bx+C)\\,x=${numerateurG3(e)}`, "même dénominateur, numérateurs égaux"),
            ligne(`(A+B)x^2+Cx+A=${numerateurG3(e)}`, "on développe et on ordonne"),
            ligne(`A=${A}`, "termes constants"),
            ligne(`C=${C}`, "coefficients de x"),
            ligne(`A+B=${A + B}`, "coefficients de x²"),
            ligne(`B=${A + B}-${qP(q(A))}`, "on remplace A"),
            ligne(`=${B}`),
          ],
        };
      }
      case "4": {
        const { p, q: qq, h, m } = e;
        return {
          utilise: [t(`On développe le carré complété et on identifie avec le dénominateur ${C1}.`)],
          calcul: [
            ligne("(x+h)^2+m^2=x^2+2hx+h^2+m^2", "on développe"),
            ligne(`2h=${p}`, "coefficients de x"),
            ligne(`h=${h}`, "on divise par 2"),
            ligne(`h^2+m^2=${qq}`, "termes constants"),
            ligne(`m^2=${qq}-${qP(q(h))}^2`, "on isole m²"),
            ligne(`=${m * m}`),
            ligne(`m=${m}`, "m > 0"),
          ],
        };
      }
    }
  }
  // gEcran4 — primitive des éléments simples.
  const P = primitiveLatex(e);
  const finale = ligne(`F(x)=${P}+C`, "on additionne les primitives");
  switch (e.sousType) {
    case "1": {
      const { A, B, r1, r2 } = e;
      return {
        utilise: [t(`Primitive d'un élément simple du premier degré ${C1} : `), f("\\dfrac{A}{x-r}\\to A\\ln|x-r|")],
        calcul: [
          ligne(`${intg(fractionSignee(A, xPlus(-r1)))}=${monome(A, 1, `\\ln|${xPlus(-r1)}|`, true)}`, jPrimitive(`\\dfrac{1}{${xPlus(-r1)}}`, `\\ln|${xPlus(-r1)}|`)),
          ligne(`${intg(fractionSignee(B, xPlus(-r2)))}=${monome(B, 1, `\\ln|${xPlus(-r2)}|`, true)}`, jPrimitive(`\\dfrac{1}{${xPlus(-r2)}}`, `\\ln|${xPlus(-r2)}|`)),
          finale,
        ],
      };
    }
    case "2": {
      const { d, e: reste, r } = e;
      return {
        utilise: [t(`Primitives d'un polynôme et d'un élément simple du premier degré ${C1} : `), f("\\dfrac{A}{x-r}\\to A\\ln|x-r|")],
        calcul: [
          ligne(`${intg(xPlus(d))}=${sommeLatex([{ num: 1, den: 2, corps: "x^{2}" }, { num: d, corps: "x" }])}`, jPrimitive("x", "\\dfrac{x^{2}}{2}")),
          ligne(`${intg(fractionSignee(reste, xPlus(-r)))}=${monome(reste, 1, `\\ln|${xPlus(-r)}|`, true)}`, jPrimitive(`\\dfrac{1}{${xPlus(-r)}}`, `\\ln|${xPlus(-r)}|`)),
          finale,
        ],
      };
    }
    case "3": {
      const { A, B, C } = e;
      const bx = sommeLatex([
        { num: B, corps: "x" },
        { num: C, corps: "" },
      ]);
      const cb = coefDevant(B, 2);
      const termeC = `${C < 0 ? "-" : "+"}${coefDevant(Math.abs(C))}${Math.abs(C) === 1 ? "" : "\\cdot "}\\int\\dfrac{1}{x^2+1}\\,dx`;
      return {
        utilise: [t(`Primitives des éléments simples ${C1} : `), f("\\dfrac{1}{x}\\to\\ln|x|,\\quad\\dfrac{2x}{x^2+1}\\to\\ln(x^2+1),\\quad\\dfrac{1}{x^2+1}\\to\\arctan(x)")],
        calcul: [
          ligne(`${intg(fractionSignee(A, "x"))}=${monome(A, 1, "\\ln|x|", true)}`, jPrimitive("\\dfrac{1}{x}", "\\ln|x|")),
          ligne(`\\int\\dfrac{${bx}}{x^2+1}\\,dx=${cb}${cb === "" || cb === "-" ? "" : "\\cdot "}\\int\\dfrac{2x}{x^2+1}\\,dx${termeC}`, [t("on sépare et on fait apparaître u′/u, "), f("u=x^2+1")]),
          ligne(`=${sommeLatex([{ num: B, den: 2, corps: "\\ln(x^2+1)" }, { num: C, corps: "\\arctan(x)" }])}`, [t("primitives "), f("\\ln(x^2+1)"), t(" (car "), f("x^2+1>0"), t(") et "), f("\\arctan(x)")]),
          finale,
        ],
      };
    }
    case "4": {
      const { gamma, h, m } = e;
      const carre = carreCompleteG4(e);
      const arg = m === 1 ? xPlus(h) : `\\dfrac{${xPlus(h)}}{${m}}`;
      const lignes: LigneCalcul[] = [];
      if (m === 1) lignes.push(ligne(`${intg(fractionSignee(gamma, carre))}=${P}`, jPrimitive(`\\dfrac{1}{(x+h)^2+1}`, "\\arctan(x+h)")));
      else {
        lignes.push(ligne(`${intg(fractionSignee(gamma, carre))}=${facteur(gamma)}\\dfrac{1}{${m}}\\arctan\\left(${arg}\\right)`, jPrimitive("\\dfrac{1}{(x+h)^2+m^2}", "\\dfrac{1}{m}\\arctan\\left(\\dfrac{x+h}{m}\\right)")));
        lignes.push(ligne(`=${P}`, "on simplifie"));
      }
      return { utilise: [t(`Primitive de l'élément simple ${C1} : `), f("\\dfrac{1}{(x+h)^2+m^2}\\to\\dfrac{1}{m}\\arctan\\left(\\dfrac{x+h}{m}\\right)")], calcul: [...lignes, finale] };
    }
  }
  void fx;
  void decompositionNumeriqueG;
  return { utilise: [], calcul: [] };
}

function contenu(e: ExerciceCalculPrimitives, phase: PhaseCalculPrimitives): Contenu {
  switch (e.famille) {
    case "A":
      return contenuA(e, phase);
    case "B":
      return contenuB(e, phase);
    case "C":
      return contenuC(e, phase);
    case "D":
      return contenuD(e, phase);
    case "E":
      return contenuE(e, phase);
    case "F":
      return contenuF(e, phase);
    case "G":
      return contenuG(e, phase);
  }
}

// ============================================================================
// Assemblage.
// ============================================================================

/** Résultat d'une étape : la réponse de l'écran (vraie valeur, plusieurs valeurs séparées). */
export function resultatPhasePrimitive(e: ExerciceCalculPrimitives, phase: PhaseCalculPrimitives): FragmentConsigne[] {
  return [f(formatReponseAttenduePhaseLatex(e, phase).join(",\\quad "))];
}

/**
 * Corrigé « comme au tableau » d'UN écran de calcul de primitive. `derniere` : dernier écran de la
 * chaîne (vérification par dérivation) ; `avecPiege` : la ligne « Piège » ciblée de l'instance, sur
 * l'étape où l'erreur se commet.
 */
export function etapesPhasePrimitive(e: ExerciceCalculPrimitives, phase: PhaseCalculPrimitives, sq: string, opts: { derniere: boolean; avecPiege: boolean }): EtapeCorrection[] {
  const c = contenu(e, phase);
  const lignes: EtapeCorrection[] = [utilise(sq, c.utilise), calcul(sq, c.calcul), resultat(sq, resultatPhasePrimitive(e, phase))];
  if (opts.derniere) lignes.push(verification(sq, [t("En dérivant F, on retrouve f : "), f(`F'(x)=${integrandeLatexSansDomaine(e)}`), t(".")]));
  if (opts.avecPiege && phase === phasePiege(e)) lignes.push(piege(sq, [t(piegePrimitive(e))]));
  return lignes;
}

const LETTRES = "abcdefghij";

export function correctionDetailleeCalculPrimitives(e: ExerciceCalculPrimitives): EtapeCorrection[] {
  const phases = phasesPourExercice(e);
  return phases.flatMap((phase, i) => etapesPhasePrimitive(e, phase, LETTRES[i], { derniere: i === phases.length - 1, avecPiege: true }));
}
