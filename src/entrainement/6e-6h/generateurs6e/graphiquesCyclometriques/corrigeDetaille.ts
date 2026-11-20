import type { Arcfonction } from "../../core6e/cyclometrique.types";
import type { ExerciceGraphiquesCyclometriques, ParticulariteParite } from "../../core6e/graphiquesCyclometriques.types";
import type { EtapeCorrection, FragmentConsigne, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, piege, resultat, texte, utilise } from "../../../export/corrigeTableau";
import { construireGrilleSvgCandidatsCyclo } from "../../export6e/svgGraphCyclo";
import { calculerViewBoxGraphique, formatExpressionLatex } from "../../ui6e/formatGraphiquesCyclometriques";
import { type Q, piL, q, qL, qMul, qNul, qVal } from "../../ui6e/corrigeIntegrales1";
import { COURS_GRAPHES, NOM_ARC, dec, finaliser, justif, ligne, lignesPropres } from "../../ui6e/corrigeReciproques";

/**
 * Corrigé détaillé « comme au tableau » de `6gen5` (associer une expression cyclométrique et son
 * graphique) — règle `.claude/rules/feuilles-evaluations.md`. SOURCE UNIQUE : adaptateur papier ET
 * appli (`App6gen5.tsx`). Un seul ÉCRAN (lettre « a ») : domaine, image, extremums, ordonnée à
 * l'origine et parité calculés en valeurs EXACTES (multiples de π, fractions, puis « ≈ » au
 * centième), puis le graphique qui les a toutes ; figure des candidats (le bon mis en évidence)
 * en `figureHtml`, puisque la réponse est un graphique.
 */

type E = ExerciceGraphiquesCyclometriques;
type Fragments = FragmentConsigne[];
const SQ = "a";
const LETTRES = "ABCDEF";

/** Valeur exacte (écriture LaTeX) et sa valeur numérique. */
interface Val {
  tex: string;
  v: number;
}

/** r₀ + r₁·π (« -5+\dfrac{3\pi}{2} », « \pi », « 2 »). */
function piSomme(r0: Q, r1: Q): Val {
  const v = qVal(r0) + qVal(r1) * Math.PI;
  if (qNul(r1)) return { tex: qL(r0), v };
  if (qNul(r0)) return { tex: piL(r1), v };
  const p = piL(r1);
  return { tex: `${qL(r0)}${p.startsWith("-") ? "" : "+"}${p}`, v };
}

/** « = exact » suivi de « ≈ décimal » quand l'exact n'est pas un décimal court. */
function egal(x: Val): string {
  const court = Math.abs(Math.round(x.v * 100) / 100 - x.v) < 1e-9;
  if (court && !/\\pi|\\arc|\\sin|\\cos|\\sqrt/.test(x.tex)) return `=${x.tex}`;
  return `=${x.tex}\\approx ${dec(x.v, 2)}`;
}

/** Valeur exacte de arc(u) quand elle est remarquable (multiple de π), sinon null. */
function arcRemarquable(arc: Arcfonction, u: number): Q | null {
  const t: Record<string, [number, Q][]> = {
    arcsin: [[-1, q(-1, 2)], [0, q(0)], [1, q(1, 2)], [-0.5, q(-1, 6)], [0.5, q(1, 6)]],
    arccos: [[-1, q(1)], [0, q(1, 2)], [1, q(0)], [-0.5, q(2, 3)], [0.5, q(1, 3)]],
    arctan: [[-1, q(-1, 4)], [0, q(0)], [1, q(1, 4)]],
  };
  const e = t[arc].find(([x]) => Math.abs(x - u) < 1e-12);
  return e ? e[1] : null;
}

function nbL(v: number): string {
  if (Math.abs(v - Math.round(v)) < 1e-12) return String(Math.round(v));
  return String(v).replace(".", "{,}");
}

