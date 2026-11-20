import type { FragmentConsigne } from "../../export/genererFeuilleExercices";
import type {
  DonneesDetectiveTrig,
  ExerciceEquation,
  ExerciceParametres,
  ExerciceProduit,
  ExerciceSecteur,
  IdDescriptionTrig,
  ResultatDetectiveTrig,
} from "../core5e/detectiveTrig.types";
import {
  SECONDS_MEMBRES,
  add,
  arccosPi,
  arcsinPi,
  arctanPi,
  chaineEgalites,
  div,
  omegaEnLigne,
  ensembleLatex,
  mul,
  neg,
  piLatex,
  rat,
  ratLatex,
  sub,
  unionTriee,
  valeursDans02,
  type Rat,
} from "./trigExact";
import { decalage, expressionLatex, periode, type SinusoideExacte } from "./sinusoideExacte";

/**
 * Modèle de 5gen50 « Détective d'erreurs : trigonométrie » : calculs EXACTS (justes et ceux de la
 * copie), lignes de la copie, ligne fausse, résultat final. Une seule source pour l'écran, le papier
 * et le corrigé (`ui5e/formatDetectiveTrig.ts`, `generateurs5e/detectiveTrig/corrigeDetaille.ts`).
 */

type Fragments = FragmentConsigne[];
const t = (valeur: string): FragmentConsigne => ({ type: "texte", valeur });
const l = (valeur: string): FragmentConsigne => ({ type: "latex", valeur });

/** Seconds membres de tan x = c (variante produit). */
export const SECONDS_TANGENTE: { latex: string; valeur: number }[] = [
  { latex: "1", valeur: 1 },
  { latex: "-1", valeur: -1 },
  { latex: "\\sqrt{3}", valeur: Math.sqrt(3) },
  { latex: "-\\sqrt{3}", valeur: -Math.sqrt(3) },
  { latex: "\\dfrac{\\sqrt{3}}{3}", valeur: Math.sqrt(3) / 3 },
  { latex: "-\\dfrac{\\sqrt{3}}{3}", valeur: -Math.sqrt(3) / 3 },
];

/** Terme « − c » d'une expression (« - 1 », « + \sqrt{3} »). */
function moinsC(latex: string): string {
  return latex.startsWith("-") ? `+ ${latex.slice(1)}` : `- ${latex}`;
}

/** « + \dfrac{\pi}{3} » ou « - \dfrac{\pi}{3} » (terme ajouté). */
export function plusPi(c: Rat): string {
  return c.n < 0 ? `- ${piLatex(neg(c))}` : `+ ${piLatex(c)}`;
}

// ---------------------------------------------------------------------------------------------
// Secteur (§ 1)
// ---------------------------------------------------------------------------------------------

export function angleRadians(e: ExerciceSecteur): Rat {
  return rat(e.d, 180);
}

/** Aire juste (coefficient de π) : ½ r² θ = r² d π / 360. */
export function aireSecteur(e: ExerciceSecteur): Rat {
  return rat(e.r * e.r * e.d, 360);
}

/** θ tel qu'il est écrit dans la ligne 3 de la copie (`null` : la copie y met les degrés). */
function resultatSecteur(e: ExerciceSecteur, copie: boolean): ResultatDetectiveTrig {
  const r2 = e.r * e.r;
  if (copie && e.type === "piOublie") {
    const v = rat(r2 * e.d, 360);
    return { genre: "aire", coefPi: null, rationnel: v, valeur: v.n / v.d, latex: ratLatex(v) };
  }
  if (copie && e.type === "degres") {
    const v = rat(r2 * e.d, 2);
    return { genre: "aire", coefPi: null, rationnel: v, valeur: v.n / v.d, latex: ratLatex(v) };
  }
  const c = copie && e.type === "demi" ? rat(r2 * e.d, 180) : aireSecteur(e);
  return { genre: "aire", coefPi: c, rationnel: c, valeur: (c.n / c.d) * Math.PI, latex: piLatex(c) };
}

