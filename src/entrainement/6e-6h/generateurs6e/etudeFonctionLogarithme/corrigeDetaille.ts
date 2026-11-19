import type { ExerciceEtudeFonctionLogarithme, ExerciceEtudeLogA, ExerciceEtudeLogB, ExerciceEtudeLogC, ExerciceEtudeLogD, ExerciceEtudeLogE } from "../../core6e/etudeFonctionLogarithme.types";
import type { EtapeCorrection, FragmentConsigne, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise } from "../../../export/corrigeTableau";
import { construireSvgFonction } from "../../../export/svgGraph";
import type { PhaseEtudeFonctionLogarithme } from "../../moteur6e/typesEtudeFonctionLogarithme";
import { PHASES_ETUDE_LOG } from "../../moteur6e/typesEtudeFonctionLogarithme";
import { calculerViewBox, contenuRecapLatex, evaluerCandidat, formatFonctionLatex } from "../../ui6e/formatEtudeFonctionLogarithme";
import { coefficientLatex, puissanceELatex, trinomeLatex } from "./familles/latex";
import { COURS_ETUDE, finaliserCorrige, justif, sommeTermes } from "../../ui6e/corrigeLogarithmes1";

/**
 * Corrigé détaillé « comme au tableau » de `6gen21` (étude complète d'une fonction logarithme) —
 * règle `.claude/rules/feuilles-evaluations.md`. SOURCE UNIQUE : importé par l'adaptateur papier
 * (`exportEvaluation.ts`) ET par l'appli (`App6gen21.tsx`). Étapes a à f = les six écrans (domaine,
 * limites, asymptotes, croissance, concavité, graphique) ; résultats = `contenuRecapLatex`. Les
 * dérivées sont calculées ligne à ligne (règle du quotient / de ln u / dérivation logarithmique),
 * leur signe étudié intervalle par intervalle ; le choix du graphique reprend chaque conclusion et
 * montre les candidats, le bon mis en évidence.
 */

const LETTRE: Record<PhaseEtudeFonctionLogarithme, string> = { domaine: "a", limites: "b", asymptotes: "c", croissance: "d", concavite: "e", graphique: "f" };
const ZP = "x\\to 0^+";
const PI = "x\\to+\\infty";
const MI = "x\\to-\\infty";

/** « − k·corps » avec le bon signe (« −2(…) », « +(…) » si k = −1). */
function moinsK(k: number, corps: string): string {
  const abs = Math.abs(k);
  return `${k > 0 ? "-" : "+"}${abs === 1 ? "" : abs}${corps}`;
}

function lim(dir: string, expr: string, valeur: string, j?: string | FragmentConsigne[]): LigneCalcul {
  return ligne(`\\lim_{${dir}}${expr}=${valeur}`, j);
}

const infini = (positif: boolean) => (positif ? "+\\infty" : "-\\infty");

function grilleCandidats(e: ExerciceEtudeFonctionLogarithme): string {
  const viewBox = calculerViewBox(e);
  const svgs = e.candidats.map((_, i) => construireSvgFonction((x) => evaluerCandidat(e, i, x), viewBox, { lettre: "ABCD"[i] ?? String(i + 1), estCorrect: e.indexCorrect === i })).join("");
  return `<div class="grille-graphes-cyclo">${svgs}</div>`;
}

/** « x−p » (« x », « x+2 »). */
function xMoins(p: number): string {
  return sommeTermes([
    [1, "x"],
    [-p, ""],
  ]);
}

interface Etude {
  domaine: LigneCalcul[];
  limites: LigneCalcul[];
  asymptotes: LigneCalcul[];
  croissance: LigneCalcul[];
  concavite: LigneCalcul[];
  graphique: LigneCalcul[];
  utilise: Record<PhaseEtudeFonctionLogarithme, FragmentConsigne[]>;
  piege: { phase: PhaseEtudeFonctionLogarithme; texte: FragmentConsigne[] };
}