/** c + k·arc(u) (exact si arc(u) est remarquable, sinon symbolique), u donné en LaTeX. */
function cPlusKArc(c: number, k: number, arc: Arcfonction, u: number, uL: string): Val {
  const r = arcRemarquable(arc, u);
  const v = c + k * (arc === "arcsin" ? Math.asin(u) : arc === "arccos" ? Math.acos(u) : Math.atan(u));
  if (r) {
    // c entière (A, B, D, F) ou au centième (E) : écrite telle qu'imprimée dans l'énoncé
    const kr = qMul(q(k), r);
    if (qNul(kr)) return { tex: nbL(c), v };
    if (c === 0) return { tex: piL(kr), v };
    const p = piL(kr);
    return { tex: `${nbL(c)}${p.startsWith("-") ? "" : "+"}${p}`, v };
  }
  const terme = `${k === 1 ? "" : k === -1 ? "-" : k}${NOM_ARC[arc]}\\left(${uL}\\right)`;
  return { tex: c === 0 ? terme : `${nbL(c)}${terme.startsWith("-") ? "" : "+"}${terme}`, v };
}

function fx(e: E): string {
  return `f(x)=${formatExpressionLatex(e)}`;
}

interface Analyse {
  lignes: LigneCalcul[];
  dom: string;
  im: string;
  f0: string;
  max: string;
  min: string;
  parite: ParticulariteParite;
  pg: Fragments;
}

function libelleParite(p: ParticulariteParite): string {
  return p === "paire" ? "f est paire" : p === "impaire" ? "f est impaire" : "f n'est ni paire ni impaire";
}

/** −1 ≤ m·x + n ≤ 1 → [lo ; hi] (m > 0), lignes. */
function lignesDomaineAffine(m: number, n: number, uL: string): { lignes: LigneCalcul[]; lo: Q; hi: Q } {
  const lo = q(-1 - n, m);
  const hi = q(1 - n, m);
  const l: LigneCalcul[] = [ligne(`-1\\leq ${uL}\\leq 1`, "domaine de l'arcfonction")];
  if (n !== 0) l.push(ligne(`${-1 - n}\\leq ${m === 1 ? "x" : `${m}x`}\\leq ${1 - n}`, n > 0 ? `on soustrait ${n}` : `on ajoute ${-n}`));
  if (m !== 1) l.push(ligne(`${qL(lo)}\\leq x\\leq ${qL(hi)}`, `on divise par ${m}`));
  return { lignes: lignesPropres(l), lo, hi };
}

function analyseA(e: Extract<E, { famille: "A" }>): Analyse {
  const { m, n, k, c, arcfonction: arc } = e.reel;
  const uL = m === 1 ? (n === 0 ? "x" : `x${n > 0 ? "+" : "-"}${Math.abs(n)}`) : `${m}x${n === 0 ? "" : `${n > 0 ? "+" : "-"}${Math.abs(n)}`}`;
  const d = lignesDomaineAffine(m, n, uL);
  const fLo = cPlusKArc(c, k, arc, -1, "-1");
  const fHi = cPlusKArc(c, k, arc, 1, "1");
  const [mn, mx] = fLo.v < fHi.v ? [fLo, fHi] : [fHi, fLo];
  const l = [...d.lignes];
  l.push(ligne(`f\\left(${qL(d.lo)}\\right)${egal(fLo)}`, justif("l'argument vaut −1, ", { l: `${NOM_ARC[arc]}(-1)=${arc === "arcsin" ? "-\\dfrac{\\pi}{2}" : "\\pi"}` })));
  l.push(ligne(`f\\left(${qL(d.hi)}\\right)${egal(fHi)}`, justif("l'argument vaut 1, ", { l: `${NOM_ARC[arc]}(1)=${arc === "arcsin" ? "\\dfrac{\\pi}{2}" : "0"}` })));
  const dans0 = n >= -1 && n <= 1;
  let f0: string;
  if (dans0) {
    const v0 = cPlusKArc(c, k, arc, n, String(n));
    l.push(ligne(`f(0)${egal(v0)}`, justif("on remplace x par 0 : ", { l: `${NOM_ARC[arc]}(${n})` })));
    f0 = `f(0)${egal(v0)}`;
  } else {
    l.push(ligne(`0\\notin\\text{dom}(f)`, "0 est hors du domaine"));
    f0 = "f(0)\\text{ n'existe pas}";
  }
  const parite = e.proprietes.parite;
  if (n !== 0) l.push(ligne(`-\\left(${qL(d.hi)}\\right)\\neq ${qL(d.lo)}`, "les bornes ne sont pas opposées : domaine non symétrique, aucune parité"));
  else if (parite === "impaire") l.push(ligne(`f(-x)=-f(x)`, justif("domaine symétrique, ", { l: "\\arcsin(-u)=-\\arcsin u" }, " et pas de constante")));
  else l.push(ligne(`f\\left(${qL(d.lo)}\\right)\\neq f\\left(${qL(d.hi)}\\right)`, "f est strictement monotone : pas paire ; et f(0) ≠ 0 : pas impaire"));
  return {
    lignes: l,
    dom: `\\text{dom}(f)=\\left[${qL(d.lo)}\\,;\\,${qL(d.hi)}\\right]`,
    im: `\\text{Im}(f)=\\left[${mn.tex}\\,;\\,${mx.tex}\\right]`,
    f0,
    max: `\\max f=${mx.tex}`,
    min: `\\min f=${mn.tex}`,
    parite,
    pg: [texte("f est strictement monotone sur un intervalle fermé : ses extremums sont atteints aux deux bornes du domaine ; "), latex(k < 0 ? "k<0" : "k>0"), texte(k < 0 ? " retourne le sens de variation." : " garde le sens de variation de l'arcfonction.")],
  };
}

