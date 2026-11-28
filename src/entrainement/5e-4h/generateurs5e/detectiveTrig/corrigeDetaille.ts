import type { EtapeCorrection, FragmentConsigne, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise } from "../../../export/corrigeTableau";
import type { DonneesDetectiveTrig, ExerciceDetectiveTrig, ExerciceEquation, ExerciceParametres, ExerciceProduit, ExerciceSecteur } from "../../core5e/detectiveTrig.types";
import { add, cosExact, div, mul, omegaEnLigne, piLatex, rat, ratLatex, sinExact, tanExact, type Rat } from "../../moteur5e/trigExact";
import {
  angleRadians,
  calculEquation,
  calculParametres,
  calculProduit,
  indiceLigneFausse,
  maximum,
  plusPi,
  secondMembre,
  secondTangente,
} from "../../moteur5e/modeleDetectiveTrig";
import { descriptionFragments, nomErreur, reponseFragments, sectionCours, souderPonctuation } from "../../ui5e/formatDetectiveTrig";

/**
 * Corrigé détaillé « comme au tableau » de 5gen50 (détective d'erreurs : trigonométrie) — règle
 * `.claude/rules/feuilles-evaluations.md`. Une lettre par écran : a) la ligne fausse (contrôle écrit en
 * calcul : la règle du cours face à ce qu'écrit la copie), b) le nom de l'erreur, c) la résolution
 * reprise, une opération par ligne, avec les valeurs du modèle (`modeleDetectiveTrig.ts`, mêmes
 * fonctions que la copie et l'écran). Partagé par l'appli et le papier.
 */

type E = ExerciceDetectiveTrig;
type Fragments = FragmentConsigne[];
const t = texte;
const f = latex;

/** « \pi/3 », « -\pi/3 » : un angle écrit en ligne (dans une fraction). */
function piEnLigne(c: Rat): string {
  if (c.n === 0) return "0";
  const a = Math.abs(c.n);
  const s = `${c.n < 0 ? "-" : ""}${a === 1 ? "" : a}\\pi${c.d === 1 ? "" : `/${c.d}`}`;
  return s;
}

/** Facteur entre parenthèses s'il est négatif. */
function par(s: string): string {
  return s.startsWith("-") ? `\\left(${s}\\right)` : s;
}

// ---------------------------------------------------------------------------------------------
// a) La ligne fausse
// ---------------------------------------------------------------------------------------------

