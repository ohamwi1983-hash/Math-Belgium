import type {
  ExerciceDomaineDeriveeLogA,
  ExerciceDomaineDeriveeLogB,
  ExerciceDomaineDeriveeLogC,
  ExerciceDomaineDeriveeLogD,
  ExerciceDomaineDeriveeLogE,
  ExerciceDomaineDeriveeLogF,
  ExerciceDomaineDeriveeLogG,
  ExerciceDomaineDeriveeLogarithme,
} from "../../core6e/domaineDeriveeLogarithme.types";
import type { EtapeCorrection, FragmentConsigne, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise } from "../../../export/corrigeTableau";
import { phaseApres, phaseInitiale, type PhaseDomaineDeriveeLogarithme } from "../../moteur6e/typesDomaineDeriveeLogarithme";
import {
  argumentA,
  carreMoinsCarreLatex,
  facteursLatexC,
  formatAffine,
  formatFonctionEOrigine,
  formatKx,
  formatXMoins,
  formeSimplifieeLatexE,
  formeUVLatexG,
  fSimplifieeLatexG,
  nDLatexD,
  reponseAttendueLatex,
  uvLatexG,
  blocDonnees,
} from "../../ui6e/formatDomaineDeriveeLogarithme";
import { formatEnsembleReelLatex } from "../../ui6e/formatEnsembleReel";
import { COURS_DERIVEE, finaliserCorrige, frac, justif } from "../../ui6e/corrigeLogarithmes1";
import { sansRepetition } from "../../ui6e/corrigeIntegrales1";

/**
 * Corrigé détaillé « comme au tableau » de `6gen16` (domaine, dérivée et dérivation logarithmique)
 * — règle `.claude/rules/feuilles-evaluations.md`. SOURCE UNIQUE : importé par l'adaptateur papier
 * (`exportEvaluation.ts`) ET par l'appli (`App6gen16.tsx`, corrigé d'une étape échouée). Une étape
 * (lettre) = un écran (`phasesDomaineDeriveeLog`). Domaine : chaque condition écrite puis résolue ;
 * dérivée : formule du cours, ingrédients (u, u′, v, v′, N, D…), substitution, simplification —
 * la dernière ligne et le résultat sont la réponse de l'écran (`reponseAttendueLatex`), les
 * ingrédients viennent des mêmes fonctions que l'écran (`facteursLatexC`, `nDLatexD`, `uvLatexG`…).
 */

export function phasesDomaineDeriveeLog(exercice: ExerciceDomaineDeriveeLogarithme): PhaseDomaineDeriveeLogarithme[] {
  const phases: PhaseDomaineDeriveeLogarithme[] = [];
  let phase: PhaseDomaineDeriveeLogarithme | "termine" = phaseInitiale(exercice);
  while (phase !== "termine") {
    phases.push(phase);
    phase = phaseApres(phase);
  }
  return phases;
}

const REGLE_LOG = "\\left(\\log_b u\\right)'=\\dfrac{u'}{u\\ln(b)}";
const REGLE_LN = "\\left(\\ln u\\right)'=\\dfrac{u'}{u}";

/** Membre de droite de la réponse de l'écran (« f'(x) = … » → « … »). */
function droite(rep: string | null): string {
  if (!rep) return "";
  const i = rep.indexOf("=");
  return rep.slice(i + 1).trim();
}

/** Facteur entre parenthèses s'il a un + / − de niveau 0 (ou commence par « − »). */
function p(t: string): string {
  let prof = 0;
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    if (c === "{" || c === "(") prof++;
    else if (c === "}" || c === ")") prof--;
    else if (prof === 0 && i > 0 && (c === "+" || c === "-")) return `\\left(${t}\\right)`;
  }
  return t.startsWith("-") ? `\\left(${t}\\right)` : t;
}

function domaineL(e: { domaine: { forme: "reel" | "prive_points" | "intervalles"; points: number[]; morceaux: { inf: number | null; sup: number | null; infInclus: boolean; supInclus: boolean }[] } }): string {
  return formatEnsembleReelLatex(e.domaine);
}

/** Condition « m x + n > 0 » résolue ligne à ligne. */
function lignesPositif(m: number, n: number, quoi: string | FragmentConsigne[], strict = true): LigneCalcul[] {
  const rel = strict ? ">" : "\\geq ";
  const relInv = strict ? "<" : "\\leq ";
  const l: LigneCalcul[] = [ligne(`${formatAffine(m, n)}${rel}0`, quoi)];
  if (n !== 0) l.push(ligne(`${formatAffine(m, 0)}${rel}${-n}`, n > 0 ? `on soustrait ${n}` : `on ajoute ${-n}`));
  if (m !== 1) l.push(ligne(`x${m > 0 ? rel : relInv}${frac(-n, m)}`, m > 0 ? `on divise par ${m}` : `on divise par ${m} : le sens change`));
  return l;
}

function etapeDomaine(sq: string, lignes: LigneCalcul[], domaine: string, quoi = "les conditions d'existence (argument d'un logarithme strictement positif, radicande positif, dénominateur non nul)"): EtapeCorrection[] {
  return [utilise(sq, [texte(`On écrit ${quoi}, puis on les résout et on les croise ${COURS_DERIVEE}.`)]), calcul(sq, lignes), resultat(sq, [latex(`D_f=${domaine}`)])];
}