function analyseB(e: Extract<E, { famille: "B" }>): Analyse {
  const { m, n, k, c } = e.reel;
  const uL = `${m === 1 ? "" : m === -1 ? "-" : m}x${n === 0 ? "" : `${n > 0 ? "+" : "-"}${Math.abs(n)}`}`;
  const l1 = piSomme(q(c), q(-Math.abs(k), 2));
  const l2 = piSomme(q(c), q(Math.abs(k), 2));
  const v0 = cPlusKArc(c, k, "arctan", n, String(n));
  const lignes: LigneCalcul[] = [
    ligne("\\text{dom}(f)=\\mathbb{R}", "arctan est définie sur ℝ"),
    ligne(`\\arctan\\left(${uL}\\right)\\in\\left]-\\dfrac{\\pi}{2}\\,;\\,\\dfrac{\\pi}{2}\\right[`, "image de arctan, bornes jamais atteintes"),
    ligne(`y=${l1.tex}`, justif("asymptote horizontale, ", { l: `${nbL(c)}-${Math.abs(k) === 1 ? "" : Math.abs(k)}\\cdot\\dfrac{\\pi}{2}` })),
    ligne(`y=${l2.tex}`, justif("asymptote horizontale, ", { l: `${nbL(c)}+${Math.abs(k) === 1 ? "" : Math.abs(k)}\\cdot\\dfrac{\\pi}{2}` })),
    ligne(`f(0)${egal(v0)}`, justif("on remplace x par 0 : ", { l: `\\arctan(${n})` })),
  ];
  const parite = e.proprietes.parite;
  if (parite === "impaire") lignes.push(ligne("f(-x)=-f(x)", justif({ l: "\\arctan(-u)=-\\arctan u" }, ", pas de constante")));
  else lignes.push(ligne(`f(0)\\neq 0`, "pas impaire ; strictement monotone, donc pas paire"));
  return {
    lignes,
    dom: "\\text{dom}(f)=\\mathbb{R}",
    im: `\\text{Im}(f)=\\left]${l1.tex}\\,;\\,${l2.tex}\\right[`,
    f0: `f(0)${egal(v0)}`,
    max: "\\max f\\text{ n'existe pas}",
    min: "\\min f\\text{ n'existe pas}",
    parite,
    pg: [texte("Les deux asymptotes ne sont jamais atteintes : l'image est un intervalle ouvert, f n'a ni maximum ni minimum.")],
  };
}