function controleLigne(e: DonneesDetectiveTrig): LigneCalcul[] {
  const n = indiceLigneFausse(e) + 1;
  const copie = `ligne ${n} de la copie`;
  switch (e.variante) {
    case "secteur": {
      const th = piLatex(angleRadians(e));
      if (e.type === "piOublie") return [ligne(`\\theta = ${e.d} \\times \\dfrac{\\pi}{180} = ${th}`, "conversion du cours"), ligne(`${th} \\neq ${ratLatex(rat(e.d, 180))}`, `${copie} : π a disparu`)];
      if (e.type === "demi") return [ligne(`A = \\dfrac{1}{2}\\,r^2\\,\\theta`, "aire d'un secteur"), ligne(`\\dfrac{1}{2}\\,r^2\\,\\theta \\neq r^2\\,\\theta`, `${copie} : le facteur ½ manque`)];
      return [ligne(`\\theta = ${th}`, "angle en radians, ligne 1"), ligne(`${th} \\neq ${e.d}`, [t(`${copie} : `), f(String(e.d)), t(" est la mesure en degrés")])];
    }
    case "parametres": {
      const juste = calculParametres(e, false);
      const copie2 = calculParametres(e, true);
      const w = omegaEnLigne(e.omega);
      if (e.type === "periode") return [ligne(`T = \\dfrac{2\\pi}{${w}} = ${piLatex(juste.T)}`, "période du cours"), ligne(`${piLatex(juste.T)} \\neq ${piLatex(copie2.T)}`, copie)];
      if (e.type === "phiPourPhi") return [ligne(`\\Phi = -\\dfrac{${piEnLigne(e.phi)}}{${w}} = ${piLatex(juste.Phi)}`, "décalage horizontal du cours"), ligne(`${piLatex(juste.Phi)} \\neq ${piLatex(e.phi)}`, `${copie} : c'est φ`)];
      const x = add(juste.Phi, div(juste.T, rat(4)));
      const yQuart = e.b + e.A;
      return [
        ligne(`f\\left(${piLatex(x)}\\right) = ${e.b} + ${par(String(e.A))} = ${yQuart}`, [t("un quart de période après "), f("\\Phi")]),
        ligne(`${yQuart} ${e.A > 0 ? ">" : "<"} ${e.b}`, e.A > 0 ? "la courbe monte d'abord : maximum en premier" : "la courbe descend d'abord : minimum en premier"),
      ];
    }
    case "equation": {
      const juste = calculEquation(e, false);
      const copie2 = calculEquation(e, true);
      const fn = `\\${e.fonction}`;
      const valeur = (a: Rat) => (e.fonction === "sin" ? sinExact(a).latex : cosExact(a).latex);
      if (e.type === "angleConfondu")
        return [ligne(`${fn}\\left(${piLatex(copie2.alpha)}\\right) = ${valeur(copie2.alpha)}`, `angle de la ${copie}`), ligne(`${valeur(copie2.alpha)} \\neq ${secondMembre(e).latex}`, "ce n'est pas le second membre")];
      if (e.type === "familleOubliee") return [ligne(`${fn}\\left(${piLatex(juste.familles[1]!)}\\right) = ${valeur(juste.familles[1]!)}`, [t("seconde famille, absente de la "), t(copie)])];
      if (e.type === "familleFausse")
        return [ligne(`${fn}\\left(${piLatex(copie2.familles[1]!)}\\right) = ${valeur(copie2.familles[1]!)}`, `seconde famille de la ${copie}`), ligne(`${valeur(copie2.familles[1]!)} \\neq ${secondMembre(e).latex}`, "ce n'est pas le second membre")];
      const x1 = add(div(juste.familles[0]!, rat(2)), rat(1));
      return [ligne(`${fn}\\left(2 \\times ${piLatex(x1)}\\right) = ${fn}\\left(${piLatex(mul(rat(2), x1))}\\right)`, "avec k = 1 dans x = … + kπ"), ligne(`${fn}\\left(${piLatex(mul(rat(2), x1))}\\right) = ${valeur(mul(rat(2), x1))}`, [t("solution perdue par la "), t(copie)])];
    }
    case "produit": {
      const juste = calculProduit(e, false);
      if (e.type === "periodeTan") {
        const x = add(juste.beta, rat(1));
        return [ligne(`\\tan\\left(${piLatex(x)}\\right) = ${tanExact(x)!.latex}`, [t("avec k = 1 : solution perdue par la "), t(copie)])];
      }
      if (e.type === "cosZero") return [ligne("\\cos 0 = 1", "x = 0 est de la forme kπ"), ligne("1 \\neq 0", [t(`${copie} : `), f("x = k\\pi"), t(" ne vérifie pas "), f("\\cos x = 0")])];
      return [ligne("\\cos\\dfrac{\\pi}{2} = 0", [t("donc "), f("\\tan\\dfrac{\\pi}{2} = \\dfrac{\\sin(\\pi/2)}{\\cos(\\pi/2)}"), t(" n'existe pas")])];
    }
  }
}

// ---------------------------------------------------------------------------------------------
// c) La résolution reprise
// ---------------------------------------------------------------------------------------------

function resolutionSecteur(e: ExerciceSecteur): LigneCalcul[] {
  const th = angleRadians(e);
  const demiR2 = rat(e.r * e.r, 2);
  const aire = mul(demiR2, th);
  return [
    ligne(`\\theta = ${e.d} \\times \\dfrac{\\pi}{180}`, "angle en radians"),
    ligne(`= ${piLatex(th)}`, "on simplifie"),
    ligne(`A = \\dfrac{1}{2} \\times ${e.r}^2 \\times ${piLatex(th)}`, [f("A = \\dfrac{1}{2}\\,r^2\\,\\theta")]),
    ligne(`= ${ratLatex(demiR2)} \\times ${piLatex(th)}`, [f(`\\dfrac{1}{2} \\times ${e.r * e.r}`)]),
    ligne(`= ${piLatex(aire)}`, "on simplifie"),
  ];
}