const UTILISE_COMMUN: Record<PhaseEtudeFonctionLogarithme, FragmentConsigne[]> = {
  domaine: [latex("\\ln(u)"), texte(" n'existe que si "), latex("u>0"), texte(" ("), latex("\\ln|u|"), texte(" : "), latex("u\\neq 0"), texte("), un dénominateur ne s'annule pas, la base d'une puissance à exposant réel est strictement positive.")],
  limites: [texte("Limites de référence "), latex("\\lim_{x\\to 0^+}\\ln(x)=-\\infty"), texte(", "), latex("\\lim_{x\\to+\\infty}\\ln(x)=+\\infty"), texte(", croissances comparées "), latex("\\lim_{x\\to+\\infty}\\dfrac{\\ln(x)}{x}=0"), texte(" et "), latex("\\lim_{x\\to 0^+}x\\ln(x)=0"), texte(".")],
  asymptotes: [texte("Limite infinie quand "), latex("x"), texte(" tend vers une valeur finie "), latex("a"), texte(" : asymptote verticale "), latex("x=a"), texte(". Limite finie "), latex("L"), texte(" en l'infini : asymptote horizontale "), latex("y=L"), texte(". Une limite finie en une borne finie n'est pas une asymptote.")],
  croissance: [texte("Signe de "), latex("f'"), texte(" : "), latex("f'>0"), texte(" ⇒ "), latex("f"), texte(" croissante, "), latex("f'<0"), texte(" ⇒ "), latex("f"), texte(" décroissante ; un changement de signe de "), latex("f'"), texte(" donne un extremum.")],
  concavite: [texte("Signe de "), latex("f''"), texte(" : "), latex("f''>0"), texte(" ⇒ convexe, "), latex("f''<0"), texte(" ⇒ concave ; un changement de signe de "), latex("f''"), texte(" donne un point d'inflexion.")],
  graphique: [texte("On compare chaque graphique aux conclusions : limites et asymptotes, variations et extremum, concavité.")],
};

function etudeA(e: ExerciceEtudeLogA): Etude {
  const { k, c } = e;
  const u = sommeTermes([[1, "\\ln(x)"], [c, ""]]);
  const xe = puissanceELatex(1 - c, 1);
  const xi = puissanceELatex(3 - 2 * c, 2);
  const unMoinsC = sommeTermes([[1 - c, ""], [-1, "\\ln(x)"]]);
  const fp = `\\dfrac{${k}\\left(${unMoinsC}\\right)}{x^2}`;
  const fpp = `\\dfrac{${k}\\left(${sommeTermes([[2, "\\ln(x)"], [2 * c - 3, ""]])}\\right)}{x^3}`;
  const maximum = k > 0;
  return {
    domaine: [ligne("x>0", justif("argument de ", { l: "\\ln(x)" })), ligne("x\\neq 0", "dénominateur non nul (déjà assuré par x > 0)")],
    limites: [
      lim(ZP, `\\left(${u}\\right)`, "-\\infty", justif("", { l: "\\ln(x)\\to-\\infty" })),
      lim(ZP, "\\dfrac{1}{x}", "+\\infty", "inverse d'un nombre qui tend vers 0⁺"),
      lim(ZP, "f(x)", infini(!maximum), `produit des limites, signe de k = ${k}`.replace("-", "−")),
      ligne(`f(x)=${k}\\cdot\\dfrac{\\ln(x)}{x}${c === 0 ? "" : `${k * c < 0 ? "-" : "+"}\\dfrac{${Math.abs(k * c)}}{x}`}`, "on distribue"),
      lim(PI, "\\dfrac{\\ln(x)}{x}", "0", "croissance comparée"),
      ...(c === 0 ? [] : [lim(PI, `\\dfrac{${Math.abs(k * c)}}{x}`, "0", "constante divisée par un infini")]),
      lim(PI, "f(x)", "0", "somme des limites"),
    ],
    asymptotes: [ligne("x=0", justif("asymptote verticale : ", { l: `\\lim_{${ZP}}f(x)=${infini(!maximum)}` })), ligne("y=0", justif("asymptote horizontale : ", { l: `\\lim_{${PI}}f(x)=0` }))],
    croissance: [
      ligne(`f'(x)=\\dfrac{\\dfrac{${k}}{x}\\cdot x${moinsK(k, `\\left(${u}\\right)\\cdot 1`)}}{x^2}`, justif("", { l: "\\left(\\dfrac{u}{v}\\right)'=\\dfrac{u'v-uv'}{v^2}" }, ", ", { l: `u'=\\dfrac{${k}}{x}` })),
      ligne(`=${fp}`, "on simplifie et on met k en évidence"),
      ligne(`f'(x)=0\\iff \\ln(x)=${1 - c}`, "x² > 0 : seul le numérateur compte"),
      ligne(`\\iff x=${xe}`, "on applique exp"),
      ligne(`f'(x)${maximum ? ">" : "<"}0`, justif("pour ", { l: `0<x<${xe}` }, " : ", { l: `${unMoinsC}>0` })),
      ligne(`f'(x)${maximum ? "<" : ">"}0`, justif("pour ", { l: `x>${xe}` })),
    ],
    concavite: [
      ligne(`f''(x)=\\dfrac{${k > 0 ? "-" : ""}\\dfrac{${Math.abs(k)}}{x}\\cdot x^2${moinsK(k, `\\left(${unMoinsC}\\right)\\cdot 2x`)}}{x^4}`, justif("règle du quotient sur f′ : ", { l: `(x^2)'=2x` })),
      ligne(`=${fpp}`, "on simplifie par x et on met k en évidence"),
      ligne(`f''(x)=0\\iff \\ln(x)=${(3 - 2 * c) % 2 === 0 ? (3 - 2 * c) / 2 : `\\dfrac{${3 - 2 * c}}{2}`}`, "x³ > 0 sur le domaine"),
      ligne(`\\iff x=${xi}`, "on applique exp"),
      ligne(`x<${xi}\\Rightarrow f''(x)${k > 0 ? "<" : ">"}0`, "f″ change de signe : point d'inflexion"),
    ],
    graphique: [],
    utilise: { ...UTILISE_COMMUN, croissance: [texte("Dérivée d'un quotient "), latex("\\left(\\dfrac{u}{v}\\right)'=\\dfrac{u'v-uv'}{v^2}"), texte(", puis signe du numérateur ("), latex("x^2>0"), texte(") "), texte(COURS_ETUDE), texte(".")] },
    piege: { phase: "limites", texte: [texte("En +∞, "), latex("\\dfrac{\\ln(x)}{x}\\to 0"), texte(" (croissances comparées) : ne pas conclure à +∞.")] },
  };
}

