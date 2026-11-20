import type { ExerciceDomaineDeriveeA, ExerciceDomaineDeriveeB, ExerciceDomaineDeriveeC, ExerciceDomaineDeriveeD, ExerciceDomaineDeriveeE, ExerciceDomaineDeriveeExponentielle, ExerciceDomaineDeriveeF, FormeGA } from "../../core6e/domaineDeriveeExponentielles.types";
import type { EtapeCorrection, FragmentConsigne, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise } from "../../../export/corrigeTableau";
import { phaseApres, phaseInitiale, type PhaseDomaineDeriveeExponentielle } from "../../moteur6e/typesDomaineDeriveeExponentielles";
import { formatEnsembleReelLatex } from "../../ui6e/formatEnsembleReel";
import { COURS_DERIVEE, coefDevant, finaliser, frac, justif, sansRepetition, sommeTermes } from "../../ui6e/corrigeExponentielles1";

/**
 * Corrigé détaillé « comme au tableau » de `6gen7` (domaine et dérivée de fonctions exponentielles)
 * — règle `.claude/rules/feuilles-evaluations.md`. SOURCE UNIQUE : importé par l'adaptateur papier
 * (`exportEvaluation.ts`) ET par l'appli (`App6gen7.tsx`, sous la réponse attendue). Une lettre par
 * ÉCRAN (`phaseInitiale` → `phaseApres`) : domaine, puis dérivée (A, B, F) ou facteurs / N′ et D′ /
 * forme simplifiée, puis assemblage (C, D, E). Dérivées : règle de la chaîne ligne à ligne
 * (u, u′, formule, substitution, simplification) ; le « Résultat » de chaque écran est la réponse
 * attendue affichée par l'appli (`reponseAttendueDomaineDeriveeLatex`).
 */

type Fragments = FragmentConsigne[];
type Ex = ExerciceDomaineDeriveeExponentielle;

export function sequenceDomaineDeriveeExponentielles(e: Ex): PhaseDomaineDeriveeExponentielle[] {
  const phases: PhaseDomaineDeriveeExponentielle[] = [];
  let p: PhaseDomaineDeriveeExponentielle | "termine" = phaseInitiale(e);
  while (p !== "termine") {
    phases.push(p);
    p = phaseApres(p);
  }
  return phases;
}

// ---------------------------------------------------------------------------- écritures

function baseDe(base: number, estE: boolean): string {
  return estE ? "e" : String(base);
}

/** « \ln(b) » (vide pour la base e : ln e = 1). */
function lnDe(b: string): string {
  return b === "e" ? "" : `\\ln(${b})`;
}

/** Produit d'un coefficient entier et de facteurs (« 3\ln(2)\cdot 2^{x} », « -2x\,e^{x^2} »). */
function produit(coef: number, ...facteurs: string[]): string {
  const fs = facteurs.filter((f) => f !== "");
  if (fs.length === 0) return String(coef);
  let corps = "";
  fs.forEach((f, i) => {
    if (i === 0) corps = f;
    else corps += /^[0-9]/.test(f) || /[0-9]$/.test(corps) || /^\\ln/.test(fs[i - 1] ?? "") ? `\\cdot ${f}` : `\\,${f}`;
  });
  if (coef === 1) return corps;
  if (coef === -1) return `-${corps}`;
  return `${coef}${/^[0-9]/.test(corps) ? "\\cdot " : ""}${corps}`;
}

function formeGA(g: FormeGA): string {
  return g.type === "affine" ? sommeTermes([[g.m, "x"], [g.n, ""]]) : g.exposant === 2 ? "x^2" : "x^3";
}

function coeffsGA(g: FormeGA): [number, number, number, number] {
  if (g.type === "affine") return [0, 0, g.m, g.n];
  return g.exposant === 2 ? [0, 1, 0, 0] : [1, 0, 0, 0];
}

function polyLatex([c3, c2, c1, c0]: [number, number, number, number]): string {
  return sommeTermes([[c3, "x^3"], [c2, "x^2"], [c1, "x"], [c0, ""]]);
}

function deriveePoly([c3, c2, c1]: [number, number, number, number]): [number, number, number, number] {
  return [0, 3 * c3, 2 * c2, c1];
}

/** Expression entre parenthèses quand elle a un + / − de niveau 0 ou commence par « − ». */
function par(t: string): string {
  let prof = 0;
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    if (c === "{" || c === "(") prof++;
    else if (c === "}" || c === ")") prof--;
    else if (prof === 0 && (c === "+" || (c === "-" && i > 0))) return `(${t})`;
  }
  return t.startsWith("-") ? `(${t})` : t;
}

/** Monôme « kx » sans coefficient 1. */
function kx(k: number, v = "x"): string {
  return `${coefDevant(k)}${v}`;
}

const formuleChaine = (b: string): Fragments => (b === "e" ? [texte("règle de la chaîne, "), latex("(e^{u})'=u'\\,e^{u}")] : [texte("règle de la chaîne, "), latex("(a^{u})'=u'\\,a^{u}\\ln(a)")]);