function etapeDerivee(sq: string, formule: FragmentConsigne[], lignes: LigneCalcul[], rep: string | null): EtapeCorrection[] {
  return [utilise(sq, [...formule, texte(` ${COURS_DERIVEE}.`)]), calcul(sq, sansRepetition(lignes)), resultat(sq, [latex(rep ?? "")])];
}

function finale(rep: string | null, deja: string, justification: string | FragmentConsigne[] = "on simplifie"): LigneCalcul[] {
  const d = droite(rep);
  return d.replace(/\s/g, "") === deja.replace(/\s/g, "") ? [] : [ligne(`=${d}`, justification)];
}

// ---------------------------------------------------------------------------- Famille A

function correctionA(e: ExerciceDomaineDeriveeLogA): EtapeCorrection[] {
  const { u, uPrime } = argumentA(e);
  const lnB = e.baseEstE ? "" : `\\ln(${e.base})`;
  const dom: LigneCalcul[] =
    e.sousType === "puissance"
      ? [ligne(`${e.k}^x>0`, "une exponentielle est toujours strictement positive"), ligne("x\\in\\mathbb{R}", "aucune restriction")]
      : e.sousType === "carre"
        ? [ligne(`x^2+${e.c}>0`, justif("vrai pour tout x : ", { l: "x^2\\geq 0" }, ` et ${e.c} > 0`)), ligne("x\\in\\mathbb{R}", "aucune restriction")]
        : lignesPositif(e.m, e.n, "argument strictement positif");
  const rep = reponseAttendueLatex(e, "aDerivee");
  const sub = `\\dfrac{${uPrime}}{${e.sousType === "carre" || e.sousType === "affine" ? (lnB ? `(${u})` : u) : u}${lnB}}`;
  const lignes: LigneCalcul[] = [ligne(`u(x)=${u}`, "argument du logarithme"), ligne(`u'(x)=${uPrime}`, e.sousType === "puissance" ? justif("", { l: "(a^x)'=\\ln(a)\\cdot a^x" }) : "on dérive l'argument"), ligne(`f'(x)=${sub}`, justif("", { l: e.baseEstE ? REGLE_LN : REGLE_LOG }))];
  lignes.push(...finale(rep, sub, e.sousType === "puissance" ? justif("on simplifie par ", { l: `${e.k}^x` }) : "on écrit le résultat"));
  return [...etapeDomaine("a", dom, domaineL(e)), ...etapeDerivee("b", [texte("Dérivée d'un logarithme : "), latex(e.baseEstE ? REGLE_LN : REGLE_LOG)], lignes, rep)];
}

// ---------------------------------------------------------------------------- Famille B