function copieSecteur(e: ExerciceSecteur): Fragments[] {
  const theta = angleRadians(e);
  const thetaCopie = e.type === "piOublie" ? ratLatex(rat(e.d, 180)) : piLatex(theta);
  const l1 = e.type === "piOublie" ? `\\theta = \\dfrac{${e.d}}{180} = ${ratLatex(rat(e.d, 180))}` : `\\theta = ${e.d} \\times \\dfrac{\\pi}{180} = ${piLatex(theta)}`;
  const l2 = e.type === "demi" ? "A = r^2\\,\\theta" : "A = \\dfrac{1}{2}\\,r^2\\,\\theta";
  const facteurAngle = e.type === "degres" ? String(e.d) : thetaCopie;
  const l3 = e.type === "demi" ? `A = ${e.r}^2 \\times ${facteurAngle}` : `A = \\dfrac{1}{2} \\times ${e.r}^2 \\times ${facteurAngle}`;
  const res = resultatSecteur(e, true);
  return [[l(l1)], [l(l2)], [l(l3)], [l(`A = ${res.genre === "aire" ? res.latex : ""}`), t(" cm².")]];
}

// ---------------------------------------------------------------------------------------------
// Paramètres (§ 4) : une abscisse où f atteint son maximum
// ---------------------------------------------------------------------------------------------

export function sinusoide(e: ExerciceParametres): SinusoideExacte {
  return { A: e.A, omega: e.omega, phi: e.phi, b: e.b, enPi: true };
}

export interface CalculParametres {
  T: Rat;
  Phi: Rat;
  /** Fraction de période après Φ où la copie (ou le calcul juste) place le maximum : 1/4 ou 3/4. */
  quart: Rat;
  xMax: Rat;
}

export function calculParametres(e: ExerciceParametres, copie: boolean): CalculParametres {
  const s = sinusoide(e);
  const T = copie && e.type === "periode" ? div(rat(1), e.omega) : periode(s);
  const Phi = copie && e.type === "phiPourPhi" ? e.phi : decalage(s);
  const maxDAbord = (e.A > 0) !== (copie && e.type === "ordre");
  const quart = maxDAbord ? rat(1, 4) : rat(3, 4);
  return { T, Phi, quart, xMax: add(Phi, mul(quart, T)) };
}

export function maximum(e: ExerciceParametres): number {
  return e.b + Math.abs(e.A);
}

function ordreTexte(maxDAbord: boolean): string {
  return maxDAbord
    ? "la courbe passe par la ligne moyenne, puis le maximum, la ligne moyenne et le minimum."
    : "la courbe passe par la ligne moyenne, puis le minimum, la ligne moyenne et le maximum.";
}

function copieParametres(e: ExerciceParametres): Fragments[] {
  const c = calculParametres(e, true);
  const w = omegaEnLigne(e.omega);
  const l1: Fragments = [
    l(`\\omega = ${ratLatex(e.omega)}`),
    t(", donc "),
    l(
      e.type === "periode"
        ? chaineEgalites("T = \\dfrac{\\pi}{\\omega}", `\\dfrac{\\pi}{${w}}`, piLatex(c.T))
        : chaineEgalites("T = \\dfrac{2\\pi}{\\omega}", `\\dfrac{2\\pi}{${w}}`, piLatex(c.T)),
    ),
  ];
  const l2: Fragments = [
    l(`\\varphi = ${piLatex(e.phi)}`),
    t(", donc "),
    l(e.type === "phiPourPhi" ? `\\Phi = \\varphi = ${piLatex(c.Phi)}` : `\\Phi = -\\dfrac{\\varphi}{\\omega} = ${piLatex(c.Phi)}`),
  ];
  const maxDAbord = c.quart.n === 1;
  const frac = maxDAbord ? "\\dfrac{T}{4}" : "\\dfrac{3T}{4}";
  const l4 = `x = \\Phi + ${frac} = ${piLatex(c.Phi)} ${plusPi(mul(c.quart, c.T))} = ${piLatex(c.xMax)}`;
  return [
    l1,
    l2,
    [l(`A = ${e.A} ${e.A > 0 ? ">" : "<"} 0`), t(" : à partir de "), l("\\Phi"), t(`, ${ordreTexte(maxDAbord)}`)],
    [l(l4)],
    [t("Le maximum "), l(`${e.b} + ${Math.abs(e.A)} = ${maximum(e)}`), t(" est atteint en "), l(`x = ${piLatex(c.xMax)}`), t(".")],
  ];
}