/** f′ = u′·b^u·ln b, la forme substituée puis la forme finale (une transformation par ligne). */
function lignesChaine(b: string, u: string, uPrime: string, uPrimeSimple: string | null, finale: string): LigneCalcul[] {
  const lignes: LigneCalcul[] = [ligne(`u(x)=${u}`), ligne(`u'(x)=${uPrime}`)];
  if (uPrimeSimple !== null && uPrimeSimple !== uPrime) lignes.push(ligne(`=${uPrimeSimple}`, "on simplifie"));
  const up = uPrimeSimple ?? uPrime;
  lignes.push(ligne(`f'(x)=u'(x)\\cdot ${b}^{u(x)}${b === "e" ? "" : `\\cdot\\ln(${b})`}`, formuleChaine(b)));
  lignes.push(ligne(`=${par(up)}\\cdot ${b}^{${u.replace(/\\dfrac/g, "\\frac")}}${b === "e" ? "" : `\\cdot\\ln(${b})`}`, "on remplace u et u′"));
  lignes.push(ligne(`=${finale}`, "on ordonne les facteurs"));
  return sansRepetition(lignes);
}

const utiliseChaine = (sq: string, b: string): EtapeCorrection =>
  utilise(sq, [texte("Dérivée d'une exponentielle composée : "), latex(b === "e" ? "\\big(e^{u(x)}\\big)'=u'(x)\\cdot e^{u(x)}" : "\\big(a^{u(x)}\\big)'=u'(x)\\cdot a^{u(x)}\\cdot\\ln(a)"), texte(` ${COURS_DERIVEE}.`)]);

// ---------------------------------------------------------------------------- domaine

function etapesDomaine(e: Ex, sq: string): EtapeCorrection[] {
  const dom = formatEnsembleReelLatex(e.domaine);
  const res = resultat(sq, [latex(`\\mathrm{dom}\\,f=${dom}`)]);
  if (e.famille === "B" && e.sousType === "racine") {
    const k = e.k;
    return [
      utilise(sq, [texte("Une exponentielle est définie pour tout exposant ; la racine carrée exige un radicande positif ou nul "), texte(`${COURS_DERIVEE}.`)]),
      calcul(sq, [ligne(`x^2-${k * k}\\geq 0`, "radicande positif ou nul"), ligne(`x^2\\geq ${k * k}`, `on ajoute ${k * k}`), ligne(`|x|\\geq ${k}`, "on prend la racine carrée"), ligne(`x\\leq -${k}\\ \\text{ou}\\ x\\geq ${k}`, "distance à 0 au moins " + k)]),
      res,
      piege(sq, [texte("La racine de "), latex(`x^2\\geq ${k * k}`), texte(" donne deux demi-droites, pas seulement "), latex(`x\\geq ${k}`), texte(".")]),
    ];
  }
  if (e.famille === "B") {
    const den = sommeTermes([[e.p, "x"], [e.q, ""]]);
    return [
      utilise(sq, [texte("Une exponentielle est définie pour tout exposant ; une fraction exige un dénominateur non nul "), texte(`${COURS_DERIVEE}.`)]),
      calcul(sq, sansRepetition([ligne(`${den}\\neq 0`, "dénominateur de l'exposant"), ...(e.q !== 0 ? [ligne(`${kx(e.p)}\\neq ${-e.q}`, e.q > 0 ? `on soustrait ${e.q}` : `on ajoute ${-e.q}`)] : []), ...(e.p !== 1 ? [ligne(`x\\neq ${frac(-e.q, e.p)}`, `on divise par ${e.p}`)] : [])])),
      res,
    ];
  }
  if (e.famille === "D" && e.sousType === "f") {
    return [
      utilise(sq, [texte("Un quotient exige un dénominateur non nul ; le numérateur, une somme d'exponentielle et de constante, est défini partout "), texte(`${COURS_DERIVEE}.`)]),
      calcul(sq, sansRepetition([ligne(`${kx(e.k)}\\neq 0`, "dénominateur non nul"), ...(e.k !== 1 ? [ligne("x\\neq 0", `on divise par ${e.k}`)] : [])])),
      res,
    ];
  }
  if (e.famille === "C" && e.sousType === "e") {
    return [
      utilise(sq, [texte("La racine carrée de l'exposant exige "), latex("x\\geq 0"), texte(" ; le reste est défini partout "), texte(`${COURS_DERIVEE}.`)]),
      calcul(sq, [ligne("x\\geq 0", [texte("pour que "), latex("\\sqrt{x}"), texte(" existe")])]),
      res,
      piege(sq, [texte("La racine est cachée dans l'exposant : "), latex("e^{\\sqrt{x}}"), texte(" n'existe pas pour "), latex("x<0"), texte(".")]),
    ];
  }
  if (e.famille === "F" && e.trig === "arccos") {
    const r = Math.round(Math.sqrt(e.k));
    return [
      utilise(sq, [latex("\\arccos(w)"), texte(" exige "), latex("-1\\leq w\\leq 1"), texte(" ; une exponentielle est strictement positive et croissante "), texte(`${COURS_DERIVEE}.`)]),
      calcul(sq, [
        ligne(`e^{x^2-${e.k}}>0>-1`, "la condition de gauche est toujours vraie"),
        ligne(`e^{x^2-${e.k}}\\leq 1=e^{0}`, "condition de droite"),
        ligne(`x^2-${e.k}\\leq 0`, "l'exponentielle est croissante : même ordre pour les exposants"),
        ligne(`x^2\\leq ${e.k}`, `on ajoute ${e.k}`),
        ligne(`-${r}\\leq x\\leq ${r}`, "on prend la racine carrée"),
      ]),
      res,
      piege(sq, [texte("La condition "), latex("w\\geq -1"), texte(" est automatique (une exponentielle est positive) : seule "), latex("w\\leq 1"), texte(" restreint le domaine.")]),
    ];
  }
  // Domaine ℝ : on vérifie qu'aucun dénominateur ne s'annule.
  const lignes: LigneCalcul[] = [];
  if (e.famille === "D") {
    const b = baseDe(e.base, e.baseEstE);
    const den = e.sousType === "h" ? `x^2+${e.c}` : e.sousType === "i" ? `${b}^{${kx(e.m)}}+${e.c}` : `${b}^{2x}+1`;
    lignes.push(ligne(`${den}>0`, e.sousType === "h" ? "carré positif plus un nombre positif : jamais nul" : "exponentielle positive plus un nombre positif : jamais nul"));
  } else if (e.famille === "E") {
    const b = e.sousType === "n" ? String(e.base2) : baseDe(e.base, e.baseEstE);
    const den = e.sousType === "j" ? `${b}^{${formeGA(e.h)}}` : `${b}^{x}`;
    lignes.push(ligne(`${den}>0`, "une exponentielle n'est jamais nulle"));
  }
  lignes.push(ligne(`\\mathrm{dom}\\,f=\\mathbb{R}`, lignes.length > 0 ? "aucune restriction" : e.famille === "F" ? "cosinus et exponentielle sont définis pour tout réel" : "exponentielles, polynômes, sinus et cosinus sont définis pour tout réel"));
  return [
    utilise(sq, [texte("Une exponentielle est définie pour tout exposant et n'est jamais nulle ; seul un dénominateur nul ou une racine pourraient restreindre le domaine "), texte(`${COURS_DERIVEE}.`)]),
    calcul(sq, lignes),
    res,
  ];
}