function analyseC(e: Extract<E, { famille: "C" }>): Analyse {
  const { a, b, arcfonction: arc } = e.reel;
  const uL = `${a === 1 ? "" : a === -1 ? "-" : a}x^{2}${b === 0 ? "" : `${b > 0 ? "+" : "-"}${nbL(Math.abs(b))}`}`;
  const v0 = cPlusKArc(0, 1, arc, b, nbL(b));
  const lignes: LigneCalcul[] = [ligne(`f(-x)=${NOM_ARC[arc]}\\left(${a === 1 ? "" : a === -1 ? "-" : a}(-x)^{2}${b === 0 ? "" : `${b > 0 ? "+" : "-"}${nbL(Math.abs(b))}`}\\right)=f(x)`, justif("car ", { l: "(-x)^{2}=x^{2}" }, " : f est paire"))];
  lignes.push(ligne(`f(0)${egal(v0)}`, "valeur au sommet, en x = 0"));
  let dom: string;
  let im: string;
  let max: string;
  let min: string;
  if (arc === "arctan") {
    const borne = a > 0 ? "\\dfrac{\\pi}{2}" : "-\\dfrac{\\pi}{2}";
    lignes.unshift(ligne("\\text{dom}(f)=\\mathbb{R}", "arctan est définie sur ℝ"));
    lignes.push(ligne(`${uL}${a > 0 ? "\\geq " : "\\leq "}${nbL(b)}`, a > 0 ? "x² ≥ 0 : l'argument est minimal en 0" : "x² ≥ 0 et a < 0 : l'argument est maximal en 0"));
    lignes.push(ligne(`\\lim\\limits_{x\\to+\\infty}f(x)=${borne}`, "limite jamais atteinte (de même en −∞, f est paire)"));
    dom = "\\text{dom}(f)=\\mathbb{R}";
    im = a > 0 ? `\\text{Im}(f)=\\left[${v0.tex}\\,;\\,\\dfrac{\\pi}{2}\\right[` : `\\text{Im}(f)=\\left]-\\dfrac{\\pi}{2}\\,;\\,${v0.tex}\\right]`;
    max = a > 0 ? "\\max f\\text{ n'existe pas}" : `\\max f=${v0.tex}`;
    min = a > 0 ? `\\min f=${v0.tex}` : "\\min f\\text{ n'existe pas}";
  } else {
    const lim = a > 0 ? 1 : -1; // valeur de l'argument aux bords du domaine
    const r = q(Math.round((a > 0 ? 1 - b : 1 + b) * 4), Math.abs(a) * 4); // xMax² exact (b multiple de 1/4)
    const xMaxL = `\\sqrt{${qL(r)}}`;
    const xMax = Math.sqrt(qVal(r));
    lignes.unshift(
      ligne(`-1\\leq ${uL}\\leq 1`, "domaine de l'arcfonction"),
      ligne(`${a > 0 ? `${uL}\\leq 1` : `${uL}\\geq -1`}`, a > 0 ? "a > 0 : seule la borne 1 compte (x² ≥ 0)" : "a < 0 : seule la borne −1 compte"),
      ligne(`x^{2}\\leq ${qL(r)}`, a > 0 ? `on isole x²` : `on isole x², on divise par ${a} < 0 : le sens change`),
      ligne(`-${xMaxL}\\leq x\\leq ${xMaxL}`, justif("racine carrée, ", { l: `${xMaxL}\\approx ${dec(xMax, 2)}` })),
    );
    const vb = cPlusKArc(0, 1, arc, lim, String(lim));
    lignes.push(ligne(`f\\left(\\pm${xMaxL}\\right)${egal(vb)}`, `aux bords, l'argument vaut ${lim < 0 ? "−1" : "1"}`));
    const [mn, mx] = v0.v < vb.v ? [v0, vb] : [vb, v0];
    dom = `\\text{dom}(f)=\\left[-${xMaxL}\\,;\\,${xMaxL}\\right]`;
    im = `\\text{Im}(f)=\\left[${mn.tex}\\,;\\,${mx.tex}\\right]`;
    max = `\\max f=${mx.tex}`;
    min = `\\min f=${mn.tex}`;
  }
  return { lignes, dom, im, f0: `f(0)${egal(v0)}`, max, min, parite: "paire", pg: [texte("La condition porte sur ax² + b : le domaine est symétrique, pas une demi-droite comme pour un argument du premier degré.")] };
}