function etudeB(e: ExerciceEtudeLogB): Etude {
  const { a, c } = e;
  const bx = e.bDen === 2 ? "\\dfrac{x}{2}" : e.bNum === 1 ? "x" : `${e.bNum}x`;
  const ax = a === 1 ? "x" : `${a}x`;
  const ca = a === 1 ? "" : `${a}`;
  const xm = e.croissanceLatex;
  return {
    domaine: [ligne(`${bx}>0`, "base d'une puissance à exposant réel strictement positive"), ligne("x>0", "on divise par un nombre positif")],
    limites: [
      ligne(`f(x)${c === 0 ? "" : c > 0 ? `-${c}` : `+${-c}`}=e^{${ax}\\ln\\left(${bx}\\right)}`, justif("", { l: "u^v=e^{v\\ln u}" })),
      lim(ZP, `${ax}\\ln\\left(${bx}\\right)`, "0", justif("croissance comparée : ", { l: "x\\ln(x)\\to 0" })),
      lim(ZP, "f(x)", `e^{0}${c === 0 ? "" : c > 0 ? `+${c}` : `${c}`}`, "l'exponentielle est continue"),
      ligne(`=${1 + c}`, justif("", { l: "e^0=1" })),
      lim(PI, `${ax}\\ln\\left(${bx}\\right)`, "+\\infty", "produit de deux limites infinies positives"),
      lim(PI, "f(x)", "+\\infty", justif("", { l: "e^{t}\\to+\\infty" })),
    ],
    asymptotes: [
      ligne(`\\lim_{${ZP}}f(x)=${1 + c}`, "limite finie en une borne finie : pas d'asymptote verticale"),
      ligne(`\\lim_{${PI}}\\dfrac{f(x)}{x}=+\\infty`, "f croît plus vite que toute droite : ni horizontale ni oblique"),
    ],
    croissance: [
      ligne(`g(x)=f(x)${c === 0 ? "" : c > 0 ? `-${c}` : `+${-c}`}`, "on pose g = f − c (même dérivée que f), g > 0"),
      ligne(`\\ln(g(x))=${ax}\\ln\\left(${bx}\\right)`, "on prend ln des deux membres"),
      ligne(`\\dfrac{g'(x)}{g(x)}=${ca}\\ln\\left(${bx}\\right)+${ax}\\cdot\\dfrac{1}{x}`, justif("on dérive : ", { l: "(\\ln g)'=\\dfrac{g'}{g}" }, ", règle du produit")),
      ligne(`=${ca}\\left(\\ln\\left(${bx}\\right)+1\\right)`, "on simplifie et on met en évidence"),
      ligne(`f'(x)=0\\iff \\ln\\left(${bx}\\right)=-1`, "g > 0 : signe de la parenthèse"),
      ligne(`\\iff x=${xm}`, justif("", { l: `${bx}=\\dfrac{1}{e}` })),
      ligne("f'(x)<0", justif("pour ", { l: `0<x<${xm}` })),
      ligne("f'(x)>0", justif("pour ", { l: `x>${xm}` }, " : minimum")),
    ],
    concavite: [
      ligne(`g'(x)=g(x)\\cdot ${ca}\\left(\\ln\\left(${bx}\\right)+1\\right)`, "étape précédente"),
      ligne(`g''(x)=g(x)\\left[${a * a === 1 ? "" : a * a}\\left(\\ln\\left(${bx}\\right)+1\\right)^2+\\dfrac{${a}}{x}\\right]`, justif("règle du produit : ", { l: "g''=g'\\cdot(\\dots)+g\\cdot(\\dots)'" })),
      ligne("f''(x)>0", justif("g > 0, un carré ≥ 0 et ", { l: `\\dfrac{${a}}{x}>0` }, " : f convexe partout")),
    ],
    graphique: [],
    utilise: { ...UTILISE_COMMUN, croissance: [texte("Dérivation logarithmique : on pose "), latex("g=f-c"), texte(", "), latex("\\ln g=v\\ln u\\Rightarrow\\dfrac{g'}{g}=v'\\ln u+v\\dfrac{u'}{u}"), texte(` ${COURS_ETUDE}.`)] },
    piege: { phase: "asymptotes", texte: [texte("La limite en 0⁺ est finie et 0 est une borne finie du domaine : "), latex("x=0"), texte(" n'est pas une asymptote.")] },
  };
}