// ---------------------------------------------------------------------------- dérivées

/** Forme finale de f′ (la réponse attendue de l'écran de dérivée, ou de l'assemblage). */
export function deriveeFinaleLatex(e: Ex): string {
  switch (e.famille) {
    case "A": {
      const b = baseDe(e.base, e.baseEstE);
      if (e.sousType === "direct") {
        const g = formeGA(e.g);
        const gp = e.g.type === "affine" ? null : e.g.exposant === 2 ? "2x" : "3x^2";
        return e.g.type === "affine" ? produit(e.g.m, lnDe(b), `${b}^{${g}}`) : produit(1, gp as string, lnDe(b), `${b}^{${g}}`);
      }
      const p = sommeTermes([[e.m, "x"], [e.n, ""]]);
      return produit(2 * e.m, lnDe(b), `${b}^{${p}}`, `\\left(${b}^{${p}}-${e.c}\\right)`);
    }
    case "B": {
      const b = String(e.base);
      if (e.sousType === "racine") {
        const r = `\\sqrt{x^2-${e.k * e.k}}`;
        return `\\dfrac{x\\ln(${b})\\cdot ${b}^{${r}}}{${r}}`;
      }
      const N = sommeTermes([[e.m, "x"], [e.n, ""]]);
      const D = sommeTermes([[e.p, "x"], [e.q, ""]]);
      const c = e.m * e.q - e.n * e.p;
      return `\\dfrac{${produit(c, `\\ln(${b})`, `${b}^{\\frac{${N}}{${D}}}`)}}{${D === "x" ? "x^2" : `(${D})^2`}}`;
    }
    case "C": {
      if (e.sousType === "d") {
        const P = sommeTermes([[e.a, "x^3"], [e.b, "x^2"]]);
        const up = sommeTermes([[3 * e.a, "x^2"], [2 * e.b, "x"]]);
        return `(${up})\\,e^{${P}}\\left(1+${P}\\right)`;
      }
      if (e.sousType === "e") return e.r === 1 ? "e^{\\sqrt{x}}\\left(1+\\dfrac{\\sqrt{x}}{2}\\right)" : "e^{\\sqrt{x}}\\left(2x+\\dfrac{x\\sqrt{x}}{2}\\right)";
      const b = String(e.base);
      return e.trig === "sin" ? `\\ln(${b})\\cdot ${b}^{x}\\sin(x)+(${b}^{x}-${e.c})\\cos(x)` : `\\ln(${b})\\cdot ${b}^{x}\\cos(x)-(${b}^{x}-${e.c})\\sin(x)`;
    }
    case "D": {
      const b = baseDe(e.base, e.baseEstE);
      const ln = lnDe(b);
      if (e.sousType === "f") return `\\dfrac{${produit(1, "x", ln, `${b}^{x}`)}-${b}^{x}-${e.c}}{${kx(e.k)}^2}`.replace(/\{x\}\^2\}$/, "{x^2}");
      if (e.sousType === "h") return `\\dfrac{${ln === "" ? "" : `${ln}\\,`}(${b}^{x}-${b}^{-x})(x^2+${e.c})-2x(${b}^{x}+${b}^{-x})}{(x^2+${e.c})^2}`;
      if (e.sousType === "i") {
        const mx = kx(e.m);
        return `\\dfrac{${kx(e.k)}\\left(2\\cdot ${b}^{${mx}}+${2 * e.c}-${produit(e.m, "x", ln, `${b}^{${mx}}`)}\\right)}{(${b}^{${mx}}+${e.c})^2}`;
      }
      return `\\dfrac{${ln === "" ? "" : `${ln}\\,`}(${b}^{3x}-4\\cdot ${b}^{x}-${b}^{-x})}{(${b}^{2x}+1)^2}`;
    }
    case "E": {
      if (e.sousType === "j") {
        const b = baseDe(e.base, e.baseEstE);
        const diff = coeffsGA(e.g).map((c, i) => c - coeffsGA(e.h)[i]) as [number, number, number, number];
        const dp = deriveePoly(diff);
        if (dp.every((c) => c === 0)) return "0";
        const dpl = polyLatex(dp);
        const estMono = dp.filter((c) => c !== 0).length === 1 && dp[3] !== 0;
        return estMono ? produit(dp[3], lnDe(b), `${b}^{${polyLatex(diff)}}`) : produit(1, `(${dpl})`, lnDe(b), `${b}^{${polyLatex(diff)}}`);
      }
      if (e.sousType === "m") {
        const b = baseDe(e.base, e.baseEstE);
        return produit(1, lnDe(b), `${b}^{-x}`);
      }
      const q = `\\dfrac{${e.base1}}{${e.base2}}`;
      const inv = `\\dfrac{1}{${e.base2}}`;
      return `\\ln\\left(${q}\\right)\\cdot\\left(${q}\\right)^{x}-${e.c === 1 ? "" : `${e.c}`}\\ln\\left(${inv}\\right)\\cdot\\left(${inv}\\right)^{x}`;
    }
    case "F": {
      const w = `e^{x^2-${e.k}}`;
      return e.trig === "cos" ? `-2x\\,${w}\\sin\\left(${w}\\right)` : `-\\dfrac{2x\\,${w}}{\\sqrt{1-\\left(${w}\\right)^2}}`;
    }
  }
}