// ---------------------------------------------------------------------------------------------
// Équation sin(2x) = c ou cos(2x) = c (§ 7)
// ---------------------------------------------------------------------------------------------

export interface CalculEquation {
  alpha: Rat;
  /** Familles en u = 2x (premier terme). */
  familles: Rat[];
  /** Période des familles en x (coefficient de π). */
  periodeX: Rat;
  solutions: Rat[];
}

export function secondMembre(e: ExerciceEquation): { latex: string; valeur: number } {
  return SECONDS_MEMBRES[e.c]!;
}

export function calculEquation(e: ExerciceEquation, copie: boolean): CalculEquation {
  const m = secondMembre(e).valeur;
  const sinus = e.fonction === "sin";
  const confondu = copie && e.type === "angleConfondu";
  const alpha = sinus !== confondu ? arcsinPi(m) : arccosPi(m);
  const secondJuste = sinus ? sub(rat(1), alpha) : neg(alpha);
  const secondFaux = sinus ? neg(alpha) : sub(rat(1), alpha);
  let familles: Rat[];
  if (copie && e.type === "familleOubliee") familles = [alpha];
  else familles = [alpha, copie && e.type === "familleFausse" ? secondFaux : secondJuste];
  const periodeX = copie && e.type === "periodeNonDivisee" ? rat(2) : rat(1);
  const solutions = unionTriee(...familles.map((u) => valeursDans02(div(u, rat(2)), periodeX)));
  return { alpha, familles, periodeX, solutions };
}

function kPi(p: Rat): string {
  return p.n === 1 && p.d === 1 ? "k\\pi" : "2k\\pi";
}

function familleLatex(variable: string, depart: Rat, p: Rat): string {
  return `${variable} = ${piLatex(depart)} + ${kPi(p)}`;
}

/** Formules séparées par « ou » en texte (la ligne peut passer à la ligne entre deux familles). */
export function avecOu(formules: string[]): Fragments {
  return formules.flatMap((f, i) => (i === 0 ? [l(f)] : [t(" ou "), l(f)]));
}

export function equationLatex(e: ExerciceEquation): string {
  return `\\${e.fonction}(2x) = ${secondMembre(e).latex}`;
}

function copieEquation(e: ExerciceEquation): Fragments[] {
  const c = calculEquation(e, true);
  const arc = (e.fonction === "sin") !== (e.type === "angleConfondu") ? "\\arcsin" : "\\arccos";
  const l1 = `\\alpha = ${arc}\\left(${secondMembre(e).latex}\\right) = ${piLatex(c.alpha)}`;
  const l2 = avecOu(c.familles.map((u) => familleLatex("2x", u, rat(2))));
  const l3 = avecOu(c.familles.map((u) => familleLatex("x", div(u, rat(2)), c.periodeX)));
  return [[l(l1)], [...l2, t(", "), l("k \\in \\mathbb{Z}")], l3,[t("Dans "), l("[0\\,;\\,2\\pi["), t(" : "), l(`S = ${ensembleLatex(c.solutions)}`), t(".")]];
}

// ---------------------------------------------------------------------------------------------
// Produit nul (tan x − c)·cos x = 0 (§ 7)
// ---------------------------------------------------------------------------------------------

export interface CalculProduit {
  beta: Rat;
  periodeTan: Rat;
  /** Famille de cos x = 0 telle qu'écrite (départ, période π). */
  departCos: Rat;
  gardeCos: boolean;
  solutions: Rat[];
}

export function secondTangente(e: ExerciceProduit): { latex: string; valeur: number } {
  return SECONDS_TANGENTE[e.c]!;
}