function correctionB(e: ExerciceDomaineDeriveeLogB): EtapeCorrection[] {
  const b = e.base;
  const rep = reponseAttendueLatex(e, "bDerivee");
  let dom: LigneCalcul[];
  let der: LigneCalcul[];
  let formule: FragmentConsigne[];
  let lePiege: FragmentConsigne[] | null = null;
  if (e.sousType === "doubleContrainte") {
    const arg = formatAffine(e.m, e.n);
    const borne = e.m === 1 ? b - e.n : e.n - b;
    dom = [
      ...lignesPositif(e.m, e.n, "argument du logarithme strictement positif"),
      ligne(`1-\\log_{${b}}(${arg})\\geq 0`, "radicande positif"),
      ligne(`\\log_{${b}}(${arg})\\leq 1`, "on isole le logarithme"),
      ligne(`${arg}\\leq ${b}`, justif(`log de base ${b} croissant et `, { l: `1=\\log_{${b}}(${b})` })),
      ligne(`x${e.m === 1 ? "\\leq " : "\\geq "}${borne}`, e.m === 1 ? (e.n > 0 ? `on soustrait ${e.n}` : `on ajoute ${-e.n}`) : "on multiplie par −1 : le sens change"),
    ];
    const w = `1-\\log_{${b}}(${arg})`;
    const wp = `${e.m < 0 ? "" : "-"}\\dfrac{1}{(${arg})\\ln(${b})}`;
    formule = [texte("Racine d'une fonction et dérivée d'un logarithme : "), latex("\\left(\\sqrt{w}\\right)'=\\dfrac{w'}{2\\sqrt{w}}"), texte(" et "), latex(REGLE_LOG)];
    der = [
      ligne(`w(x)=${w}`, "sous la racine"),
      ligne(`w'(x)=-\\dfrac{${e.m}}{(${arg})\\ln(${b})}`, justif("", { l: REGLE_LOG })),
      ...(e.m < 0 ? [ligne(`=${wp}`, "règle des signes")] : []),
      ligne(`f'(x)=\\dfrac{w'(x)}{2\\sqrt{w(x)}}`, justif("", { l: "\\left(\\sqrt{w}\\right)'=\\dfrac{w'}{2\\sqrt{w}}" })),
      ligne(`=\\dfrac{${wp}}{2\\sqrt{${w}}}`, "on remplace w et w′"),
      ...finale(rep, "", "on regroupe en une seule fraction"),
    ];
    lePiege = [texte("Deux conditions à croiser : l'argument du logarithme strictement positif ET le radicande positif ("), latex(`\\log_{${b}}(${arg})\\leq 1`), texte(").")];
  } else if (e.sousType === "racineInterne") {
    dom = [ligne("1-x^2>0", justif("radicande positif et ", { l: "\\sqrt{1-x^2}>0" }, " (argument du logarithme)")), ligne("x^2<1", "on isole x²"), ligne("-1<x<1", "racine carrée")];
    formule = [texte("On simplifie d'abord avec la propriété de la puissance ("), latex("\\sqrt{u}=u^{\\frac{1}{2}}"), texte("), puis "), latex(REGLE_LOG)];
    der = [
      ligne(`f(x)=\\log_{${b}}\\left((1-x^2)^{\\frac{1}{2}}\\right)`, justif("", { l: "\\sqrt{u}=u^{\\frac{1}{2}}" })),
      ligne(`=\\dfrac{1}{2}\\log_{${b}}(1-x^2)`, justif("", { l: "\\log_b(u^n)=n\\log_b(u)" })),
      ligne(`f'(x)=\\dfrac{1}{2}\\cdot\\dfrac{-2x}{(1-x^2)\\ln(${b})}`, justif("", { l: REGLE_LOG }, ", u′ = −2x")),
      ...finale(rep, "", "on simplifie par 2"),
    ];
  } else if (e.sousType === "quadratique") {
    dom = [ligne(`${carreMoinsCarreLatex(e.k)}>0`, "argument strictement positif"), ligne(`x^2>${e.k * e.k}`, `on ajoute ${e.k * e.k}`), ligne(`|x|>${e.k}`, "racine carrée"), ligne(`x\\in ${domaineL(e)}`, justif("", { l: `x<-${e.k}` }, " ou ", { l: `x>${e.k}` }))];
    formule = [texte("Dérivée d'un logarithme : "), latex(REGLE_LOG)];
    der = [ligne(`u(x)=${carreMoinsCarreLatex(e.k)}`, "argument"), ligne("u'(x)=2x", "on dérive l'argument"), ligne(`f'(x)=\\dfrac{2x}{(${carreMoinsCarreLatex(e.k)})\\ln(${b})}`, justif("", { l: REGLE_LOG })), ...finale(rep, `\\dfrac{2x}{(${carreMoinsCarreLatex(e.k)})\\ln(${b})}`, justif("", { l: `${e.k}^2=${e.k * e.k}` }))];
    lePiege = [texte("Le domaine est la réunion de deux intervalles : "), latex(`x^2>${e.k * e.k}`), texte(" ne se résout pas en "), latex(`x>${e.k}`), texte(" seulement.")];
  } else {
    const xp = formatXMoins(e.p);
    dom = [...lignesPositif(1, -e.p, justif("", { l: `\\sqrt{${xp}}>0` }, " : radicande strictement positif"))];
    formule = [texte("On simplifie d'abord avec la propriété de la puissance ("), latex("\\sqrt{u}=u^{\\frac{1}{2}}"), texte("), puis "), latex(REGLE_LOG)];
    der = [
      ligne(`f(x)=\\dfrac{1}{2}\\log_{${b}}(${xp})`, justif("", { l: "\\log_b\\!\\left(\\sqrt{u}\\right)=\\dfrac{1}{2}\\log_b(u)" })),
      ligne(`f'(x)=\\dfrac{1}{2}\\cdot\\dfrac{1}{${e.p === 0 ? "x" : `(${xp})`}\\ln(${b})}`, justif("", { l: REGLE_LOG }, ", u′ = 1")),
      ...finale(rep, "", "on multiplie les fractions"),
    ];
  }
  const etapes = [...etapeDomaine("a", dom, domaineL(e)), ...etapeDerivee("b", formule, der, rep)];
  if (lePiege) etapes.splice(3, 0, piege("a", lePiege));
  return etapes;
}

// ---------------------------------------------------------------------------- Famille C