function etapesA(e: ExerciceDomaineDeriveeA): EtapeCorrection[] {
  const b = baseDe(e.base, e.baseEstE);
  const fin = deriveeFinaleLatex(e);
  if (e.sousType === "direct") {
    const g = formeGA(e.g);
    const gp = e.g.type === "affine" ? String(e.g.m) : e.g.exposant === 2 ? "2x" : "3x^2";
    return [utiliseChaine("b", b), calcul("b", lignesChaine(b, g, gp, null, fin)), resultat("b", [latex(`f'(x)=${fin}`)]), ...(b === "e" ? [] : [piege("b", [texte("Ne pas oublier le facteur "), latex(`\\ln(${b})`), texte(" : il ne disparaît que pour la base "), latex("e"), texte(".")])])];
  }
  const p = sommeTermes([[e.m, "x"], [e.n, ""]]);
  const w = `${b}^{${p}}-${e.c}`;
  const wp = produit(e.m, lnDe(b), `${b}^{${p}}`);
  return [
    utilise("b", [texte("Dérivée d'un carré, "), latex("\\big(w^2\\big)'=2w\\cdot w'"), texte(", puis dérivée de l'exponentielle composée "), latex(b === "e" ? "(e^{u})'=u'\\,e^{u}" : "(a^{u})'=u'\\,a^{u}\\ln(a)"), texte(` ${COURS_DERIVEE}.`)]),
    calcul(
      "b",
      sansRepetition([
        ligne(`w(x)=${w}`),
        ligne(`w'(x)=${wp}`, formuleChaine(b)),
        ligne(`f'(x)=2w(x)\\cdot w'(x)`, justif("car ", { l: "\\big(w^2\\big)'=2w\\,w'" })),
        ligne(`=2\\left(${w}\\right)\\cdot ${wp.startsWith("-") ? `(${wp})` : wp}`, "on remplace w et w′"),
        ligne(`=${fin}`, "on regroupe les nombres"),
      ]),
    ),
    resultat("b", [latex(`f'(x)=${fin}`)]),
    piege("b", [texte("Développer le carré avant de dériver est inutile : la règle "), latex("(w^2)'=2w\\,w'"), texte(" va plus vite, et "), latex("w'"), texte(" n'est pas "), latex("w"), texte(".")]),
  ];
}