export function calculProduit(e: ExerciceProduit, copie: boolean): CalculProduit {
  const beta = arctanPi(secondTangente(e).valeur);
  const periodeTan = copie && e.type === "periodeTan" ? rat(2) : rat(1);
  const departCos = copie && e.type === "cosZero" ? rat(0) : rat(1, 2);
  // cos x = 0 juste : x = π/2 + kπ, où tan n'existe pas → rejeté. La copie « cosZero » écrit x = kπ,
  // où tan existe : elle les garde (cohérente avec son erreur) ; « valeurInterdite » garde π/2 + kπ.
  const gardeCos = copie && (e.type === "cosZero" || e.type === "valeurInterdite");
  const solutions = unionTriee(valeursDans02(beta, periodeTan), gardeCos ? valeursDans02(departCos, rat(1)) : []);
  return { beta, periodeTan, departCos, gardeCos, solutions };
}

export function produitLatex(e: ExerciceProduit): string {
  return `\\left(\\tan x ${moinsC(secondTangente(e).latex)}\\right)\\cos x = 0`;
}

function copieProduit(e: ExerciceProduit): Fragments[] {
  const c = calculProduit(e, true);
  const cLatex = secondTangente(e).latex;
  const cos = c.departCos.n === 0 ? "x = k\\pi" : "x = \\dfrac{\\pi}{2} + k\\pi";
  let l4: Fragments;
  if (e.type === "cosZero") l4 = [t("Pour "), l("x = k\\pi"), t(", "), l("\\tan x = 0"), t(" existe : ces valeurs conviennent.")];
  else if (e.type === "valeurInterdite") l4 = [t("Les solutions des deux équations conviennent.")];
  else l4 = [t("Pour "), l("x = \\dfrac{\\pi}{2} + k\\pi"), t(", "), l("\\tan x"), t(" n'existe pas : ces valeurs sont rejetées.")];
  return [
    [l(`\\tan x ${moinsC(cLatex)} = 0`), t(" ou "), l("\\cos x = 0")],
    [l(`\\tan x = ${cLatex} \\iff ${familleLatex("x", c.beta, c.periodeTan)}`)],
    [l(`\\cos x = 0 \\iff ${cos}`)],
    l4,
    [t("Dans "), l("[0\\,;\\,2\\pi["), t(" : "), l(`S = ${ensembleLatex(c.solutions)}`), t(".")],
  ];
}

// ---------------------------------------------------------------------------------------------
// API commune
// ---------------------------------------------------------------------------------------------

export function copieEleve(e: DonneesDetectiveTrig): Fragments[] {
  switch (e.variante) {
    case "secteur":
      return copieSecteur(e);
    case "parametres":
      return copieParametres(e);
    case "equation":
      return copieEquation(e);
    case "produit":
      return copieProduit(e);
  }
}

export function nombreLignes(e: DonneesDetectiveTrig): number {
  return copieEleve(e).length;
}

/** Indice (0 = ligne 1) de la ligne fausse. */
export function indiceLigneFausse(e: DonneesDetectiveTrig): number {
  switch (e.type) {
    case "piOublie":
    case "periode":
    case "angleConfondu":
      return 0;
    case "demi":
    case "phiPourPhi":
    case "familleOubliee":
    case "familleFausse":
    case "periodeTan":
      return 1;
    case "degres":
    case "ordre":
    case "periodeNonDivisee":
    case "cosZero":
      return 2;
    case "valeurInterdite":
      return 3;
  }
}

export function descriptionCorrecte(e: DonneesDetectiveTrig): IdDescriptionTrig {
  return e.type;
}

/** Résultat final, juste (`copie = false`) ou celui de la copie. */
export function resultat(e: DonneesDetectiveTrig, copie = false): ResultatDetectiveTrig {
  switch (e.variante) {
    case "secteur":
      return resultatSecteur(e, copie);
    case "parametres": {
      const c = calculParametres(e, copie);
      return { genre: "abscisse", x: c.xMax, periode: periode(sinusoide(e)) };
    }
    case "equation":
      return { genre: "ensemble", angles: calculEquation(e, copie).solutions };
    case "produit":
      return { genre: "ensemble", angles: calculProduit(e, copie).solutions };
  }
}

/** Énoncé : la fonction de la variante paramètres. */
export function fonctionLatex(e: ExerciceParametres): string {
  return expressionLatex(sinusoide(e));
}