function analyseD(e: Extract<E, { famille: "D" }>): Analyse {
  const { k, p, c } = e.reel;
  const lignes: LigneCalcul[] = [ligne(`x${p === 0 ? "" : p > 0 ? `-${p}` : `+${-p}`}=0`, "valeur interdite : dénominateur nul"), ligne(`x=${p}`, "point exclu, deux branches")];
  const g = piSomme(q(c), q(-1, 2));
  const d = piSomme(q(c), q(1, 2));
  lignes.push(ligne(`y=${g.tex}`, "asymptote horizontale (arctan tend vers −π/2 d'un côté)"), ligne(`y=${d.tex}`, "asymptote horizontale (arctan tend vers π/2 de l'autre)"));
  lignes.push(ligne(`y=${nbL(c)}`, justif("valeur jamais atteinte : ", { l: `\\dfrac{${k}}{x${p === 0 ? "" : p > 0 ? `-${p}` : `+${-p}`}}\\neq 0` })));
  let f0: string;
  if (p !== 0) {
    const v0 = cPlusKArc(c, 1, "arctan", k / -p, qL(q(k, -p)));
    lignes.push(ligne(`f(0)${egal(v0)}`, "on remplace x par 0"));
    f0 = `f(0)${egal(v0)}`;
  } else {
    lignes.push(ligne("0\\notin\\text{dom}(f)", "0 est le point exclu"));
    f0 = "f(0)\\text{ n'existe pas}";
  }
  const parite = e.proprietes.parite;
  if (parite === "impaire") lignes.push(ligne("f(-x)=-f(x)", justif({ l: "\\arctan\\left(\\dfrac{k}{-x}\\right)=-\\arctan\\left(\\dfrac{k}{x}\\right)" })));
  else if (p !== 0) lignes.push(ligne(`${p}\\in\\mathbb{R}\\setminus\\text{dom}(f)`, `domaine non symétrique (${-p} y est, pas ${p}) : aucune parité`));
  else lignes.push(ligne(`f(x)+f(-x)=${2 * c}`, "la constante empêche l'imparité ; pas paire non plus"));
  return {
    lignes,
    dom: `\\text{dom}(f)=\\mathbb{R}\\setminus\\{${p}\\}`,
    im: `\\text{Im}(f)=\\left]${g.tex}\\,;\\,${nbL(c)}\\right[\\cup\\left]${nbL(c)}\\,;\\,${d.tex}\\right[`,
    f0,
    max: "\\max f\\text{ n'existe pas}",
    min: "\\min f\\text{ n'existe pas}",
    parite,
    pg: [texte("Une courbe continue en x = "), latex(String(p)), texte(" ne convient pas : la fraction k/(x − p) n'y est pas définie, la courbe a deux branches.")],
  };
}

function analyseE(e: Extract<E, { famille: "E" }>): Analyse {
  const { k, c, arcfonction: arc } = e.reel;
  const cL = nbL(c);
  const w0 = q(Math.round(-c * 100), k * 100); // −c/k exact (c au centième)
  const w0Dec = Math.round(qVal(w0) * 10000) / 10000;
  const w0L = Math.abs(w0Dec - qVal(w0)) < 1e-12 ? nbL(w0Dec) : qL(w0);
  const croissante = arc === "arcsin";
  const sensChange = k < 0;
  const rel = sensChange ? "\\leq " : "\\geq ";
  const trig = arc === "arcsin" ? "\\sin" : "\\cos";
  const x0 = arc === "arcsin" ? Math.sin(qVal(w0)) : Math.cos(qVal(w0));
  // arcsin croissante : arcsin(x) ≥ w0 ⟺ x ≥ sin(w0) ; arccos décroissante : arccos(x) ≥ w0 ⟺ x ≤ cos(w0)
  const xRel = sensChange === croissante ? "\\leq " : "\\geq ";
  const lignes: LigneCalcul[] = [
    ligne(`-1\\leq x\\leq 1`, `domaine de ${arc}`),
    ligne(`${k === 1 ? "" : k === -1 ? "-" : k}${NOM_ARC[arc]}(x)${c < 0 ? "" : "+"}${cL}\\geq 0`, "radicande positif ou nul"),
    ligne(
      `${NOM_ARC[arc]}(x)${rel}${w0L}`,
      `${c >= 0 ? "on soustrait" : "on ajoute"} ${String(Math.abs(c)).replace(".", ",")}, on divise par ${String(k).replace("-", "−")}${sensChange ? " < 0 : le sens change" : ""}`,
    ),
    ligne(`x${xRel}${trig}\\left(${w0L}\\right)`, croissante ? "on applique sin, croissante sur l'image de arcsin" : "on applique cos, décroissante sur [0 ; π] : le sens change"),
    ligne(`${trig}\\left(${w0L}\\right)\\approx ${dec(x0, 2)}`, "à la calculatrice"),
  ];
  const borne = e.domaineInf === -1 ? -1 : 1; // l'autre borne, celle de l'arcfonction
  const r = cPlusKArc(c, k, arc, borne, String(borne));
  const vMax: Val = { tex: `\\sqrt{${r.tex}}`, v: Math.sqrt(r.v) };
  lignes.push(ligne(`f(${borne})${egal(vMax)}`, "à l'autre borne, le radicande est maximal"));
  lignes.push(ligne(`f\\left(${trig}\\left(${w0L}\\right)\\right)=0`, "le radicande s'annule : minimum"));
  let f0: string;
  if (e.proprietes.ordonnee.existe) {
    const r0 = cPlusKArc(c, k, arc, 0, "0");
    const v0: Val = { tex: `\\sqrt{${r0.tex}}`, v: Math.sqrt(r0.v) };
    lignes.push(ligne(`f(0)${egal(v0)}`, "0 est dans le domaine"));
    f0 = `f(0)${egal(v0)}`;
  } else {
    lignes.push(ligne("0\\notin\\text{dom}(f)", "0 est hors du domaine"));
    f0 = "f(0)\\text{ n'existe pas}";
  }
  const domL = e.domaineInf === -1 ? `\\left[-1\\,;\\,${trig}\\left(${w0L}\\right)\\right]` : `\\left[${trig}\\left(${w0L}\\right)\\,;\\,1\\right]`;
  return {
    lignes,
    dom: `\\text{dom}(f)=${domL}`,
    im: `\\text{Im}(f)=\\left[0\\,;\\,${vMax.tex}\\right]`,
    f0,
    max: `\\max f=${vMax.tex}`,
    min: "\\min f=0",
    parite: "aucune",
    pg: [texte("Deux conditions se croisent pour le domaine : celui de l'arcfonction, "), latex("[-1\\,;\\,1]"), texte(", ET le radicande positif ; le domaine n'est pas symétrique : aucune parité.")],
  };
}