function etapesB(e: ExerciceDomaineDeriveeB): EtapeCorrection[] {
  const b = String(e.base);
  const fin = deriveeFinaleLatex(e);
  if (e.sousType === "racine") {
    const v = `x^2-${e.k * e.k}`;
    const r = `\\sqrt{${v}}`;
    return [
      utilise("b", [texte("Deux dérivations imbriquées : "), latex("\\big(a^{u}\\big)'=u'\\cdot a^{u}\\cdot\\ln(a)"), texte(" avec "), latex(`u=${r}`), texte(", et "), latex("\\big(\\sqrt{v}\\big)'=\\dfrac{v'}{2\\sqrt{v}}"), texte(` ${COURS_DERIVEE}.`)]),
      calcul("b", lignesChaine(b, r, `\\dfrac{2x}{2${r}}`, `\\dfrac{x}{${r}}`, fin)),
      resultat("b", [latex(`f'(x)=${fin}`)]),
      piege("b", [texte("Ne pas oublier la dérivée de l'exposant "), latex(r), texte(" : elle fait apparaître "), latex(`\\dfrac{x}{${r}}`), texte(".")]),
    ];
  }
  const N = sommeTermes([[e.m, "x"], [e.n, ""]]);
  const D = sommeTermes([[e.p, "x"], [e.q, ""]]);
  const c = e.m * e.q - e.n * e.p;
  const D2 = D === "x" ? "x^2" : `(${D})^2`;
  const enveloppe = (t: string) => (t === "x" ? "x" : `(${t})`);
  const brut = `\\dfrac{${coefDevant(e.m)}${enveloppe(D)}-${coefDevant(e.p)}${enveloppe(N)}}{${D2}}`;
  return [
    utilise("b", [latex("\\big(a^{u}\\big)'=u'\\cdot a^{u}\\cdot\\ln(a)"), texte(" avec "), latex(`u=\\dfrac{${N}}{${D}}`), texte(", dérivée par la règle du quotient "), latex("\\left(\\dfrac{N}{D}\\right)'=\\dfrac{N'D-ND'}{D^2}"), texte(` ${COURS_DERIVEE}.`)]),
    calcul("b", lignesChaine(b, `\\dfrac{${N}}{${D}}`, brut, `\\dfrac{${c}}{${D2}}`, fin)),
    resultat("b", [latex(`f'(x)=${fin}`)]),
    piege("b", [texte("La dérivée de l'exposant se calcule avec la règle du quotient, pas en dérivant séparément numérateur et dénominateur.")]),
  ];
}

function etapesC(e: ExerciceDomaineDeriveeC): EtapeCorrection[] {
  let u: string, v: string, up: string, vp: string, ligneUp: LigneCalcul[], ligneVp: LigneCalcul[], subst: string;
  const fin = deriveeFinaleLatex(e);
  const lignesFin: LigneCalcul[] = [];
  if (e.sousType === "d") {
    u = sommeTermes([[e.a, "x^3"], [e.b, "x^2"]]);
    v = `e^{${u}}`;
    up = sommeTermes([[3 * e.a, "x^2"], [2 * e.b, "x"]]);
    vp = `(${up})\\,e^{${u}}`;
    ligneUp = [ligne(`u(x)=${u}`), ligne(`u'(x)=${up}`, "dérivée d'un polynôme")];
    ligneVp = [ligne(`v(x)=${v}`), ligne(`v'(x)=${vp}`, justif("car ", { l: "(e^{w})'=w'\\,e^{w}" }, " avec ", { l: `w=${u}` }))];
    subst = "";
    lignesFin.push(
      ligne("=u'(x)\\,v(x)+u(x)\\,u'(x)\\,v(x)", justif("car ", { l: "v'(x)=u'(x)\\,v(x)" })),
      ligne("=u'(x)\\,v(x)\\,\\big(1+u(x)\\big)", justif("on met ", { l: "u'(x)\\,v(x)" }, " en évidence")),
      ligne(`=${fin}`, "on remplace u, u′ et v"),
    );
  } else if (e.sousType === "e") {
    u = e.r === 1 ? "x" : "x^{2}";
    v = "e^{\\sqrt{x}}";
    up = e.r === 1 ? "1" : "2x";
    vp = "\\dfrac{e^{\\sqrt{x}}}{2\\sqrt{x}}";
    ligneUp = [ligne(`u(x)=${u}`), ligne(`u'(x)=${up}`, e.r === 1 ? "dérivée de x" : justif("car ", { l: "(x^2)'=2x" }))];
    ligneVp = [ligne(`v(x)=${v}`), ligne(`v'(x)=\\dfrac{1}{2\\sqrt{x}}\\cdot e^{\\sqrt{x}}`, justif("car ", { l: "(e^{w})'=w'\\,e^{w}" }, " et ", { l: "(\\sqrt{x})'=\\dfrac{1}{2\\sqrt{x}}" })), ligne(`=${vp}`)];
    subst = e.r === 1 ? "e^{\\sqrt{x}}+x\\cdot\\dfrac{e^{\\sqrt{x}}}{2\\sqrt{x}}" : "2x\\,e^{\\sqrt{x}}+x^{2}\\cdot\\dfrac{e^{\\sqrt{x}}}{2\\sqrt{x}}";
    lignesFin.push(ligne(`=${e.r === 1 ? "e^{\\sqrt{x}}+\\dfrac{\\sqrt{x}}{2}\\,e^{\\sqrt{x}}" : "2x\\,e^{\\sqrt{x}}+\\dfrac{x\\sqrt{x}}{2}\\,e^{\\sqrt{x}}"}`, justif("car ", { l: "\\dfrac{x}{\\sqrt{x}}=\\sqrt{x}" })));
    lignesFin.push(ligne(`=${fin}`, justif("on met ", { l: "e^{\\sqrt{x}}" }, " en évidence")));
  } else {
    const b = String(e.base);
    u = `${b}^{x}-${e.c}`;
    v = e.trig === "sin" ? "\\sin(x)" : "\\cos(x)";
    up = `\\ln(${b})\\cdot ${b}^{x}`;
    vp = e.trig === "sin" ? "\\cos(x)" : "-\\sin(x)";
    ligneUp = [ligne(`u(x)=${u}`), ligne(`u'(x)=${up}`, justif("car ", { l: "(a^{x})'=\\ln(a)\\cdot a^{x}" }, ", constante de dérivée nulle"))];
    ligneVp = [ligne(`v(x)=${v}`), ligne(`v'(x)=${vp}`, "dérivée de référence")];
    subst = `${up}\\cdot ${v}+(${u})${e.trig === "sin" ? "\\cos(x)" : "(-\\sin(x))"}`;
    lignesFin.push(ligne(`=${fin}`, e.trig === "sin" ? "on ordonne les facteurs" : "règle des signes"));
  }
  const etapes: EtapeCorrection[] = [
    utilise("b", [latex("f(x)=u(x)\\cdot v(x)"), texte(" avec "), latex(`u(x)=${u}`), texte(" et "), latex(`v(x)=${v}`), texte(" : on dérive chaque facteur séparément "), texte(`${COURS_DERIVEE}.`)]),
    calcul("b", [...ligneUp, ...ligneVp]),
    resultat("b", [latex(`u'(x)=${up}`), texte(" et "), latex(`v'(x)=${vp}`)]),
    utilise("c", [texte("Règle du produit "), latex("(uv)'=u'v+uv'"), texte(` ${COURS_DERIVEE}.`)]),
    calcul("c", sansRepetition([ligne("f'(x)=u'(x)\\,v(x)+u(x)\\,v'(x)", "règle du produit"), ...(subst ? [ligne(`=${subst}`, "on remplace")] : []), ...lignesFin])),
    resultat("c", [latex(`f'(x)=${fin}`)]),
  ];
  if (e.sousType === "d") etapes.push(piege("c", [texte("Le même polynôme sert de facteur et d'exposant : sa dérivée apparaît dans les deux termes, d'où la mise en évidence.")]));
  return etapes;
}