function resolutionParametres(e: ExerciceParametres): LigneCalcul[] {
  const c = calculParametres(e, false);
  const w = omegaEnLigne(e.omega);
  const pas = mul(c.quart, c.T);
  return [
    ligne(`T = \\dfrac{2\\pi}{${w}}`, [f("T = \\dfrac{2\\pi}{\\omega}")]),
    ligne(`= ${piLatex(c.T)}`),
    ligne(`\\Phi = -\\dfrac{${piEnLigne(e.phi)}}{${w}}`, [f("\\Phi = -\\dfrac{\\varphi}{\\omega}")]),
    ligne(`= ${piLatex(c.Phi)}`),
    ligne(`x = ${piLatex(c.Phi)} ${plusPi(pas)}`, [t(e.A > 0 ? "A > 0 : le maximum vient un quart de période après " : "A < 0 : le maximum vient trois quarts de période après "), f("\\Phi")]),
    ligne(`= ${piLatex(c.xMax)}`),
  ];
}

function resolutionEquation(e: ExerciceEquation): LigneCalcul[] {
  const c = calculEquation(e, false);
  const fn = `\\${e.fonction}`;
  const m = secondMembre(e).latex;
  const [u1, u2] = [c.familles[0]!, c.familles[1]!];
  const x1 = div(u1, rat(2));
  const x2 = div(u2, rat(2));
  const lignes: LigneCalcul[] = [
    ligne(`${fn}\\left(${piLatex(c.alpha)}\\right) = ${m}`, [t("angle de référence "), f(`\\alpha = ${e.fonction === "sin" ? "\\arcsin" : "\\arccos"} c`)]),
    ligne(`2x = ${piLatex(u1)} + 2k\\pi`, "première famille"),
    ligne(`2x = ${piLatex(u2)} + 2k\\pi`, [t("seconde famille : "), f(e.fonction === "sin" ? "\\pi - \\alpha" : "-\\alpha")]),
    ligne(`x = ${piLatex(x1)} + k\\pi`, "on divise tout par 2"),
    ligne(`x = ${piLatex(x2)} + k\\pi`, "on divise tout par 2"),
  ];
  for (const s of c.solutions) lignes.push(ligne(`x = ${piLatex(s)}`, "dans [0 ; 2π["));
  return lignes;
}

function resolutionProduit(e: ExerciceProduit): LigneCalcul[] {
  const c = calculProduit(e, false);
  const lignes: LigneCalcul[] = [
    ligne(`\\tan\\left(${piLatex(c.beta)}\\right) = ${secondTangente(e).latex}`, [t("donc "), f(`x = ${piLatex(c.beta)} + k\\pi`)]),
    ligne("\\cos\\left(\\dfrac{\\pi}{2}\\right) = 0", [t("donc "), f("x = \\dfrac{\\pi}{2} + k\\pi"), t(", rejeté : tan x n'y existe pas")]),
  ];
  for (const s of c.solutions) lignes.push(ligne(`x = ${piLatex(s)}`, "dans [0 ; 2π["));
  return lignes;
}

function verificationCorrection(e: DonneesDetectiveTrig): Fragments {
  switch (e.variante) {
    case "secteur": {
      const disque = rat(e.r * e.r);
      return [t("Proportion du disque : "), f(`\\dfrac{${e.d}}{360} \\times ${piLatex(disque)} = ${piLatex(mul(rat(e.d, 360), disque))}`), t(".")];
    }
    case "parametres": {
      const c = calculParametres(e, false);
      const u = add(mul(e.omega, c.xMax), e.phi);
      const s = sinExact(u).latex;
      return [f(`f\\left(${piLatex(c.xMax)}\\right) = ${e.A === 1 ? "" : e.A === -1 ? "-" : e.A}\\sin\\left(${piLatex(u)}\\right)${e.b === 0 ? "" : e.b < 0 ? ` - ${-e.b}` : ` + ${e.b}`} = ${maximum(e)}`), t(` (car le sinus vaut ${s === "1" ? "1" : "−1"}).`)];
    }
    case "equation": {
      const c = calculEquation(e, false);
      const x = c.solutions[0]!;
      const u = mul(rat(2), x);
      const v = e.fonction === "sin" ? sinExact(u).latex : cosExact(u).latex;
      return [t("Pour "), f(`x = ${piLatex(x)}`), t(" : "), f(`\\${e.fonction}\\left(${piLatex(u)}\\right) = ${v}`), t(".")];
    }
    case "produit": {
      const c = calculProduit(e, false);
      const x = c.solutions[1]!;
      return [t("Pour "), f(`x = ${piLatex(x)}`), t(" : "), f(`\\tan\\left(${piLatex(x)}\\right) = ${tanExact(x)!.latex}`), t(", et le cosinus n'y est pas nul.")];
    }
  }
}