function etudeC(e: ExerciceEtudeLogC): Etude {
  const { m, p, q } = e;
  const r1 = p - q;
  const r2 = p + q;
  const tri = trinomeLatex(-2 * p, p * p - q * q);
  const mc = coefficientLatex(m);
  const posInf = m > 0;
  return {
    domaine: [ligne(`${tri}\\neq 0`, justif("", { l: "\\ln|u|" }, " : u ≠ 0")), ligne(`(${xMoins(p)})^2\\neq ${q * q}`, "forme canonique"), ligne(`${xMoins(p)}\\neq\\pm ${q}`, "racine carrée"), ligne(`x\\neq ${r1}\\text{ et } x\\neq ${r2}`, `on ajoute ${p}`.replace("ajoute -", "retire "))],
    limites: [
      lim(MI, `\\left|${tri}\\right|`, "+\\infty", "le terme x² l'emporte"),
      lim(MI, "f(x)", infini(posInf), justif("", { l: "\\ln(t)\\to+\\infty" }, `, multiplié par ${m}`.replace("-", "−"))),
      lim(PI, "f(x)", infini(posInf), "même raison"),
      lim(`x\\to ${r1}`, `\\left|${tri}\\right|`, "0", "par valeurs positives, des deux côtés"),
      lim(`x\\to ${r1}`, "f(x)", infini(!posInf), justif("", { l: "\\ln(t)\\to-\\infty" }, " quand t → 0⁺")),
      lim(`x\\to ${r2}`, "f(x)", infini(!posInf), "même raison, des deux côtés"),
    ],
    asymptotes: [ligne(`x=${r1}`, "limite infinie en une valeur finie : asymptote verticale"), ligne(`x=${r2}`, "limite infinie en une valeur finie : asymptote verticale")],
    croissance: [
      ligne(`f'(x)=${m}\\cdot\\dfrac{2x${p === 0 ? "" : p > 0 ? `-${2 * p}` : `+${-2 * p}`}}{${tri}}`, justif("", { l: "\\left(\\ln|u|\\right)'=\\dfrac{u'}{u}" })),
      ligne(`=\\dfrac{${2 * m}(${xMoins(p)})}{${tri}}`, "on met 2 en évidence"),
      ligne(`${xMoins(p)}=0\\iff x=${p}`, "zéro du numérateur"),
      ligne(`${tri}<0\\iff ${r1}<x<${r2}`, "trinôme négatif entre ses racines"),
      ...e.croissance.signes.map((sg, i) => {
        const intervalle = [`]-\\infty\\,;\\,${r1}[`, `]${r1}\\,;\\,${p}[`, `]${p}\\,;\\,${r2}[`, `]${r2}\\,;\\,+\\infty[`][i];
        const num = (i <= 1 ? -m : m) > 0 ? "numérateur > 0" : "numérateur < 0";
        const den = i === 1 || i === 2 ? "trinôme < 0" : "trinôme > 0";
        return ligne(`f'(x)${sg === "croissante" ? ">" : "<"}0`, justif("sur ", { l: intervalle }, ` : ${num}, ${den}`));
      }),
      ligne(`f'(${p})=0`, `extremum en x = ${p}`.replace("-", "−")),
      ligne(`f(${p})=${mc}\\ln\\left|-${q * q}\\right|`, "on remplace x"),
      ligne(`=${e.croissance.valeurExtremumLatex}`, justif("", { l: `\\ln(${q * q})=2\\ln(${q})` })),
    ],
    concavite: [
      ligne(`f''(x)=\\dfrac{${2 * m}\\left[(${tri})-(${xMoins(p)})\\cdot 2(${xMoins(p)})\\right]}{(${tri})^2}`, "règle du quotient sur f′"),
      ligne(`=\\dfrac{${-2 * m}\\left((${xMoins(p)})^2+${q * q}\\right)}{(${tri})^2}`, "on simplifie le crochet"),
      ligne(`f''(x)${posInf ? "<" : ">"}0`, justif("signe de ", { l: `${-2 * m}` }, ` : f ${posInf ? "concave" : "convexe"} sur chaque intervalle du domaine`)),
    ],
    graphique: [],
    utilise: { ...UTILISE_COMMUN, croissance: [latex("\\left(\\ln|u|\\right)'=\\dfrac{u'}{u}"), texte(", puis tableau de signes du numérateur et du trinôme sur les quatre intervalles "), texte(COURS_ETUDE), texte(".")] },
    piege: { phase: "domaine", texte: [latex("\\ln|u|"), texte(" n'exige que "), latex("u\\neq 0"), texte(" : on exclut seulement les deux zéros du trinôme, pas tout l'intervalle où il est négatif.")] },
  };
}