function etapesD(e: ExerciceDomaineDeriveeD): EtapeCorrection[] {
  const b = baseDe(e.base, e.baseEstE);
  const ln = lnDe(b);
  const fin = deriveeFinaleLatex(e);
  let N: string, D: string, Np: string, Dp: string, lN: LigneCalcul[], lD: LigneCalcul[];
  const suite: LigneCalcul[] = [];
  const derExp = (coef: number, expo: string) => produit(coef, ln, `${b}^{${expo}}`);
  if (e.sousType === "f") {
    N = `${b}^{x}+${e.c}`;
    D = kx(e.k);
    Np = derExp(1, "x");
    Dp = `${e.k}`;
    lN = [ligne(`N(x)=${N}`), ligne(`N'(x)=${Np}`, justif("car ", { l: b === "e" ? "(e^{x})'=e^{x}" : "(a^{x})'=\\ln(a)\\cdot a^{x}" }))];
    lD = [ligne(`D(x)=${D}`), ligne(`D'(x)=${Dp}`)];
    const subst = `\\dfrac{${Np}\\cdot ${D}-(${N})\\cdot ${e.k}}{(${D})^2}`.replace("(x)^2", "x^2");
    suite.push(ligne(`=${subst}`, "on remplace"));
    if (e.k !== 1) suite.push(ligne(`=\\dfrac{${e.k}\\left(${produit(1, "x", ln, `${b}^{x}`)}-${b}^{x}-${e.c}\\right)}{${e.k * e.k}x^2}`, justif("on met ", { l: `${e.k}` }, " en évidence ; ", { l: `(${D})^2=${e.k * e.k}x^2` })));
    suite.push(ligne(`=${fin}`, e.k !== 1 ? `on simplifie par ${e.k}` : "on développe"));
  } else if (e.sousType === "h") {
    N = `${b}^{x}+${b}^{-x}`;
    D = `x^2+${e.c}`;
    Np = `${ln === "" ? "" : `${ln}\\,`}(${b}^{x}-${b}^{-x})`;
    Dp = "2x";
    lN = [ligne(`N(x)=${N}`), ligne(`N'(x)=${derExp(1, "x")}-${derExp(1, "-x")}`, justif("car ", { l: `(${b}^{-x})'=-${ln === "" ? "" : `${ln}\\cdot `}${b}^{-x}` })), ligne(`=${Np}`, ln === "" ? undefined : justif("on met ", { l: ln }, " en évidence"))];
    lD = [ligne(`D(x)=${D}`), ligne(`D'(x)=${Dp}`)];
    suite.push(ligne(`=${fin}`, "on remplace"));
  } else if (e.sousType === "i") {
    const mx = kx(e.m);
    N = kx(e.k, "x^2");
    D = `${b}^{${mx}}+${e.c}`;
    Np = kx(2 * e.k);
    Dp = derExp(e.m, mx);
    lN = [ligne(`N(x)=${N}`), ligne(`N'(x)=${Np}`)];
    lD = [ligne(`D(x)=${D}`), ligne(`D'(x)=${Dp}`, formuleChaine(b))];
    suite.push(ligne(`=\\dfrac{${Np}(${D})-${N}\\cdot ${Dp}}{(${D})^2}`, "on remplace"));
    suite.push(ligne(`=${fin}`, justif("on met ", { l: kx(e.k) }, " en évidence")));
  } else {
    N = `${b}^{-x}-${b}^{x}`;
    D = `${b}^{2x}+1`;
    Np = `-${ln === "" ? "" : `${ln}\\,`}(${b}^{-x}+${b}^{x})`;
    Dp = derExp(2, "2x");
    lN = [ligne(`N(x)=${N}`), ligne(`N'(x)=-${derExp(1, "-x")}-${derExp(1, "x")}`, justif("car ", { l: `(${b}^{-x})'=-${ln === "" ? "" : `${ln}\\cdot `}${b}^{-x}` })), ligne(`=${Np}`, "on met le facteur commun en évidence")];
    lD = [ligne(`D(x)=${D}`), ligne(`D'(x)=${Dp}`, formuleChaine(b))];
    const lnF = ln === "" ? "" : `${ln}\\,`;
    suite.push(ligne(`=\\dfrac{${Np}(${D})-(${N})\\cdot ${Dp}}{(${D})^2}`, "on remplace"));
    suite.push(ligne(`=\\dfrac{-${lnF}\\left[(${b}^{-x}+${b}^{x})(${D})+2\\cdot ${b}^{2x}(${N})\\right]}{(${D})^2}`, ln === "" ? "on met −1 en évidence" : justif("on met ", { l: `-${ln}` }, " en évidence")));
    suite.push(ligne(`=\\dfrac{-${lnF}(4\\cdot ${b}^{x}+${b}^{-x}-${b}^{3x})}{(${D})^2}`, justif("on développe : ", { l: `${b}^{-x}\\cdot ${b}^{2x}=${b}^{x}` })));
    suite.push(ligne(`=${fin}`, "on distribue le signe −"));
  }
  return [
    utilise("b", [latex("f(x)=\\dfrac{N(x)}{D(x)}"), texte(" avec "), latex(`N(x)=${N}`), texte(" et "), latex(`D(x)=${D}`), texte(" : on dérive chacun séparément "), texte(`${COURS_DERIVEE}.`)]),
    calcul("b", sansRepetition([...lN, ...lD])),
    resultat("b", [latex(`N'(x)=${Np}`), texte(" et "), latex(`D'(x)=${Dp}`)]),
    utilise("c", [texte("Règle du quotient "), latex("\\left(\\dfrac{N}{D}\\right)'=\\dfrac{N'D-ND'}{D^2}"), texte(` ${COURS_DERIVEE}.`)]),
    calcul("c", sansRepetition([ligne("f'(x)=\\dfrac{N'(x)\\,D(x)-N(x)\\,D'(x)}{D(x)^2}", "règle du quotient"), ...suite])),
    resultat("c", [latex(`f'(x)=${fin}`)]),
    piege("c", [texte("L'ordre compte au numérateur : "), latex("N'D-ND'"), texte(", jamais "), latex("ND'-N'D"), texte(".")]),
  ];
}

