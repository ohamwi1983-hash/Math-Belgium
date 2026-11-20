import type { Arcfonction } from "../../core6e/cyclometrique.types";
import type { ExerciceDeriveesCyclometriques } from "../../core6e/deriveesCyclometriques.types";
import type { EtapeCorrection, FragmentConsigne, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import { phaseApres, phaseInitiale, type PhaseDeriveesCyclometriques } from "../../moteur6e/typesDeriveesCyclometriques";
import {
  formatAffineLatex,
  formatFonctionALatex,
  formatFonctionBLatex,
  formatFonctionCLatex,
  formatFonctionDLatex,
  formatFonctionELatex,
  formatFonctionFLatex,
  formatFonctionGLatex,
  formatULatexA,
  formatVLatexB,
} from "../../ui6e/formatDeriveesCyclometriques";
import { type Q, q } from "../../ui6e/corrigeIntegrales1";
import { COURS_DERIVEES, DERIVEE_ARC_U, NOM_ARC, finaliser, justif, ligne, lignesPropres } from "../../ui6e/corrigeReciproques";

/**
 * Corrigé détaillé « comme au tableau » de `6gen4` (dérivées des fonctions cyclométriques) — règle
 * `.claude/rules/feuilles-evaluations.md`. SOURCE UNIQUE : adaptateur papier ET appli
 * (`App6gen4.tsx`, qui affiche aussi le « Résultat » de l'écran comme réponse attendue). Une lettre
 * par ÉCRAN (`phaseInitiale` → `phaseApres` du moteur, 2 à 4 écrans selon la famille). Règle de la
 * chaîne ligne à ligne : fonction intérieure, sa dérivée, formule, substitution, simplification.
 */

type E = ExerciceDeriveesCyclometriques;
type Fragments = FragmentConsigne[];

export function sequenceDeriveesCyclometriques(e: E): PhaseDeriveesCyclometriques[] {
  const phases: PhaseDeriveesCyclometriques[] = [];
  let p: PhaseDeriveesCyclometriques | "termine" = phaseInitiale(e);
  while (p !== "termine") {
    phases.push(p);
    p = phaseApres(p);
  }
  return phases;
}

// ============================================================================
// Écritures.
// ============================================================================

/** « 2x » (a = 1 : « x »). */
function ax(a: number): string {
  return a === 1 ? "x" : `${a}x`;
}

/** Carré de « a·x » développé : « 4x^{2} » (a = 1 : « x^{2} »). */
function axCarre(a: number): string {
  return a * a === 1 ? "x^{2}" : `${a * a}x^{2}`;
}

/** kc·expr : « expr », « -expr » (« -\\left(-…\\right) » si expr commence par « − »), « 3\\cdot expr ». */
function fois(kc: string, expr: string): string {
  const negatif = expr.startsWith("-");
  if (kc === "") return expr;
  if (kc === "-") return negatif ? `-\\left(${expr}\\right)` : `-${expr}`;
  return `${kc}\\cdot ${negatif ? `\\left(${expr}\\right)` : expr}`;
}

/** Coefficient devant un facteur : « », « - », « 3 ». */
function coefDevant(k: number): string {
  return k === 1 ? "" : k === -1 ? "-" : `${k}`;
}

/** K·num/den avec le signe devant la fraction et K rationnel (« -\dfrac{3x}{2\sqrt{…}} »). */
function fracK(K: Q, num: string, den: string): string {
  const neg = K.n < 0;
  const n = Math.abs(K.n);
  const numer = n === 1 && num !== "" ? num : `${n}${num}`;
  const denom = K.d === 1 ? den : den === "" ? `${K.d}` : `${K.d}${den}`;
  if (denom === "" || denom === "1") return `${neg ? "-" : ""}${numer}`;
  return `${neg ? "-" : ""}\\dfrac{${numer}}{${denom}}`;
}

/** Dénominateur de la dérivée de l'arcfonction : « \sqrt{1-…} » ou « 1+… ». */
function denArc(arc: Arcfonction, carre: string): string {
  return arc === "arctan" ? `1+${carre}` : `\\sqrt{1-${carre}}`;
}

/** Signe de la dérivée de l'arcfonction (−1 pour arccos). */
function signeArc(arc: Arcfonction): 1 | -1 {
  return arc === "arccos" ? -1 : 1;
}

/** Dérivée de arc(u) écrite avec u' et u substitués, non simplifiée. */
function derArcSubst(arc: Arcfonction, uPrime: string, u: string): string {
  const d = arc === "arctan" ? `1+\\left(${u}\\right)^{2}` : `\\sqrt{1-\\left(${u}\\right)^{2}}`;
  return `${arc === "arccos" ? "-" : ""}\\dfrac{${uPrime}}{${d}}`;
}

function formuleArc(arc: Arcfonction): Fragments {
  return [texte("règle de la chaîne, "), latex(DERIVEE_ARC_U[arc])];
}

function fonctionLatex(e: E): string {
  switch (e.famille) {
    case "A":
      return formatFonctionALatex(e);
    case "B":
      return formatFonctionBLatex(e);
    case "C":
      return formatFonctionCLatex(e);
    case "D":
      return formatFonctionDLatex(e);
    case "E":
      return formatFonctionELatex(e);
    case "F":
      return formatFonctionFLatex(e);
    case "G":
      return formatFonctionGLatex(e);
  }
}

interface Ecran {
  ut: Fragments;
  lignes: LigneCalcul[];
  res: string;
  verif?: { fr: Fragments; lignes?: LigneCalcul[] };
  pg?: Fragments;
}

// ============================================================================
// Famille A — f(x) = c + k·arc(u(x)).
// ============================================================================

function ecransA(e: Extract<E, { famille: "A" }>): Ecran[] {
  const U = formatULatexA(e);
  const arc = e.arcfonction;
  let lignesU: LigneCalcul[];
  let up: string;
  let utU: Fragments;
  switch (e.uType) {
    case "affine":
      up = String(e.a);
      utU = [texte(`u est une fonction affine : sa dérivée est son coefficient de x ${COURS_DERIVEES}.`)];
      lignesU = [ligne(`u(x)=${U}`), ligne(`u'(x)=${up}`, "dérivée d'une fonction affine")];
      break;
    case "puissance":
      up = e.n - 1 === 1 ? `${e.n}x` : `${e.n}x^{${e.n - 1}}`;
      utU = [latex("(x^{n})'=n\\,x^{n-1}"), texte(` ${COURS_DERIVEES}.`)];
      lignesU = [ligne(`u(x)=${U}`), ligne(`u'(x)=${up}`, justif({ l: "(x^{n})'=n\\,x^{n-1}" }))];
      break;
    case "racine":
      up = `\\dfrac{${e.a}}{2\\sqrt{${ax(e.a)}}}`;
      utU = [latex("(\\sqrt{v})'=\\dfrac{v'}{2\\sqrt{v}}"), texte(` ${COURS_DERIVEES}.`)];
      lignesU = [ligne(`u(x)=${U}`), ligne(`u'(x)=\\dfrac{(${ax(e.a)})'}{2\\sqrt{${ax(e.a)}}}`, justif({ l: "(\\sqrt{v})'=\\dfrac{v'}{2\\sqrt{v}}" })), ligne(`=${up}`, justif({ l: `(${ax(e.a)})'=${e.a}` }))];
      break;
    case "reciproque":
      up = `-\\dfrac{${e.kPrime}}{x^{2}}`;
      utU = [latex("\\left(\\dfrac{1}{x}\\right)'=-\\dfrac{1}{x^{2}}"), texte(` ${COURS_DERIVEES}.`)];
      lignesU = [
        ligne(`u(x)=${U}`),
        ...(e.kPrime === 1 ? [] : [ligne(`=${e.kPrime}\\cdot\\dfrac{1}{x}`)]),
        ligne(`u'(x)=${e.kPrime === 1 ? "" : `${e.kPrime}\\cdot`}\\left(-\\dfrac{1}{x^{2}}\\right)`, justif({ l: "\\left(\\dfrac{1}{x}\\right)'=-\\dfrac{1}{x^{2}}" })),
        ligne(`=${up}`),
      ];
      break;
  }
  // Écran b : f'(x) = k · arc'(u) · u'
  const k = e.k;
  const kc = coefDevant(k);
  const fin: LigneCalcul[] = [ligne(`f'(x)=${kc}\\left(${NOM_ARC[arc]}\\left(${U}\\right)\\right)'`, e.c !== 0 ? "la constante a une dérivée nulle" : "le facteur constant reste")];
  fin.push(ligne(`=${fois(kc, `${derArcSubst(arc, up, U)}`)}`, formuleArc(arc)));
  let res: string;
  const s = signeArc(arc);
  switch (e.uType) {
    case "affine": {
      res = fracK(q(s * k * e.a), "", denArc(arc, `\\left(${U}\\right)^{2}`));
      break;
    }
    case "puissance": {
      const carre = `x^{${2 * e.n}}`;
      fin.push(ligne(`=${fois(kc, `${arc === "arccos" ? "-" : ""}\\dfrac{${up}}{${denArc(arc, carre)}}`)}`, justif({ l: `\\left(x^{${e.n}}\\right)^{2}=${carre}` })));
      res = fracK(q(s * k * e.n), e.n - 1 === 1 ? "x" : `x^{${e.n - 1}}`, denArc(arc, carre));
      break;
    }
    case "racine": {
      const carre = ax(e.a);
      fin.push(ligne(`=${fois(kc, `${arc === "arccos" ? "-" : ""}\\dfrac{${up}}{${denArc(arc, carre)}}`)}`, justif({ l: `\\left(\\sqrt{${carre}}\\right)^{2}=${carre}` })));
      res = fracK(q(s * k * e.a, 2), "", `\\sqrt{${carre}}\\,${arc === "arctan" ? `(1+${carre})` : `\\sqrt{1-${carre}}`}`);
      break;
    }
    case "reciproque": {
      const kp2 = e.kPrime * e.kPrime;
      const carre = `\\dfrac{${kp2}}{x^{2}}`;
      fin.push(ligne(`=${fois(kc, `${arc === "arccos" ? "-" : ""}\\dfrac{${up}}{${denArc(arc, carre)}}`)}`, justif({ l: `\\left(\\dfrac{${e.kPrime}}{x}\\right)^{2}=${carre}` })));
      if (arc === "arctan") {
        fin.push(ligne(`=${fracK(q(-k * e.kPrime), "", `x^{2}\\left(1+${carre}\\right)`)}`, "on regroupe les facteurs"));
        res = fracK(q(-k * e.kPrime), "", `x^{2}+${kp2}`);
        fin.push(ligne(`=${res}`, justif("on distribue ", { l: "x^{2}" })));
      } else {
        res = fracK(q(-s * k * e.kPrime), "", `x^{2}\\sqrt{1-${carre}}`);
      }
      break;
    }
  }
  fin.push(ligne(`=${res}`, "on regroupe les facteurs constants"));
  return [
    { ut: utU, lignes: lignesU, res: `u'(x)=${up}` },
    {
      ut: [texte("Règle de la chaîne : "), latex(DERIVEE_ARC_U[arc]), texte(", avec u et u′ de l'étape a ; la constante a une dérivée nulle "), texte(`${COURS_DERIVEES}.`)],
      lignes: lignesPropres(fin),
      res: `f'(x)=${res}`,
      pg: arc === "arccos" ? [texte("La dérivée de arccos porte un signe − : il ne faut pas l'oublier.")] : [texte("On n'oublie pas de multiplier par u′ (règle de la chaîne).")],
    },
  ];
}

// ============================================================================
// Famille B — f(x) = m·x·arc(v(x)).
// ============================================================================

function ecransB(e: Extract<E, { famille: "B" }>): Ecran[] {
  const arc = e.arcfonction;
  const V = formatVLatexB(e);
  const simple = e.vType === "simple";
  const vp = simple ? "1" : `${2 * e.a}x`;
  const carre = simple ? "x^{2}" : `\\left(${V}\\right)^{2}`;
  const s = signeArc(arc);
  const derV = simple ? fracK(q(s), "", denArc(arc, carre)) : fracK(q(s * 2 * e.a), "x", denArc(arc, carre));
  const lignesArc: LigneCalcul[] = [ligne(`v(x)=${V}`), ligne(`v'(x)=${vp}`, simple ? "dérivée de x" : justif({ l: `(${e.a}x^{2})'=${2 * e.a}x` }))];
  lignesArc.push(ligne(`\\left(${NOM_ARC[arc]}\\left(${V}\\right)\\right)'=${derArcSubst(arc, vp, V)}`, formuleArc(arc)));
  if (derArcSubst(arc, vp, V) !== derV) lignesArc.push(ligne(`=${derV}`, "on simplifie"));
  const ux = ax(e.m);
  const fin: LigneCalcul[] = [
    ligne(`f'(x)=u'(x)\\,${NOM_ARC[arc]}\\left(${V}\\right)+u(x)\\left(${NOM_ARC[arc]}\\left(${V}\\right)\\right)'`, justif("règle du produit, ", { l: "(uv)'=u'v+uv'" })),
    ligne(`=${e.m}${NOM_ARC[arc]}\\left(${V}\\right)+${ux}\\cdot ${derV.startsWith("-") ? `\\left(${derV}\\right)` : derV}`, "on remplace par les résultats des étapes a et b"),
  ];
  const second = simple ? fracK(q(s * e.m), "x", denArc(arc, carre)) : fracK(q(s * 2 * e.a * e.m), "x^{2}", denArc(arc, carre));
  const res = `${e.m}${NOM_ARC[arc]}\\left(${V}\\right)${second.startsWith("-") ? "" : "+"}${second}`;
  fin.push(ligne(`=${res}`, simple ? "on multiplie" : "on multiplie : x · x = x²"));
  return [
    { ut: [texte(`u(x) est une fonction linéaire : sa dérivée est son coefficient ${COURS_DERIVEES}.`)], lignes: [ligne(`u(x)=${ux}`), ligne(`u'(x)=${e.m}`, "dérivée d'une fonction linéaire")], res: `u'(x)=${e.m}` },
    { ut: [texte("Règle de la chaîne : "), latex(DERIVEE_ARC_U[arc]), texte(` ${COURS_DERIVEES}.`)], lignes: lignesPropres(lignesArc), res: `\\left(${NOM_ARC[arc]}\\left(${V}\\right)\\right)'=${derV}`, pg: simple ? undefined : [texte("La règle de la chaîne fait apparaître le facteur "), latex(`v'(x)=${vp}`), texte(" au numérateur.")] },
    {
      ut: [texte("Règle du produit "), latex("(uv)'=u'v+uv'"), texte(`, avec les dérivées des étapes a et b ${COURS_DERIVEES}.`)],
      lignes: lignesPropres(fin),
      res: `f'(x)=${res}`,
      pg: [texte("La règle du produit donne deux termes : on n'oublie pas "), latex(`${e.m}${NOM_ARC[arc]}\\left(${V}\\right)`), texte(".")],
    },
  ];
}

// ============================================================================
// Famille C — f(x) = k·arc(ax) / √(1 − (ax)²).
// ============================================================================

function ecransC(e: Extract<E, { famille: "C" }>): Ecran[] {
  const arc = e.arcfonction;
  const s = signeArc(arc);
  const A = ax(e.a);
  const A2 = axCarre(e.a);
  const R = `\\sqrt{1-${A2}}`;
  const N = `${coefDevant(e.k)}${NOM_ARC[arc]}\\left(${A}\\right)`;
  const nPrime = fracK(q(s * e.k * e.a), "", R);
  const dPrime = fracK(q(-e.a * e.a), "x", R);
  const lignesN: LigneCalcul[] = [
    ligne(`N(x)=${N}`),
    ligne(`N'(x)=${e.k === 1 ? "" : `${e.k}\\cdot `}${derArcSubst(arc, String(e.a), A)}`, formuleArc(arc)),
    ligne(`=${nPrime}`, justif({ l: `(${A})^{2}=${A2}` })),
  ];
  const lignesD: LigneCalcul[] = [
    ligne(`D(x)=${R}`),
    ligne(`D'(x)=\\dfrac{\\left(1-${A2}\\right)'}{2${R}}`, justif({ l: "(\\sqrt{v})'=\\dfrac{v'}{2\\sqrt{v}}" })),
    ligne(`=\\dfrac{-${2 * e.a * e.a}x}{2${R}}`, justif({ l: `\\left(1-${A2}\\right)'=-${2 * e.a * e.a}x` })),
    ligne(`=${dPrime}`, "on simplifie par 2"),
  ];
  const kA = s * e.k * e.a;
  const kA2 = e.k * e.a * e.a;
  const NpD = `${kA}`;
  const NDp = fracK(q(-kA2), `x${NOM_ARC[arc]}\\left(${A}\\right)`, R);
  const fin: LigneCalcul[] = [
    ligne(`N'(x)\\,D(x)=${nPrime}\\cdot ${R}`, "étapes a et b"),
    ligne(`=${NpD}`, "la racine se simplifie"),
    ligne(`N(x)\\,D'(x)=${N}\\cdot\\left(${dPrime}\\right)`),
    ligne(`=${NDp}`),
    ligne(`D(x)^{2}=1-${A2}`),
    ligne(`f'(x)=\\dfrac{N'(x)D(x)-N(x)D'(x)}{D(x)^{2}}`, justif("règle du quotient, ", { l: "\\left(\\dfrac{N}{D}\\right)'=\\dfrac{N'D-ND'}{D^{2}}" })),
    ligne(`=\\dfrac{${NpD}+${fracK(q(kA2), `x${NOM_ARC[arc]}\\left(${A}\\right)`, R)}}{1-${A2}}`, "on remplace"),
  ];
  const num = `${kA}${R}${kA2 > 0 ? "+" : "-"}${Math.abs(kA2) === 1 ? "" : Math.abs(kA2)}x${NOM_ARC[arc]}\\left(${A}\\right)`;
  const res = `\\dfrac{${num}}{\\left(1-${A2}\\right)${R}}`;
  fin.push(ligne(`=${res}`, justif("on multiplie numérateur et dénominateur par ", { l: R })));
  return [
    { ut: [texte("Règle de la chaîne : "), latex(DERIVEE_ARC_U[arc]), texte(` ${COURS_DERIVEES}.`)], lignes: lignesN, res: `N'(x)=${nPrime}` },
    { ut: [latex("(\\sqrt{v})'=\\dfrac{v'}{2\\sqrt{v}}"), texte(` ${COURS_DERIVEES}.`)], lignes: lignesD, res: `D'(x)=${dPrime}` },
    {
      ut: [texte("Règle du quotient "), latex("\\left(\\dfrac{N}{D}\\right)'=\\dfrac{N'D-ND'}{D^{2}}"), texte(`, avec N′ et D′ des étapes a et b ${COURS_DERIVEES}.`)],
      lignes: lignesPropres(fin),
      res: `f'(x)=${res}`,
      pg: [texte("Le signe − de la règle du quotient et celui de D′ se compensent : le second terme du numérateur est ajouté.")],
    },
  ];
}

// ============================================================================
// Famille D — f(x) = arcsin(u)/arccos(u) ou l'inverse, u = ax + b.
// ============================================================================

function ecransD(e: Extract<E, { famille: "D" }>): Ecran[] {
  const U = formatAffineLatex(e.a, e.b);
  const sinHaut = e.orientation === "sinSurCos";
  const haut: Arcfonction = sinHaut ? "arcsin" : "arccos";
  const bas: Arcfonction = sinHaut ? "arccos" : "arcsin";
  const R = `\\sqrt{1-\\left(${U}\\right)^{2}}`;
  const nP = fracK(q(signeArc(haut) * e.a), "", R);
  const dP = fracK(q(signeArc(bas) * e.a), "", R);
  const lignesUn = (nom: string, arc: Arcfonction, res: string): LigneCalcul[] => [
    ligne(`${nom}(x)=${NOM_ARC[arc]}\\left(${U}\\right)`),
    ligne(`${nom}'(x)=${derArcSubst(arc, String(e.a), U)}`, formuleArc(arc)),
    ...(derArcSubst(arc, String(e.a), U) === res ? [] : [ligne(`=${res}`)]),
  ];
  const Nn = `${NOM_ARC[haut]}\\left(${U}\\right)`;
  const Dd = `${NOM_ARC[bas]}\\left(${U}\\right)`;
  // forme brute : a[arccos + arcsin] / (√(1−u²) · D²)
  const brut = sinHaut ? `\\dfrac{${e.a === 1 ? "" : e.a}\\left[${Dd}+${Nn}\\right]}{${R}\\left(${Dd}\\right)^{2}}` : `-\\dfrac{${e.a === 1 ? "" : e.a}\\left[${Nn}+${Dd}\\right]}{${R}\\left(${Dd}\\right)^{2}}`;
  const lignesBrut: LigneCalcul[] = [
    ligne(`f'(x)=\\dfrac{N'(x)D(x)-N(x)D'(x)}{D(x)^{2}}`, justif("règle du quotient, ", { l: "\\left(\\dfrac{N}{D}\\right)'=\\dfrac{N'D-ND'}{D^{2}}" })),
    ligne(`=\\dfrac{${nP}\\cdot ${Dd}-${Nn}\\cdot\\left(${dP}\\right)}{\\left(${Dd}\\right)^{2}}`, "on remplace par les étapes a et b"),
    ligne(`=${brut}`, justif("on met ", { l: `\\dfrac{${e.a}}{${R}}` }, " en évidence au numérateur")),
  ];
  const simpl = fracK(q(sinHaut ? e.a : -e.a, 2), "\\pi", `${R}\\left(${Dd}\\right)^{2}`);
  const lignesSimpl: LigneCalcul[] = [
    ligne(`${NOM_ARC.arcsin}\\left(${U}\\right)+${NOM_ARC.arccos}\\left(${U}\\right)=\\dfrac{\\pi}{2}`, "identité du cours"),
    ligne(`f'(x)=${sinHaut ? "" : "-"}\\dfrac{${e.a === 1 ? "" : e.a}\\cdot\\dfrac{\\pi}{2}}{${R}\\left(${Dd}\\right)^{2}}`, "on remplace la somme par π/2"),
    ligne(`=${simpl}`, "on simplifie la fraction"),
  ];
  return [
    { ut: [texte("Règle de la chaîne : "), latex(DERIVEE_ARC_U[haut]), texte(` ${COURS_DERIVEES}.`)], lignes: lignesPropres(lignesUn("N", haut, nP)), res: `N'(x)=${nP}` },
    { ut: [texte("Règle de la chaîne : "), latex(DERIVEE_ARC_U[bas]), texte(` ${COURS_DERIVEES}.`)], lignes: lignesPropres(lignesUn("D", bas, dP)), res: `D'(x)=${dP}` },
    {
      ut: [texte("Règle du quotient "), latex("\\left(\\dfrac{N}{D}\\right)'=\\dfrac{N'D-ND'}{D^{2}}"), texte(`, avec N′ et D′ des étapes a et b ${COURS_DERIVEES}.`)],
      lignes: lignesBrut,
      res: `f'(x)=${brut}`,
      pg: [texte("Les dérivées de arcsin et de arccos sont opposées : la différence N′D − ND′ devient une somme.")],
    },
    {
      ut: [texte("Pour tout u de [−1 ; 1], "), latex("\\arcsin u+\\arccos u=\\dfrac{\\pi}{2}"), texte(` ${COURS_DERIVEES}.`)],
      lignes: lignesSimpl,
      res: `f'(x)=${simpl}`,
    },
  ];
}

// ============================================================================
// Famille E — f(x) = g(arc(ax)), g = racine ou carré.
// ============================================================================

function ecransE(e: Extract<E, { famille: "E" }>): Ecran[] {
  const arc = e.arcfonction;
  const A = ax(e.a);
  const A2 = axCarre(e.a);
  const W = `${NOM_ARC[arc]}\\left(${A}\\right)`;
  const s = signeArc(arc);
  const wP = fracK(q(s * e.a), "", denArc(arc, A2));
  const lignesW: LigneCalcul[] = [ligne(`w(x)=${W}`), ligne(`w'(x)=${derArcSubst(arc, String(e.a), A)}`, formuleArc(arc)), ligne(`=${wP}`, justif({ l: `(${A})^{2}=${A2}` }))];
  let fin: LigneCalcul[];
  let res: string;
  if (e.gType === "carre") {
    res = fracK(q(2 * s * e.a), W, denArc(arc, A2));
    fin = [ligne(`f'(x)=2\\,w(x)\\,w'(x)`, justif("règle de la chaîne, ", { l: "(w^{2})'=2w\\,w'" })), ligne(`=2${W}\\cdot ${wP.startsWith("-") ? `\\left(${wP}\\right)` : wP}`, "on remplace"), ligne(`=${res}`, "on multiplie")];
  } else {
    const den = arc === "arctan" ? `2\\left(1+${A2}\\right)\\sqrt{${W}}` : `2\\sqrt{1-${A2}}\\,\\sqrt{${W}}`;
    res = fracK(q(s * e.a), "", den);
    fin = [ligne(`f'(x)=\\dfrac{w'(x)}{2\\sqrt{w(x)}}`, justif("règle de la chaîne, ", { l: "(\\sqrt{w})'=\\dfrac{w'}{2\\sqrt{w}}" })), ligne(`=\\dfrac{${wP}}{2\\sqrt{${W}}}`, "on remplace"), ligne(`=${res}`, "on simplifie la fraction de fraction")];
  }
  return [
    { ut: [texte("Règle de la chaîne : "), latex(DERIVEE_ARC_U[arc]), texte(` ${COURS_DERIVEES}.`)], lignes: lignesPropres(lignesW), res: `w'(x)=${wP}` },
    {
      ut: [texte(e.gType === "carre" ? "La dernière opération est le carré : " : "La dernière opération est la racine carrée : "), latex(e.gType === "carre" ? "(w^{2})'=2w\\,w'" : "(\\sqrt{w})'=\\dfrac{w'}{2\\sqrt{w}}"), texte(`, avec w′ de l'étape a ${COURS_DERIVEES}.`)],
      lignes: lignesPropres(fin),
      res: `f'(x)=${res}`,
      pg: [texte("On dérive d'abord l'opération qui encadre tout (le carré ou la racine), puis on multiplie par w′.")],
    },
  ];
}

// ============================================================================
// Famille F — f(x) = trig(arc(ax)).
// ============================================================================

function ecransF(e: Extract<E, { famille: "F" }>): Ecran[] {
  const arc = e.arcfonction;
  const A = ax(e.a);
  const A2 = axCarre(e.a);
  const R = `\\sqrt{1-${A2}}`;
  const W = `${NOM_ARC[arc]}\\left(${A}\\right)`;
  const s = signeArc(arc);
  const wP = fracK(q(s * e.a), "", R);
  const trigP = e.trig === "sin" ? `\\cos\\left(${W}\\right)` : `-\\sin\\left(${W}\\right)`;
  const brute = `${trigP}\\cdot ${wP.startsWith("-") ? `\\left(${wP}\\right)` : wP}`;
  const lignesBrute: LigneCalcul[] = [
    ligne(`f'(x)=${e.trig === "sin" ? "\\cos" : "-\\sin"}\\left(${W}\\right)\\cdot\\left(${W}\\right)'`, justif("règle de la chaîne, ", { l: e.trig === "sin" ? "(\\sin w)'=\\cos(w)\\,w'" : "(\\cos w)'=-\\sin(w)\\,w'" })),
    ligne(`=${brute}`, formuleArc(arc)),
  ];
  // identité : trig(arc(u)) = u ou √(1 − u²)
  const memeFonction = (e.trig === "cos" && arc === "arccos") || (e.trig === "sin" && arc === "arcsin");
  const trigDeriveeArc = e.trig === "sin" ? "cos" : "sin"; // fonction appliquée à arc dans f'
  const identiteVautU = (trigDeriveeArc === "cos" && arc === "arccos") || (trigDeriveeArc === "sin" && arc === "arcsin");
  const remplace = identiteVautU ? A : R;
  const idL = `\\${trigDeriveeArc}\\left(${W}\\right)=${remplace}`;
  const signeTrig = e.trig === "sin" ? 1 : -1;
  const K = signeTrig * s * e.a;
  const res = identiteVautU ? fracK(q(K * e.a), "x", R) : `${K}`;
  const lignesSimpl: LigneCalcul[] = [
    ligne(idL, identiteVautU ? justif({ l: `\\${trigDeriveeArc}(${NOM_ARC[arc]}\\,u)=u` }) : justif({ l: `\\${trigDeriveeArc}(${NOM_ARC[arc]}\\,u)=\\sqrt{1-u^{2}}` })),
    ligne(`f'(x)=${signeTrig < 0 ? "-" : ""}${identiteVautU ? A : R}\\cdot ${wP.startsWith("-") ? `\\left(${wP}\\right)` : wP}`, "on remplace dans la forme brute"),
    ligne(`=${res}`, identiteVautU ? "on multiplie" : "la racine se simplifie"),
  ];
  const fSimple = memeFonction ? A : R;
  return [
    {
      ut: [texte("Règle de la chaîne à deux niveaux : la fonction trigonométrique, puis l'arcfonction "), latex(DERIVEE_ARC_U[arc]), texte(` ${COURS_DERIVEES}.`)],
      lignes: lignesPropres(lignesBrute),
      res: `f'(x)=${brute}`,
    },
    {
      ut: [texte("Identités : "), latex(`\\cos(\\arccos u)=u`), texte(", "), latex("\\sin(\\arcsin u)=u"), texte(", "), latex("\\sin(\\arccos u)=\\cos(\\arcsin u)=\\sqrt{1-u^{2}}"), texte(` ${COURS_DERIVEES}.`)],
      lignes: lignesPropres(lignesSimpl),
      res: `f'(x)=${res}`,
      verif: { fr: [texte("En simplifiant d'abord f : "), latex(`f(x)=${fSimple}`), texte(", dont la dérivée est la même.")] },
    },
  ];
}

// ============================================================================
// Famille G — h : f(x) = k / arc(x² + c) ; i : f(x) = arc(k / (x + c)).
// ============================================================================

function ecransG(e: Extract<E, { famille: "G" }>): Ecran[] {
  const arc = e.arcfonction;
  const s = signeArc(arc);
  if (e.sousCas === "h") {
    const V = formatAffineLatex(1, e.c, "x^{2}");
    const W = `${NOM_ARC[arc]}\\left(${V}\\right)`;
    const carre = `\\left(${V}\\right)^{2}`;
    const derW = fracK(q(2 * s), "x", denArc(arc, carre));
    const res = fracK(q(-2 * s * e.k), "x", `${arc === "arctan" ? `\\left(1+${carre}\\right)` : `\\sqrt{1-${carre}}\\,`}\\left(${W}\\right)^{2}`);
    return [
      { ut: [texte(`v(x) = x² + c : on dérive terme à terme ${COURS_DERIVEES}.`)], lignes: [ligne(`v(x)=${V}`), ligne("v'(x)=2x", justif("la constante a une dérivée nulle, ", { l: "(x^{2})'=2x" }))], res: "v'(x)=2x" },
      {
        ut: [latex("\\left(\\dfrac{k}{w}\\right)'=-\\dfrac{k\\,w'}{w^{2}}"), texte(" avec "), latex(`w=${W}`), texte(", puis la règle de la chaîne "), latex(DERIVEE_ARC_U[arc]), texte(` ${COURS_DERIVEES}.`)],
        lignes: lignesPropres([
          ligne(`w(x)=${W}`),
          ligne(`w'(x)=${derArcSubst(arc, "2x", V)}`, formuleArc(arc)),
          ligne(`=${derW}`),
          ligne(`f'(x)=-\\dfrac{${e.k}\\,w'(x)}{w(x)^{2}}`, justif({ l: "\\left(\\dfrac{k}{w}\\right)'=-\\dfrac{k\\,w'}{w^{2}}" })),
          ligne(`=-\\dfrac{${e.k}\\cdot ${derW.startsWith("-") ? `\\left(${derW}\\right)` : derW}}{\\left(${W}\\right)^{2}}`, "on remplace"),
          ligne(`=${res}`, "on simplifie la fraction de fraction"),
        ]),
        res: `f'(x)=${res}`,
        pg: [texte("La structure est "), latex(`\\dfrac{${e.k}}{${W}}`), texte(" : on dérive un quotient, la fraction n'est pas à l'intérieur de l'arcfonction.")],
      },
    ];
  }
  const D = formatAffineLatex(1, e.c);
  const U = `\\dfrac{${e.k}}{${D}}`;
  const D2 = e.c === 0 ? "x^{2}" : `\\left(${D}\\right)^{2}`;
  const uP = `-\\dfrac{${e.k}}{${D2}}`;
  const carre = `\\dfrac{${e.k * e.k}}{${D2}}`;
  const lignesFin: LigneCalcul[] = [ligne(`f'(x)=${derArcSubst(arc, "u'(x)", "u(x)")}`, formuleArc(arc)), ligne(`=${derArcSubst(arc, uP, U)}`, "on remplace u et u′")];
  let res: string;
  if (arc === "arctan") {
    lignesFin.push(ligne(`=${fracK(q(-e.k), "", `${D2}\\left(1+${carre}\\right)`)}`, justif({ l: `\\left(${U}\\right)^{2}=${carre}` })));
    res = fracK(q(-e.k), "", `${D2}+${e.k * e.k}`);
    lignesFin.push(ligne(`=${res}`, justif("on distribue ", { l: D2 })));
  } else {
    res = fracK(q(-s * e.k), "", `${D2}\\sqrt{1-${carre}}`);
    lignesFin.push(ligne(`=${res}`, justif({ l: `\\left(${U}\\right)^{2}=${carre}` }, ", on regroupe")));
  }
  return [
    {
      ut: [latex("\\left(\\dfrac{k}{w}\\right)'=-\\dfrac{k\\,w'}{w^{2}}"), texte(` ${COURS_DERIVEES}.`)],
      lignes: [ligne(`u(x)=${U}`), ligne(`u'(x)=${uP}`, justif({ l: "\\left(\\dfrac{k}{w}\\right)'=-\\dfrac{k\\,w'}{w^{2}}" }, " avec ", { l: `w=${D}` }, " et ", { l: "w'=1" }))],
      res: `u'(x)=${uP}`,
    },
    {
      ut: [texte("Règle de la chaîne : "), latex(DERIVEE_ARC_U[arc]), texte(`, avec u et u′ de l'étape a ${COURS_DERIVEES}.`)],
      lignes: lignesPropres(lignesFin),
      res: `f'(x)=${res}`,
      pg: [texte("Ici l'arcfonction encadre la fraction : on applique la règle de la chaîne, pas la règle de dérivation d'un quotient à toute la fonction.")],
    },
  ];
}

function ecrans(e: E): Ecran[] {
  switch (e.famille) {
    case "A":
      return ecransA(e);
    case "B":
      return ecransB(e);
    case "C":
      return ecransC(e);
    case "D":
      return ecransD(e);
    case "E":
      return ecransE(e);
    case "F":
      return ecransF(e);
    case "G":
      return ecransG(e);
  }
}

/** Résultat de chaque écran (même ordre que la séquence), aussi réponse attendue de l'appli. */
export function resultatsEcransDerivees(e: E): string[] {
  return ecrans(e).map((x) => x.res);
}

export function correctionDetailleeDeriveesCyclometriques(e: E): EtapeCorrection[] {
  const L = "abcd";
  const etapes: EtapeCorrection[] = [];
  ecrans(e).forEach((x, i) => {
    const sq = L[i];
    etapes.push(utilise(sq, x.ut), calcul(sq, x.lignes), resultat(sq, [latex(x.res)]));
    if (x.verif) etapes.push(verification(sq, x.verif.fr, x.verif.lignes));
    if (x.pg) etapes.push(piege(sq, x.pg));
  });
  return finaliser(etapes);
}

/** Fonction de l'énoncé (« f(x) = … »). */
export function fonctionDeriveeLatex(e: E): string {
  return fonctionLatex(e);
}

/** Écrans de pure lecture : u′ d'une fonction linéaire (B, a). */
export function lettresLectureDerivees(e: E): string[] {
  return e.famille === "B" ? ["a"] : [];
}