function etudeD(e: ExerciceEtudeLogD): Etude {
  const { m, p, a } = e;
  const tri = trinomeLatex(-2 * p, p * p + a * a);
  const posInf = m > 0;
  return {
    domaine: [ligne(`${tri}=(${xMoins(p)})^2+${a * a}`, "forme canonique"), ligne(`(${xMoins(p)})^2+${a * a}>0`, "un carré plus un nombre positif : aucune restriction")],
    limites: [lim(MI, `(${tri})`, "+\\infty", "le terme x² l'emporte"), lim(MI, "f(x)", infini(posInf), justif("", { l: "\\ln(t)\\to+\\infty" }, `, multiplié par ${m}`.replace("-", "−"))), lim(PI, "f(x)", infini(posInf), "même raison")],
    asymptotes: [ligne("D_f=\\mathbb{R}", "aucune valeur interdite : pas d'asymptote verticale"), ligne(`\\lim_{${PI}}\\dfrac{f(x)}{x}=0`, "f tend vers l'infini mais f(x)/x → 0 : ni horizontale ni oblique")],
    croissance: [
      ligne(`f'(x)=${m}\\cdot\\dfrac{2x${p === 0 ? "" : p > 0 ? `-${2 * p}` : `+${-2 * p}`}}{${tri}}`, justif("", { l: "\\left(\\ln(u)\\right)'=\\dfrac{u'}{u}" })),
      ligne(`f'(x)=0\\iff x=${p}`, "dénominateur > 0 : zéro du numérateur"),
      ligne(`f'(x)${posInf ? "<" : ">"}0`, justif("pour ", { l: `x<${p}` })),
      ligne(`f'(x)${posInf ? ">" : "<"}0`, justif("pour ", { l: `x>${p}` }, ` : ${posInf ? "minimum" : "maximum"}`)),
    ],
    concavite: [
      ligne(`f''(x)=\\dfrac{${2 * m}\\left(${a * a}-(${xMoins(p)})^2\\right)}{(${tri})^2}`, "règle du quotient sur f′, puis on simplifie"),
      ligne(`f''(x)=0\\iff (${xMoins(p)})^2=${a * a}`, "numérateur nul"),
      ligne(`\\iff x=${p - a}\\text{ ou } x=${p + a}`, "racine carrée"),
      ligne(`${p - a}<x<${p + a}\\Rightarrow f''(x)${m > 0 ? ">" : "<"}0`, "f″ change de signe en chacun : deux points d'inflexion"),
    ],
    graphique: [],
    utilise: { ...UTILISE_COMMUN, croissance: [latex("\\left(\\ln(u)\\right)'=\\dfrac{u'}{u}"), texte(` ; le dénominateur est strictement positif ${COURS_ETUDE}.`)] },
    piege: { phase: "asymptotes", texte: [texte("Des limites infinies en ±∞ ne donnent ni asymptote verticale ni asymptote horizontale (domaine ℝ).")] },
  };
}