function utiliseCorrection(e: DonneesDetectiveTrig): Fragments {
  const s = sectionCours(e);
  switch (e.variante) {
    case "secteur":
      return [t(`Aire d'un secteur (cours, point ${s}) : `), f("A = \\dfrac{1}{2}\\,r^2\\,\\theta"), t(", avec "), f("\\theta = d \\times \\dfrac{\\pi}{180}"), t(" en radians.")];
    case "parametres":
      return [t(`Construction (cours, point ${s}) : `), f("T = \\dfrac{2\\pi}{\\omega}"), t(", "), f("\\Phi = -\\dfrac{\\varphi}{\\omega}"), t(", puis les points tous les quarts de période à partir de "), f("\\Phi"), t(".")];
    case "equation":
      return e.fonction === "sin"
        ? [t(`Équation en sinus (cours, point ${s}) : `), f("u = \\alpha + 2k\\pi"), t(" ou "), f("u = \\pi - \\alpha + 2k\\pi"), t(", puis on divise tout par 2.")]
        : [t(`Équation en cosinus (cours, point ${s}) : `), f("u = \\alpha + 2k\\pi"), t(" ou "), f("u = -\\alpha + 2k\\pi"), t(", puis on divise tout par 2.")];
    case "produit":
      return [t(`Produit nul (cours, point ${s}) : un des facteurs est nul ; `), f("\\tan x = c \\iff x = \\alpha + k\\pi"), t(" ; "), f("\\tan x"), t(" n'existe pas là où "), f("\\cos x = 0"), t(".")];
  }
}

function resolution(e: DonneesDetectiveTrig): LigneCalcul[] {
  switch (e.variante) {
    case "secteur":
      return resolutionSecteur(e);
    case "parametres":
      return resolutionParametres(e);
    case "equation":
      return resolutionEquation(e);
    case "produit":
      return resolutionProduit(e);
  }
}

export function correctionDetailleeDetectiveTrig(e: E): EtapeCorrection[] {
  const n = indiceLigneFausse(e) + 1;
  const s = sectionCours(e);
  return [
    utilise("a", [t(`Chaque ligne doit suivre d'une règle du cours (cours, point ${s}) ; la première qui la contredit est la ligne fausse, les suivantes n'en sont que des conséquences.`)]),
    calcul("a", controleLigne(e)),
    resultat("a", [t(`La ligne ${n} est fausse.`)]),
    piege("a", [t("Ne signale pas la première valeur qui paraît étrange : c'est souvent une conséquence. Cherche la ligne qui cause l'écart.")]),
    utilise("b", souderPonctuation([t("La règle du cours que la ligne aurait dû appliquer.")])),
    calcul("b", controleLigne(e).slice(0, 1)),
    resultat("b", descriptionFragments(e.type, e)),
    utilise("c", souderPonctuation(utiliseCorrection(e))),
    calcul("c", resolution(e)),
    resultat("c", souderPonctuation(reponseFragments(e))),
    { label: "Vérification", type: "verification", sousQuestion: "c", fragments: souderPonctuation(verificationCorrection(e)) },
    piege("c", [t(`Erreur de la copie : ${nomErreur(e)}. Corriger la ligne ${n} ne suffit pas : toute la suite est à refaire.`)]),
  ];
}