function analyseF(e: Extract<E, { famille: "F" }>): Analyse {
  const { m, n, c, arcfonction: arc } = e.reel;
  const uL = `${m === 1 ? "" : m}x${n === 0 ? "" : `${n > 0 ? "+" : "-"}${Math.abs(n)}`}`;
  const d = lignesDomaineAffine(m, n, uL);
  const x0 = e.positionExtremum;
  const z = arc === "arcsin" ? 0 : 1;
  const maxC = arc === "arcsin" ? q(1, 4) : q(1); // (π/2)² = π²/4 ou π²
  const maxV = c + qVal(maxC) * Math.PI * Math.PI;
  const maxTex = `${c === 0 ? "" : `${c}+`}${maxC.d === 1 ? "\\pi^{2}" : "\\dfrac{\\pi^{2}}{4}"}`;
  const lignes: LigneCalcul[] = [
    ...d.lignes,
    ligne(`${uL}=${z}`, `l'arcfonction s'annule quand son argument vaut ${z}`),
    ligne(`x=${x0}`, "position du minimum"),
    ligne(`f(${x0})=0^{2}${c === 0 ? "" : c > 0 ? `+${c}` : c}=${c}`, "minimum : un carré est positif ou nul"),
    ligne(`f\\left(${arc === "arcsin" ? `${qL(d.lo)}` : qL(d.lo)}\\right)=\\left(${arc === "arcsin" ? "-\\dfrac{\\pi}{2}" : "\\pi"}\\right)^{2}${c === 0 ? "" : c > 0 ? `+${c}` : c}`, "l'argument vaut −1"),
    ligne(`f\\left(${qL(d.hi)}\\right)=\\left(${arc === "arcsin" ? "\\dfrac{\\pi}{2}" : "0"}\\right)^{2}${c === 0 ? "" : c > 0 ? `+${c}` : c}`, "l'argument vaut 1"),
    ligne(`\\max f=${maxTex}\\approx ${dec(maxV, 2)}`, "la plus grande des deux valeurs aux bornes"),
  ];
  let f0: string;
  if (n >= -1 && n <= 1) {
    const w = arcRemarquable(arc, n) as Q;
    const t = piL(w);
    const v0 = c + Math.pow(qVal(w) * Math.PI, 2);
    const carre = qNul(w) ? "0" : w.d === 1 ? `${w.n === 1 ? "" : w.n * w.n}\\pi^{2}` : `\\dfrac{${Math.abs(w.n) === 1 ? "" : w.n * w.n}\\pi^{2}}{${w.d * w.d}}`;
    const tex = qNul(w) ? `${c}` : `${carre}${c === 0 ? "" : c > 0 ? `+${c}` : c}`;
    lignes.push(ligne(`f(0)=\\left(${t}\\right)^{2}${c === 0 ? "" : c > 0 ? `+${c}` : c}${qNul(w) ? "" : `=${tex}`}${qNul(w) ? `=${c}` : `\\approx ${dec(v0, 2)}`}`, justif("on remplace x par 0 : ", { l: `${NOM_ARC[arc]}(${n})=${t}` })));
    f0 = qNul(w) ? `f(0)=${c}` : `f(0)=${tex}\\approx ${dec(v0, 2)}`;
  } else {
    lignes.push(ligne("0\\notin\\text{dom}(f)", "0 est hors du domaine"));
    f0 = "f(0)\\text{ n'existe pas}";
  }
  const parite = e.proprietes.parite;
  if (parite === "paire") lignes.push(ligne("f(-x)=f(x)", justif("domaine symétrique et ", { l: "\\arcsin(-u)^{2}=\\arcsin(u)^{2}" })));
  else if (n !== 0) lignes.push(ligne(`-\\left(${qL(d.hi)}\\right)\\neq ${qL(d.lo)}`, "les bornes ne sont pas opposées : domaine non symétrique, aucune parité"));
  else lignes.push(ligne(`f\\left(${qL(d.lo)}\\right)\\neq f\\left(${qL(d.hi)}\\right)`, "pas paire ; f ≥ c, f(0) ≠ 0 : pas impaire"));
  return {
    lignes,
    dom: `\\text{dom}(f)=\\left[${qL(d.lo)}\\,;\\,${qL(d.hi)}\\right]`,
    im: `\\text{Im}(f)=\\left[${c}\\,;\\,${maxTex}\\right]`,
    f0,
    max: `\\max f=${maxTex}`,
    min: `\\min f=${c}`,
    parite,
    pg: [texte("Le carré change le sens de variation là où l'arcfonction s'annule : une courbe monotone est fausse.")],
  };
}