function etudeE(e: ExerciceEtudeLogE): Etude {
  const { m, c } = e;
  const posInf = m > 0;
  return {
    domaine: [ligne("x>0", justif("argument de ", { l: "\\ln(x)" }, " (alors x ≠ 0)"))],
    limites: [
      ligne(`f(x)=\\dfrac{${m}\\left(x\\ln(x)+${c}\\right)}{x}`, "même dénominateur : on lève la forme indéterminée"),
      lim(ZP, `\\left(x\\ln(x)+${c}\\right)`, `${c}`, justif("croissance comparée : ", { l: "x\\ln(x)\\to 0" })),
      lim(ZP, "f(x)", infini(posInf), `nombre non nul divisé par 0⁺, signe de ${m}`.replace("-", "−")),
      lim(PI, "f(x)", infini(posInf), justif("", { l: "\\ln(x)\\to+\\infty" }, " et ", { l: "\\dfrac{c}{x}\\to 0" })),
    ],
    asymptotes: [ligne("x=0", justif("asymptote verticale : ", { l: `\\lim_{${ZP}}f(x)=${infini(posInf)}` })), ligne(`\\lim_{${PI}}\\dfrac{f(x)}{x}=0`, "f tend vers l'infini mais f(x)/x → 0 : pas d'asymptote en +∞")],
    croissance: [
      ligne(`f'(x)=${m}\\left(\\dfrac{1}{x}-\\dfrac{${c}}{x^2}\\right)`, justif("", { l: "\\left(\\dfrac{c}{x}\\right)'=-\\dfrac{c}{x^2}" })),
      ligne(`=\\dfrac{${m}(x-${c})}{x^2}`, "même dénominateur"),
      ligne(`f'(x)=0\\iff x=${c}`, "x² > 0"),
      ligne(`f'(x)${posInf ? "<" : ">"}0`, justif("pour ", { l: `0<x<${c}` })),
      ligne(`f'(x)${posInf ? ">" : "<"}0`, justif("pour ", { l: `x>${c}` }, ` : ${posInf ? "minimum" : "maximum"}`)),
    ],
    concavite: [
      ligne(`f''(x)=${m}\\left(-\\dfrac{1}{x^2}+\\dfrac{${2 * c}}{x^3}\\right)`, "on dérive terme à terme"),
      ligne(`=\\dfrac{${m}(${2 * c}-x)}{x^3}`, "même dénominateur"),
      ligne(`f''(x)=0\\iff x=${2 * c}`, "x³ > 0"),
      ligne(`x<${2 * c}\\Rightarrow f''(x)${m > 0 ? ">" : "<"}0`, "f″ change de signe : point d'inflexion"),
    ],
    graphique: [],
    utilise: { ...UTILISE_COMMUN, croissance: [texte("On dérive terme à terme ("), latex("\\left(\\dfrac{c}{x}\\right)'=-\\dfrac{c}{x^2}"), texte(`) et on met au même dénominateur ${COURS_ETUDE}.`)] },
    piege: { phase: "limites", texte: [texte("En 0⁺, "), latex("\\ln(x)+\\dfrac{c}{x}"), texte(" est une forme indéterminée : il faut la lever (même dénominateur) avant de conclure.")] },
  };
}