function etapesE(e: ExerciceDomaineDeriveeE): EtapeCorrection[] {
  const fin = deriveeFinaleLatex(e);
  let simple: string;
  const lS: LigneCalcul[] = [];
  const lD: LigneCalcul[] = [];
  let outilS: Fragments;
  let outilD: Fragments;
  if (e.sousType === "j") {
    const b = baseDe(e.base, e.baseEstE);
    const g = formeGA(e.g);
    const h = formeGA(e.h);
    const diff = coeffsGA(e.g).map((c, i) => c - coeffsGA(e.h)[i]) as [number, number, number, number];
    simple = `${b}^{${polyLatex(diff)}}`;
    outilS = [latex("\\dfrac{a^{m}}{a^{n}}=a^{m-n}"), texte(` ${COURS_DERIVEE}.`)];
    lS.push(ligne(`f(x)=${b}^{${g}-${par(h)}}`, justif("car ", { l: "\\dfrac{a^{m}}{a^{n}}=a^{m-n}" })), ligne(`=${simple}`, "on réduit l'exposant"));
    const dp = deriveePoly(diff);
    outilD = [texte("Dérivée d'une exponentielle composée : "), latex(b === "e" ? "\\big(e^{u}\\big)'=u'\\,e^{u}" : "\\big(a^{u}\\big)'=u'\\,a^{u}\\ln(a)"), texte(` ${COURS_DERIVEE}.`)];
    if (dp.every((c) => c === 0)) {
      lD.push(ligne(`f(x)=${simple}`, "l'exposant est une constante"), ligne("f'(x)=0", "dérivée d'une constante"));
    } else lD.push(...lignesChaine(b, polyLatex(diff), polyLatex(dp), null, fin));
  } else if (e.sousType === "m") {
    const b = baseDe(e.base, e.baseEstE);
    simple = `1-${b}^{-x}`;
    outilS = [texte("On sépare la fraction, "), latex("\\dfrac{A-B}{C}=\\dfrac{A}{C}-\\dfrac{B}{C}"), texte(", puis "), latex("\\dfrac{1}{a^{x}}=a^{-x}"), texte(` ${COURS_DERIVEE}.`)];
    lS.push(ligne(`f(x)=\\dfrac{${b}^{x}}{${b}^{x}}-\\dfrac{1}{${b}^{x}}`, "on sépare la fraction"), ligne(`=${simple}`, justif("car ", { l: "\\dfrac{1}{a^{x}}=a^{-x}" })));
    outilD = [latex(b === "e" ? "(e^{-x})'=-e^{-x}" : "(a^{-x})'=-\\ln(a)\\cdot a^{-x}"), texte(` ${COURS_DERIVEE}.`)];
    lD.push(ligne(`f'(x)=0-\\left(-${produit(1, lnDe(b), `${b}^{-x}`)}\\right)`, "la constante 1 a une dérivée nulle"), ligne(`=${fin}`, "on distribue le signe −"));
  } else {
    const q = `\\dfrac{${e.base1}}{${e.base2}}`;
    const inv = `\\dfrac{1}{${e.base2}}`;
    const cT = e.c === 1 ? "" : `${e.c}\\cdot `;
    simple = `\\left(${q}\\right)^{x}-${cT}\\left(${inv}\\right)^{x}`;
    outilS = [texte("On sépare la fraction, puis "), latex("\\dfrac{a^{x}}{b^{x}}=\\left(\\dfrac{a}{b}\\right)^{x}"), texte(` ${COURS_DERIVEE}.`)];
    lS.push(ligne(`f(x)=\\dfrac{${e.base1}^{x}}{${e.base2}^{x}}-\\dfrac{${e.c}}{${e.base2}^{x}}`, "on sépare la fraction"), ligne(`=${simple}`, justif("car ", { l: "\\dfrac{a^{x}}{b^{x}}=\\left(\\dfrac{a}{b}\\right)^{x}" })));
    outilD = [latex("(a^{x})'=\\ln(a)\\cdot a^{x}"), texte(" pour chaque terme "), texte(`${COURS_DERIVEE}.`)];
    lD.push(ligne(`f'(x)=${fin}`, justif("on dérive terme à terme, ", { l: "(a^{x})'=\\ln(a)\\cdot a^{x}" })));
  }
  return [
    utilise("b", outilS),
    calcul("b", sansRepetition(lS)),
    resultat("b", [latex(`f(x)=${simple}`)]),
    utilise("c", outilD),
    calcul("c", sansRepetition(lD)),
    resultat("c", [latex(`f'(x)=${fin}`)]),
    piege("c", [texte("Simplifier d'abord évite la règle du quotient : la forme simplifiée se dérive en une ligne.")]),
  ];
}