function analyse(e: E): Analyse {
  switch (e.famille) {
    case "A":
      return analyseA(e);
    case "B":
      return analyseB(e);
    case "C":
      return analyseC(e);
    case "D":
      return analyseD(e);
    case "E":
      return analyseE(e);
    case "F":
      return analyseF(e);
  }
}

export function lettreCorrecteGraphiquesCyclo(e: E): string {
  return LETTRES[e.indexCorrect] ?? String(e.indexCorrect + 1);
}

/** Réponse de l'écran (graphique + propriétés), en fragments. */
export function reponseGraphiquesCyclo(e: E): Fragments {
  const a = analyse(e);
  // Chaque formule en groupe {…} : elle ne se coupe jamais au milieu (« f(0) = … ≈ 1,11 » se coupait).
  const g = (x: string) => latex(`{${x}}`);
  return [texte(`Graphique ${lettreCorrecteGraphiquesCyclo(e)} : `), g(a.dom), texte(" ; "), g(a.im), texte(` ; ${libelleParite(a.parite)} ; `), g(a.f0), texte(" ; "), g(a.max), texte(" ; "), g(a.min), texte(".")];
}

export function correctionDetailleeGraphiquesCyclometriques(e: E): EtapeCorrection[] {
  const a = analyse(e);
  const figure = construireGrilleSvgCandidatsCyclo(e, calculerViewBoxGraphique(e), e.indexCorrect);
  return finaliser([
    utilise(SQ, [
      texte("On calcule les caractéristiques de "),
      latex(fx(e)),
      texte(" (domaine, image, extremums, ordonnée à l'origine, parité), puis on cherche le graphique qui les a toutes "),
      texte(`${COURS_GRAPHES}.`),
    ]),
    calcul(SQ, a.lignes),
    { ...resultat(SQ, reponseGraphiquesCyclo(e)), figureHtml: figure },
    piege(SQ, a.pg),
  ]);
}