function etude(e: ExerciceEtudeFonctionLogarithme): Etude {
  switch (e.famille) {
    case "A":
      return etudeA(e);
    case "B":
      return etudeB(e);
    case "C":
      return etudeC(e);
    case "D":
      return etudeD(e);
    case "E":
      return etudeE(e);
  }
}

/** Ajoute le renvoi « (cours, § 9) » en fin de phrase (avant le point final). */
function avecCours(u: FragmentConsigne[]): FragmentConsigne[] {
  const d = u[u.length - 1];
  if (d.type !== "texte") return [...u, texte(` ${COURS_ETUDE}.`)];
  return [...u.slice(0, -1), texte(`${d.valeur.replace(/\.$/, "")} ${COURS_ETUDE}.`)];
}

/** Étape f : chaque conclusion confrontée aux graphiques (une ligne par critère). */
function lignesGraphique(e: ExerciceEtudeFonctionLogarithme): LigneCalcul[] {
  const lettre = "ABCD"[e.indexCorrect] ?? String(e.indexCorrect + 1);
  const l: LigneCalcul[] = [];
  const asym = e.asymptotes.filter((a) => a.type === "verticale" || a.type === "horizontale");
  for (const a of asym) l.push(ligne(a.type === "verticale" ? `x=${a.p}` : `y=${a.valeur}`, `asymptote ${a.type === "verticale" ? "verticale" : "horizontale"} : à retrouver sur le graphique`));
  if (e.famille === "C") l.push(ligne(`x=${e.p}`, `${e.croissance.extremum} local, au milieu des deux asymptotes`));
  else if (e.croissance.type === "maximum" || e.croissance.type === "minimum") l.push(ligne(`x=${e.croissanceLatex}`, `abscisse du ${e.croissance.type}`));
  if (e.concavite.type === "inflexions") e.concavite.positionsLatex.forEach((p) => l.push(ligne(`x=${p}`, "abscisse d'un point d'inflexion")));
  else l.push(ligne(`f''(x)${e.concavite.type === "convexe_partout" ? ">" : "<"}0`, e.concavite.type === "convexe_partout" ? "courbe tournée vers le haut partout" : "courbe tournée vers le bas sur chaque intervalle"));
  l.push(ligne(`\\text{graphique}=${lettre}`, "le seul qui vérifie toutes ces conditions"));
  return l;
}

export function correctionDetailleeEtudeFonctionLog(e: ExerciceEtudeFonctionLogarithme): EtapeCorrection[] {
  const et = etude(e);
  et.graphique = lignesGraphique(e);
  const etapes: EtapeCorrection[] = [];
  for (const phase of PHASES_ETUDE_LOG) {
    const sq = LETTRE[phase];
    const u = et.utilise[phase];
    etapes.push(utilise(sq, phase === "croissance" || phase === "graphique" ? u : avecCours(u)));
    etapes.push(calcul(sq, et[phase]));
    const res = contenuRecapLatex(e, phase);
    const r = resultat(sq, phase === "domaine" ? [latex(`D_f=${res}`)] : [latex(res)]);
    etapes.push(phase === "graphique" ? { ...r, figureHtml: grilleCandidats(e) } : r);
    if (et.piege.phase === phase) etapes.push(piege(sq, et.piege.texte));
  }
  return finaliserCorrige(etapes);
}

export { formatFonctionLatex };