function correctionC(e: ExerciceDomaineDeriveeLogC): EtapeCorrection[] {
  const { u, uPrime, v, vPrime } = facteursLatexC(e);
  let dom: LigneCalcul[];
  switch (e.sousType) {
    case "produitLn":
    case "expoLn":
      dom = [ligne("x>0", justif("argument de ", { l: "\\ln(x)" }))];
      break;
    case "trigLn": {
      const t = e.trig2 === "sin" ? "\\sin(x)" : "\\cos(x)";
      dom = [ligne(`-1\\leq ${t}\\leq 1`, "pour tout réel x"), ligne(`1\\leq 2+${t}\\leq 3`, "on ajoute 2"), ligne(`2+${t}>0`, "argument toujours strictement positif : aucune restriction")];
      break;
    }
    case "carreLn":
      dom = lignesPositif(e.m, e.n, "argument strictement positif");
      break;
    case "lnRacine":
      dom = [ligne("x>0", justif("argument de ", { l: "\\ln(x)" })), ligne(`${carreMoinsCarreLatex(e.k)}\\geq 0`, "radicande positif"), ligne(`|x|\\geq ${e.k}`, justif("", { l: `x^2\\geq ${e.k * e.k}` })), ligne(`x\\geq ${e.k}`, "avec x > 0")];
      break;
  }
  const regleV = e.sousType === "lnRacine" ? justif("", { l: "\\left(\\sqrt{w}\\right)'=\\dfrac{w'}{2\\sqrt{w}}" }) : justif("", { l: REGLE_LN });
  const regleU = e.sousType === "lnRacine" ? justif("", { l: "(\\ln x)'=\\dfrac{1}{x}" }) : e.sousType === "trigLn" ? "dérivée de sin / cos" : e.sousType === "expoLn" ? justif("", { l: "(a^x)'=\\ln(a)\\cdot a^x" }) : "on dérive";
  const repF = reponseAttendueLatex(e, "cFacteurs");
  const rep = reponseAttendueLatex(e, "cAssemblage");
  const sub = `${p(uPrime)}\\cdot ${v}+${p(u)}\\cdot ${p(vPrime)}`;
  return [
    ...etapeDomaine("a", dom, domaineL(e)),
    utilise("b", [texte("f est un produit "), latex("u\\cdot v"), texte(" : on dérive chaque facteur séparément, avec les dérivées de référence et "), latex(REGLE_LN), texte(` ${COURS_DERIVEE}.`)]),
    calcul("b", [ligne(`u(x)=${u}`, "premier facteur"), ligne(`u'(x)=${uPrime}`, regleU), ligne(`v(x)=${v}`, "second facteur"), ligne(`v'(x)=${vPrime}`, regleV)]),
    resultat("b", [latex(repF ?? "")]),
    utilise("c", [texte("Dérivée d'un produit : "), latex("(uv)'=u'v+uv'"), texte(` ${COURS_DERIVEE}.`)]),
    calcul("c", sansRepetition([ligne(`f'(x)=u'(x)v(x)+u(x)v'(x)`, "dérivée d'un produit"), ligne(`=${sub}`, "on remplace u, u′, v, v′"), ...finale(rep, sub)])),
    resultat("c", [latex(rep ?? "")]),
  ];
}

// ---------------------------------------------------------------------------- Famille D

function correctionD(e: ExerciceDomaineDeriveeLogD): EtapeCorrection[] {
  const { n, nPrime, d, dPrime } = nDLatexD(e);
  const lnB = e.sousType !== "lnSurKx" && !e.baseEstE ? `\\ln(${e.base})` : "";
  let dom: LigneCalcul[];
  let assemblage: LigneCalcul[];
  const rep = reponseAttendueLatex(e, "dAssemblage");
  const sub = `\\dfrac{${p(nPrime)}\\cdot ${p(d)}-${p(n)}\\cdot ${p(dPrime)}}{${e.sousType === "lnSurKx" ? `(${d})^2` : e.sousType === "expoSurLn" ? `\\left(${d}\\right)^2` : `${d}^2`}}`;
  if (e.sousType === "sommeLog") {
    dom = [ligne("x>0", justif("argument du logarithme (le dénominateur ", { l: "x" }, " est alors non nul)"))];
    assemblage = [
      ligne(`=${sub}`, "on remplace N, N′, D, D′"),
      ligne(lnB ? `=\\dfrac{x+\\dfrac{1}{${lnB}}-x-\\log_{${e.base}}(x)}{x^2}` : `=\\dfrac{x+1-x-\\ln(x)}{x^2}`, "on distribue"),
      ...(lnB ? [ligne(`=\\dfrac{\\dfrac{1}{${lnB}}-\\dfrac{\\ln(x)}{${lnB}}}{x^2}`, justif("", { l: `x-x=0` }, " et ", { l: `\\log_{${e.base}}(x)=\\dfrac{\\ln(x)}{\\ln(${e.base})}` }))] : []),
      ...finale(rep, "", lnB ? justif("on multiplie numérateur et dénominateur par ", { l: lnB }) : justif("", { l: "x-x=0" })),
    ];
  } else if (e.sousType === "lnSurKx") {
    dom = [ligne("x>0", justif("argument de ", { l: "\\ln(x)" }, " (alors ", { l: `${e.k}x\\neq 0` }, ")"))];
    assemblage = [ligne(`=${sub}`, "on remplace N, N′, D, D′"), ligne(`=\\dfrac{${e.k}-${e.k}\\ln(x)}{${e.k * e.k}x^2}`, justif("", { l: `\\dfrac{1}{x}\\cdot ${e.k}x=${e.k}` })), ...finale(rep, "", `on simplifie par ${e.k}`)];
  } else {
    dom = [ligne("x>0", justif("argument de ", { l: "\\ln(x)" })), ligne("\\ln(x)\\neq 0", "dénominateur non nul"), ligne("x\\neq 1", justif("car ", { l: "\\ln(1)=0" }))];
    assemblage = [ligne(`=${sub}`, "on remplace N, N′, D, D′"), ...finale(rep, sub, "on écrit le produit par 1/x en fraction")];
  }
  return [
    ...etapeDomaine("a", dom, domaineL(e)),
    utilise("b", [texte("f est un quotient "), latex("\\dfrac{N}{D}"), texte(" : on dérive le numérateur et le dénominateur séparément "), texte(COURS_DERIVEE), texte(".")]),
    calcul("b", [
      ligne(`N(x)=${n}`, "numérateur"),
      ligne(`N'(x)=${nPrime}`, e.sousType === "expoSurLn" ? justif("", { l: "(a^x)'=\\ln(a)\\cdot a^x" }) : justif("", { l: e.sousType === "sommeLog" && lnB ? "(\\log_b x)'=\\dfrac{1}{x\\ln(b)}" : "(\\ln x)'=\\dfrac{1}{x}" })),
      ligne(`D(x)=${d}`, "dénominateur"),
      ligne(`D'(x)=${dPrime}`, e.sousType === "expoSurLn" ? justif("", { l: "(\\ln x)'=\\dfrac{1}{x}" }) : "on dérive"),
    ]),
    resultat("b", [latex(reponseAttendueLatex(e, "dND") ?? "")]),
    utilise("c", [texte("Dérivée d'un quotient : "), latex("\\left(\\dfrac{N}{D}\\right)'=\\dfrac{N'D-ND'}{D^2}"), texte(` ${COURS_DERIVEE}.`)]),
    calcul("c", sansRepetition([ligne("f'(x)=\\dfrac{N'(x)D(x)-N(x)D'(x)}{D(x)^2}", "dérivée d'un quotient"), ...assemblage])),
    resultat("c", [latex(rep ?? "")]),
    ...(e.sousType === "expoSurLn" ? [piege("a", [texte("Le dénominateur "), latex("\\ln(x)"), texte(" s'annule en "), latex("x=1"), texte(" : ce point est exclu du domaine.")])] : []),
  ];
}