function etapesF(e: ExerciceDomaineDeriveeF): EtapeCorrection[] {
  const w = `e^{x^2-${e.k}}`;
  const fin = deriveeFinaleLatex(e);
  const ext = e.trig === "cos" ? "-\\sin(w)" : "-\\dfrac{1}{\\sqrt{1-w^2}}";
  return [
    utilise("b", [texte("Règle de la chaîne à trois niveaux : "), latex(e.trig === "cos" ? "(\\cos w)'=-w'\\sin w" : "(\\arccos w)'=-\\dfrac{w'}{\\sqrt{1-w^2}}"), texte(", avec "), latex(`w=${w}`), texte(" et "), latex("(e^{v})'=v'\\,e^{v}"), texte(` ${COURS_DERIVEE}.`)]),
    calcul(
      "b",
      sansRepetition([
        ligne(`v(x)=x^2-${e.k}`),
        ligne("v'(x)=2x"),
        ligne(`w(x)=${w}`),
        ligne(`w'(x)=2x\\,${w}`, justif("car ", { l: "(e^{v})'=v'\\,e^{v}" })),
        ligne(e.trig === "cos" ? "f'(x)=-w'(x)\\sin\\big(w(x)\\big)" : "f'(x)=-\\dfrac{w'(x)}{\\sqrt{1-w(x)^2}}", [texte("fonction extérieure : "), latex(ext)]),
        ligne(`=${fin}`, "on remplace w et w′"),
      ]),
    ),
    resultat("b", [latex(`f'(x)=${fin}`)]),
    piege("b", [texte("Trois niveaux, trois facteurs : la dérivée de la fonction extérieure, celle de l'exponentielle, et celle de l'exposant "), latex("2x"), texte(".")]),
  ];
}

export function correctionDetailleeDomaineDeriveeExponentielles(e: Ex): EtapeCorrection[] {
  const dom = etapesDomaine(e, "a");
  let suite: EtapeCorrection[];
  switch (e.famille) {
    case "A":
      suite = etapesA(e);
      break;
    case "B":
      suite = etapesB(e);
      break;
    case "C":
      suite = etapesC(e);
      break;
    case "D":
      suite = etapesD(e);
      break;
    case "E":
      suite = etapesE(e);
      break;
    case "F":
      suite = etapesF(e);
      break;
  }
  return finaliser([...dom, ...suite]);
}

/** Réponse attendue d'un écran : les formules du « Résultat » de son étape (une ou deux). */
export function reponseAttendueDomaineDeriveeLatex(e: Ex, phase: PhaseDomaineDeriveeExponentielle): string[] {
  const lettre = String.fromCharCode(97 + sequenceDomaineDeriveeExponentielles(e).indexOf(phase));
  const res = correctionDetailleeDomaineDeriveeExponentielles(e).find((x) => x.type === "resultat" && x.sousQuestion === lettre);
  return (res?.fragments ?? []).filter((f) => f.type === "latex").map((f) => f.valeur);
}