// ---------------------------------------------------------------------------- Famille E

function correctionE(e: ExerciceDomaineDeriveeLogE): EtapeCorrection[] {
  const origine = formatFonctionEOrigine(e);
  const simple = formeSimplifieeLatexE(e);
  const repS = reponseAttendueLatex(e, "eSimplifier");
  const rep = reponseAttendueLatex(e, "eDerivee");
  let dom: LigneCalcul[];
  let simpl: LigneCalcul[];
  let der: LigneCalcul[];
  switch (e.sousType) {
    case "puissanceAbs":
      dom = [ligne("(e^x-1)^2>0", "argument strictement positif"), ligne("e^x-1\\neq 0", "un carré est strictement positif sauf s'il est nul"), ligne("e^x\\neq 1", "on ajoute 1"), ligne("x\\neq 0", justif("car ", { l: "e^0=1" }))];
      simpl = [ligne(`f(x)=${origine}`), ligne("=\\ln\\left(|e^x-1|^2\\right)", justif("", { l: "u^2=|u|^2" })), ligne(`=${simple}`, justif("", { l: "\\ln(a^n)=n\\ln(a)" }, " avec a = |u| > 0"))];
      der = [ligne(`f'(x)=2\\cdot\\dfrac{e^x}{e^x-1}`, justif("", { l: "\\left(\\ln|u|\\right)'=\\dfrac{u'}{u}" }))];
      break;
    case "quotientDifference": {
      const A = formatAffine(e.m, e.n);
      const B = formatAffine(e.p, e.q);
      dom = [ligne(`\\dfrac{${A}}{${B}}>0`, "argument strictement positif"), ligne(`${A}=0\\iff x=${frac(-e.n, e.m)}`, "racine du numérateur"), ligne(`${B}=0\\iff x=${frac(-e.q, e.p)}`, "racine du dénominateur"), ligne(`x\\in ${domaineL(e)}`, "tableau de signes : numérateur et dénominateur de même signe")];
      simpl = [ligne(`f(x)=${origine}`), ligne(`=${simple}`, justif("propriété du quotient (", { l: A }, " et ", { l: B }, " positifs sur le domaine)"))];
      der = [ligne(`f'(x)=\\dfrac{${e.m}}{${A}}-\\dfrac{${e.p}}{${B}}`, justif("", { l: REGLE_LN }))];
      break;
    }
    case "puissanceSimple":
      dom = [ligne("x\\geq 0", "radicande positif"), ligne("\\sqrt{x}>0", "argument du logarithme"), ligne("x>0", "les deux conditions ensemble")];
      simpl = [ligne(`f(x)=${origine}`), ligne("=\\ln\\left(x^{\\frac{1}{2}}\\right)", justif("", { l: "\\sqrt{x}=x^{\\frac{1}{2}}" })), ligne(`=${simple}`, justif("", { l: "\\ln(a^n)=n\\ln(a)" }))];
      der = [ligne("f'(x)=\\dfrac{1}{2}\\cdot\\dfrac{1}{x}", justif("", { l: "(\\ln x)'=\\dfrac{1}{x}" }))];
      break;
    case "combinaison":
      dom = [ligne("x>0", justif("argument de ", { l: "\\ln x" })), ligne("x^3>0", justif("argument de ", { l: "\\ln(x^3)" }, " : vrai dès que x > 0"))];
      simpl = [ligne(`f(x)=${origine}`), ligne(`=${simple}`, justif("", { l: "\\ln(x^3)=3\\ln(x)" }, " ; le premier terme reste tel quel"))];
      der = [ligne("f'(x)=3(\\ln x)^2\\cdot\\dfrac{1}{x}-3\\cdot\\dfrac{1}{x}", justif("", { l: "(u^3)'=3u^2u'" }))];
      break;
    case "valeurAbsolueQuadratique":
      dom = [ligne(`(${carreMoinsCarreLatex(e.k)})^2>0`, "argument strictement positif"), ligne(`${carreMoinsCarreLatex(e.k)}\\neq 0`, "un carré est strictement positif sauf s'il est nul"), ligne(`x^2\\neq ${e.k * e.k}`, `on ajoute ${e.k * e.k}`), ligne(`x\\neq\\pm ${e.k}`, "racine carrée")];
      simpl = [ligne(`f(x)=${origine}`), ligne(`=\\ln\\left(|${carreMoinsCarreLatex(e.k)}|^2\\right)`, justif("", { l: "u^2=|u|^2" })), ligne(`=${simple}`, justif("", { l: "\\ln(a^n)=n\\ln(a)" }, " avec a = |u| > 0"))];
      der = [ligne(`f'(x)=2\\cdot\\dfrac{2x}{${carreMoinsCarreLatex(e.k)}}`, justif("", { l: "\\left(\\ln|u|\\right)'=\\dfrac{u'}{u}" }))];
      break;
    case "dejaSimplifie":
      dom = [ligne("x>0", justif("base d'une puissance à exposant réel (alors ", { l: "x^x>0" }, ")"))];
      simpl = [ligne(`f(x)=${origine}`), ligne(`=${simple}`, justif("", { l: "\\ln(a^n)=n\\ln(a)" }, " avec n = x"))];
      der = [ligne("f'(x)=1\\cdot\\ln(x)+x\\cdot\\dfrac{1}{x}", justif("", { l: "(uv)'=u'v+uv'" }))];
      break;
  }
  const d0 = der[0].latex.replace(/^f'\(x\)=/, "");
  return [
    ...etapeDomaine("a", dom, domaineL(e), "les conditions d'existence sur l'expression de départ (avant toute simplification)"),
    piege("a", [texte("Le domaine se lit sur l'expression de départ, avant toute simplification : la forme simplifiée a parfois un domaine différent.")]),
    utilise("b", [texte("Propriétés du logarithme : "), latex("\\ln(a^n)=n\\ln(a)"), texte(", "), latex("\\ln\\!\\left(\\dfrac{a}{b}\\right)=\\ln(a)-\\ln(b)"), texte(" ; une puissance paire fait apparaître une valeur absolue "), texte(COURS_DERIVEE), texte(".")]),
    calcul("b", simpl),
    resultat("b", [latex(repS ?? "")]),
    utilise("c", [texte("On dérive la forme simplifiée, terme à terme, avec "), latex(REGLE_LN), texte(` ${COURS_DERIVEE}.`)]),
    calcul("c", sansRepetition([ligne(`f(x)=${simple}`, "forme simplifiée de l'étape 2"), ...der, ...finale(rep, d0)])),
    resultat("c", [latex(rep ?? "")]),
  ];
}

// ---------------------------------------------------------------------------- Famille F

function correctionF(e: ExerciceDomaineDeriveeLogF): EtapeCorrection[] {
  const rep = reponseAttendueLatex(e, "fDerivee");
  let dom: LigneCalcul[];
  let der: LigneCalcul[];
  let formule: FragmentConsigne[];
  switch (e.sousType) {
    case "lnSurSin": {
      const D = `${e.a}+\\sin(e^x)`;
      dom = [ligne("-1\\leq\\sin(e^x)\\leq 1", "pour tout réel x"), ligne(`${e.a - 1}\\leq ${D}\\leq ${e.a + 1}`, `on ajoute ${e.a}`), ligne(`${D}>0`, "argument et dénominateur jamais nuls : aucune restriction")];
      formule = [texte("Quotient "), latex("\\dfrac{N}{D}"), texte(" avec "), latex(`N=\\ln(D)`), texte(" ; dérivée en chaîne "), latex("(\\sin w)'=w'\\cos w"), texte(" et "), latex(REGLE_LN)];
      der = [
        ligne(`D(x)=${D}`, "dénominateur"),
        ligne("D'(x)=e^x\\cos(e^x)", justif("", { l: "(\\sin w)'=w'\\cos w" }, ", w = eˣ")),
        ligne(`N(x)=\\ln(${D})`, "numérateur"),
        ligne(`N'(x)=\\dfrac{e^x\\cos(e^x)}{${D}}`, justif("", { l: REGLE_LN })),
        ligne(`f'(x)=\\dfrac{N'(x)D(x)-N(x)D'(x)}{D(x)^2}`, "dérivée d'un quotient"),
        ligne(`=\\dfrac{e^x\\cos(e^x)-\\ln(${D})\\cdot e^x\\cos(e^x)}{(${D})^2}`, justif("", { l: "N'(x)D(x)=D'(x)" })),
        ...finale(rep, "", justif("on met ", { l: "e^x\\cos(e^x)" }, " en évidence")),
      ];
      break;
    }
    case "arcsinLog": {
      const L = `\\log_{${e.base}}(${e.k}^x)`;
      dom = [ligne(`-1\\leq ${L}\\leq 1`, "arcsin est défini sur [−1 ; 1]"), ligne(`${L}=x\\log_{${e.base}}(${e.k})`, justif("", { l: "\\log_b(a^x)=x\\log_b(a)" })), ligne(`=${e.p}x`, justif("car ", { l: `${e.k}=${e.base}^{${e.p}}` })), ligne(`-1\\leq ${e.p}x\\leq 1`, "on remplace"), ligne(`-\\dfrac{1}{${e.p}}\\leq x\\leq\\dfrac{1}{${e.p}}`, `on divise par ${e.p}`)];
      formule = [texte("On simplifie l'argument, puis "), latex("\\left(\\arcsin u\\right)'=\\dfrac{u'}{\\sqrt{1-u^2}}")];
      der = [ligne(`f(x)=\\arcsin(${e.p}x)`, justif("", { l: `${L}=${e.p}x` })), ligne(`f'(x)=\\dfrac{${e.p}}{\\sqrt{1-(${e.p}x)^2}}`, justif("", { l: "\\left(\\arcsin u\\right)'=\\dfrac{u'}{\\sqrt{1-u^2}}" }, `, u = ${e.p}x`)), ...finale(rep, "", justif("", { l: `(${e.p}x)^2=${e.p * e.p}x^2` }))];
      break;
    }
    case "arcsinLogX": {
      const b = e.base;
      dom = [ligne("x>0", justif("argument de ", { l: `\\log_{${b}}(x)` })), ligne(`-1\\leq\\log_{${b}}(x)\\leq 1`, "arcsin est défini sur [−1 ; 1]"), ligne(`${b}^{-1}\\leq x\\leq ${b}^{1}`, `on applique la puissance de base ${b} (croissante)`), ligne(`\\dfrac{1}{${b}}\\leq x\\leq ${b}`, "on calcule")];
      formule = [latex("\\left(\\arcsin u\\right)'=\\dfrac{u'}{\\sqrt{1-u^2}}"), texte(" avec "), latex(`u=\\log_{${b}}(x)`), texte(" et "), latex(REGLE_LOG)];
      der = [ligne(`u(x)=\\log_{${b}}(x)`, "fonction intérieure"), ligne(`u'(x)=\\dfrac{1}{x\\ln(${b})}`, justif("", { l: REGLE_LOG })), ligne(`f'(x)=\\dfrac{u'(x)}{\\sqrt{1-u(x)^2}}`, "dérivée de arcsin u"), ...finale(rep, "", "on remplace u et u′")];
      break;
    }
    case "arctanLog": {
      const b = e.base;
      const kx = formatKx(e.k);
      const D = `1-\\log_{${b}}(x)`;
      const k2 = e.k === 1 ? "x^2" : `${e.k * e.k}x^2`;
      dom = [ligne("x>0", justif("argument de ", { l: `\\log_{${b}}(x)` })), ligne(`${D}\\neq 0`, "dénominateur non nul"), ligne(`\\log_{${b}}(x)\\neq 1`, "on isole le logarithme"), ligne(`x\\neq ${b}`, justif("car ", { l: `\\log_{${b}}(${b})=1` }))];
      formule = [texte("Dérivée d'un quotient "), latex("\\dfrac{N'D-ND'}{D^2}"), texte(", avec "), latex("\\left(\\arctan u\\right)'=\\dfrac{u'}{1+u^2}"), texte(" et "), latex(REGLE_LOG)];
      der = [
        ligne(`N(x)=\\arctan(${kx})`, "numérateur"),
        ligne(`N'(x)=\\dfrac{${e.k}}{1+${k2}}`, justif("", { l: "\\left(\\arctan u\\right)'=\\dfrac{u'}{1+u^2}" })),
        ligne(`D(x)=${D}`, "dénominateur"),
        ligne(`D'(x)=-\\dfrac{1}{x\\ln(${b})}`, justif("", { l: REGLE_LOG })),
        ligne(`f'(x)=\\dfrac{N'(x)D(x)-N(x)D'(x)}{D(x)^2}`, "dérivée d'un quotient"),
        ...finale(rep, "", justif("on remplace ; ", { l: "-N\\cdot D'" }, " devient un + ")),
      ];
      break;
    }
  }
  const etapes = [...etapeDomaine("a", dom, domaineL(e)), ...etapeDerivee("b", formule, der, rep)];
  if (e.sousType === "arctanLog") etapes.splice(3, 0, piege("a", [texte("Le dénominateur ne peut pas s'annuler : "), latex(`1-\\log_{${e.base}}(x)\\neq 0\\iff x\\neq ${e.base}`), texte(".")]));
  return etapes;
}

// ---------------------------------------------------------------------------- Famille G

function correctionG(e: ExerciceDomaineDeriveeLogG): EtapeCorrection[] {
  const { u, v, uPrime, vPrime } = uvLatexG(e);
  const f0 = droite(blocDonnees(e)[0]);
  const uv = formeUVLatexG(e);
  const a = e.a;
  let ident: LigneCalcul[];
  if (e.variante === "racineXPuissanceX") ident = [ligne(`f(x)=${f0}`), ligne("=x^{1}\\cdot\\left(x^{\\frac{1}{2}}\\right)^{x}", justif("", { l: "\\sqrt{x}=x^{\\frac{1}{2}}" })), ligne("=x^{1}\\cdot x^{\\frac{x}{2}}", justif("", { l: "(a^m)^n=a^{mn}" })), ligne(`=${uv}`, justif("", { l: "a^m\\cdot a^n=a^{m+n}" }))];
  else if (e.variante === "xRacineXPuissanceX") ident = [ligne(`f(x)=${f0}`), ligne("=x^{1}\\cdot\\left(x^{x}\\right)^{\\frac{1}{2}}", justif("", { l: "\\sqrt{a}=a^{\\frac{1}{2}}" })), ligne("=x^{1}\\cdot x^{\\frac{x}{2}}", justif("", { l: "(a^m)^n=a^{mn}" })), ligne(`=${uv}`, justif("", { l: "a^m\\cdot a^n=a^{m+n}" }))];
  else if (e.variante === "produit") ident = [ligne(`f(x)=${f0}`), ligne(`=(x+${a})\\cdot x^{-(x+${a})}`, justif("", { l: "\\dfrac{1}{a^n}=a^{-n}" })), ligne(`u(x)^{v(x)}=${uv}`, justif("base ", { l: `u=${u}` }, ", exposant ", { l: `v=${v}` }))];
  else ident = [ligne(`f(x)=${f0}`), ligne(`=${uv}`, justif("base ", { l: `u(x)=${u}` }, ", exposant ", { l: `v(x)=${v}` }))];
  const repI = reponseAttendueLatex(e, "gIdentifier");
  const repF = reponseAttendueLatex(e, "gFPrimeSurF");
  const rep = reponseAttendueLatex(e, "gIsoler");
  const sub = `${vPrime === "1" ? "" : p(vPrime)}\\ln\\left(${u}\\right)+${p(v)}\\cdot\\dfrac{${uPrime}}{${u}}`;
  const fpf: LigneCalcul[] =
    e.variante === "produit"
      ? [
          ligne(`\\ln f(x)=\\ln(x+${a})+v(x)\\ln u(x)`, "on prend ln des deux membres (produit, puissance)"),
          ligne(`\\dfrac{f'(x)}{f(x)}=\\dfrac{1}{x+${a}}+v'(x)\\ln u(x)+v(x)\\dfrac{u'(x)}{u(x)}`, "on dérive les deux membres"),
          ligne(`=\\dfrac{1}{x+${a}}+${sub}`, "on remplace u, u′, v, v′"),
        ]
      : [
          ligne(`\\ln f(x)=v(x)\\ln u(x)`, justif("on prend ln des deux membres : ", { l: "\\ln(u^v)=v\\ln u" })),
          ligne(`\\dfrac{f'(x)}{f(x)}=v'(x)\\ln u(x)+v(x)\\dfrac{u'(x)}{u(x)}`, justif("on dérive : ", { l: "(\\ln f)'=\\dfrac{f'}{f}" }, " et produit")),
          ligne(`=${sub}`, "on remplace u, u′, v, v′"),
        ];
  fpf.push(...finale(repF, fpf[fpf.length - 1].latex.slice(1)));
  return [
    utilise("a", [texte("On ramène f à une seule base variable élevée à un seul exposant variable, avec les propriétés des puissances "), texte(COURS_DERIVEE), texte(".")]),
    calcul("a", ident),
    resultat("a", [latex(repI ?? "")]),
    utilise("b", [texte("Dérivation logarithmique : "), latex("\\ln f=v\\ln u\\;\\Rightarrow\\;\\dfrac{f'}{f}=v'\\ln u+v\\dfrac{u'}{u}"), texte(` ${COURS_DERIVEE}.`)]),
    calcul("b", [ligne(`u(x)=${u}`, "base"), ligne(`u'(x)=${uPrime}`, "on dérive la base"), ligne(`v(x)=${v}`, "exposant"), ligne(`v'(x)=${vPrime}`, "on dérive l'exposant"), ...sansRepetition(fpf)], [], "Calcul"),
    resultat("b", [latex(repF ?? "")]),
    piege("b", [texte("On ne dérive pas "), latex("u^v"), texte(" comme une puissance à exposant constant ("), latex("v\\cdot u^{v-1}"), texte(") ni comme une exponentielle à base constante ("), latex("u^v\\ln u"), texte(") : base et exposant varient, il faut les deux termes.")]),
    utilise("c", [texte("On multiplie "), latex("\\dfrac{f'}{f}"), texte(" par f.")]),
    calcul("c", sansRepetition([ligne("f'(x)=f(x)\\cdot\\dfrac{f'(x)}{f(x)}", "on multiplie par f(x)"), ligne(`=${droite(rep)}`, "on remplace f et f′/f")])),
    resultat("c", [latex(rep ?? "")]),
  ];
}

function ordonner(etapes: EtapeCorrection[]): EtapeCorrection[] {
  return [...etapes].sort((a, b) => (a.sousQuestion ?? "").localeCompare(b.sousQuestion ?? ""));
}

export function correctionDetailleeDomaineDeriveeLog(exercice: ExerciceDomaineDeriveeLogarithme): EtapeCorrection[] {
  const c = (() => {
    switch (exercice.famille) {
      case "A":
        return correctionA(exercice);
      case "B":
        return correctionB(exercice);
      case "C":
        return correctionC(exercice);
      case "D":
        return correctionD(exercice);
      case "E":
        return correctionE(exercice);
      case "F":
        return correctionF(exercice);
      case "G":
        return correctionG(exercice);
    }
  })();
  return finaliserCorrige(ordonner(c));
}

export { fSimplifieeLatexG };
