import type { EtapeCorrection, FragmentConsigne, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, lignesDepuisChaine, piege as lignePiege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import type { ExerciceDetectiveIntegrales } from "../../core6e/detectiveIntegrales.types";
import { bornesG1, bornesL1, correction, descriptionCorrecte, fonctionLatex, indiceLigneFausse, parN, valeursAttendues } from "../../moteur6e/modeleDetectiveIntegrales";
import { constat, descriptionFragments, piege, souderPonctuation, valeurFragments } from "../../ui6e/formatDetectiveIntegrales";
import { COURS_AIRES, COURS_CONDITION_INITIALE, COURS_INTEGRALES, COURS_PRIMITIVES, COURS_PROBLEMES, COURS_VOLUMES, lignesDepuisJustification } from "../../ui6e/corrigeIntegrales2";

/**
 * Corrigé détaillé « comme au tableau » de `6gen84` (détective d'erreurs : intégrales et
 * primitives) — règle `.claude/rules/feuilles-evaluations.md`, sur le modèle de 6gen99. Étapes :
 * a) la ligne fausse (contrôle écrit en calcul : dérivée de la primitive de la copie, signe d'une
 * intégrale, condition non utilisée…), b) le nom de l'erreur (verdict), c) la résolution reprise à
 * partir de la ligne fausse : chaque ligne de `correction(e)` éclatée en lignes de calcul alignées.
 */

type E = ExerciceDetectiveIntegrales;
const t = texte;
const f = latex;

function cc(c: number, expr: string): string {
  return c === 1 ? expr : `${c}${expr}`;
}

/** Renvoi au cours selon le type d'exercice support. */
function renvoi(e: E): string {
  switch (e.scenario) {
    case "R1":
    case "R2":
      return COURS_AIRES;
    case "V1":
    case "V2":
      return COURS_VOLUMES;
    case "L2":
    case "G2":
    case "C1":
      return COURS_CONDITION_INITIALE;
    case "C2":
      return COURS_PROBLEMES;
    case "A1":
    case "A2":
      return COURS_PRIMITIVES;
    default:
      return COURS_INTEGRALES;
  }
}

/** Contrôle de la ligne fausse, écrit en calcul. */
function lignesControle(e: E): LigneCalcul[] {
  const d = e.donnees;
  const fx = fonctionLatex(e);
  switch (e.scenario) {
    case "A1":
      return [ligne(`\\left(${cc(d.c!, `\\sin(${d.k}x)`)}\\right)'=${d.c! * d.k!}\\cos(${d.k}x)`, "on dérive la primitive de la copie"), ligne(`${d.c! * d.k!}\\cos(${d.k}x)\\neq ${fx}`, [t("ce n'est pas "), f("f(x)")])];
    case "A2":
      return [
        ligne(`\\left(\\dfrac{(${d.a}x+${d.b})^{${d.n! + 1}}}{${d.n! + 1}}\\right)'=${d.a}(${d.a}x+${d.b})^{${d.n}}`, "on dérive la primitive de la copie (dérivée d'une composée)"),
        ligne(`${d.a}(${d.a}x+${d.b})^{${d.n}}\\neq ${fx}`, [t("ce n'est pas "), f("f(x)")]),
      ];
    case "L1": {
      const { bas, haut } = bornesL1(e);
      return [ligne(`${bas}\\leq x\\leq ${haut}<0`, "l'intervalle ne contient que des nombres négatifs"), ligne(`\\ln(${haut})\\notin\\mathbb{R}`, "ln n'est défini que pour un nombre strictement positif : la primitive de la copie ne convient pas, alors que f est continue sur l'intervalle")];
    }
    case "L2":
      return [ligne("x<0", [t("on travaille sur "), f("\\mathopen{]}-\\infty;0\\mathclose{[}")]), ligne("\\ln(x)\\notin\\mathbb{R}", "ln n'est défini que pour un nombre strictement positif : la primitive de la copie n'existe pas sur cet intervalle")];
    case "G1":
      return [ligne("\\left(\\cos(x)\\right)'=-\\sin(x)", "on dérive la fonction du crochet de la copie"), ligne("-\\sin(x)\\neq\\sin(x)", "le crochet donne l'opposé de l'intégrale")];
    case "G2":
      return [ligne(`\\left(-${cc(d.c!, "\\sin(x)")}\\right)'=-${cc(d.c!, "\\cos(x)")}`, "on dérive la primitive de la copie"), ligne(`-${cc(d.c!, "\\cos(x)")}\\neq ${fx}`, [t("ce n'est pas "), f("f(x)")])];
    case "R1":
      return [
        ligne(`f(${d.k})=${d.k}^2-${d.k! * d.k!}`, "on cherche où f s'annule"),
        ligne("=0", `f s'annule en x = ${d.k}, à l'intérieur de [0 ; ${d.m}]`),
        ligne(`f(0)=-${d.k! * d.k!}<0`, "f est négative au début de l'intervalle"),
        ligne(`f(${d.m})=${d.m! * d.m! - d.k! * d.k!}>0`, "et positive à la fin : l'intégrale compense les deux parties"),
      ];
    case "R2":
      return [
        ligne(`${cc(d.k!, "x")}=x^2`, "intersections des deux courbes"),
        ligne(`x(x-${d.k})=0`, "on factorise"),
        ligne(`${d.k}\\times ${d.m}<${d.m}^2`, `en x = ${d.m}, la parabole est au-dessus : l'ordre des courbes change en x = ${d.k}`),
      ];
    case "V1":
      return [ligne(`[f(x)]^2=\\left(${cc(d.k!, "x")}\\right)^2`, "méthode des disques : on intègre le carré du rayon"), ligne(`=${cc(d.k! * d.k!, "x^2")}`), ligne(`${cc(d.k! * d.k!, "x^2")}\\neq ${cc(d.k!, "x")}`, "la copie intègre f(x) au lieu de [f(x)]²")];
    case "V2":
      return [ligne(`V=\\pi\\displaystyle\\int_0^{${d.h}} [f(x)]^2\\,dx`, "méthode des disques : le facteur π fait partie de la formule"), ligne(`\\int_0^{${d.h}} ${d.k}x\\,dx\\neq V`, "la copie a perdu π")];
    case "B1": {
      const Fa = d.a! ** 3 + d.p! * d.a!;
      const Fb = d.b! ** 3 + d.p! * d.b!;
      return [ligne(`\\int_{${d.a}}^{${d.b}} f(x)\\,dx=F(${d.b})-F(${d.a})`, "théorème fondamental : la borne supérieure d'abord"), ligne(`F(${d.a})-F(${d.b})=${Fa - Fb}<0`, "la copie trouve un nombre négatif alors que f > 0 sur l'intervalle")];
    }
    case "C1": {
      const v = d.x! ** 3 + d.b! * d.x! * d.x!;
      return [ligne(`${v}+C=${d.y}`, "condition initiale"), ligne(`C=${d.y}-${parN(v)}`, `on retire ${v} des deux membres`.replace(/-/, "−")), ligne(`=${d.y! - v}`), ligne(`${d.y! - v}\\neq ${d.y! + v}`, "valeur de la copie")];
    }
    case "C2":
      return [ligne(`v(t)=${cc(d.k!, "t^2")}+C`, "primitive de l'accélération, à une constante près"), ligne(`v(0)=C`, "valeur en 0"), ligne(`=${d.v}`, "donnée de l'énoncé, ignorée par la copie")];
  }
}

/**
 * Lignes de la résolution corrigée → lignes de calcul : chaque formule qui porte une relation devient
 * une ligne (chaîne « A=B=C » éclatée), le texte qui l'entoure sert de justification
 * (`lignesDepuisJustification`, commun à 6gen79). Une formule « = … » qui prolonge une ligne de la
 * copie non reprise, ou qui suit le mot « aire », reçoit le nom de la quantité.
 */
function versLignes(lignesCopie: FragmentConsigne[][], continuation: string): LigneCalcul[] {
  const lignes: LigneCalcul[] = [];
  for (const l of lignesCopie) {
    let texteAvant = "";
    const prepare = l.map((x) => {
      if (x.type === "texte") {
        texteAvant += x.valeur;
        return x;
      }
      let v = x.valeur.replace(/\s*=\s*/g, "=").trim();
      if (v.startsWith("=") && (/aire\s*$/i.test(texteAvant.trim()) || lignes.length === 0)) v = `${/aire\s*$/i.test(texteAvant.trim()) ? "\\mathcal{A}" : continuation}${v}`;
      return { type: "latex" as const, valeur: v };
    });
    for (const ld of lignesDepuisJustification(prepare)) {
      const morceaux = lignesDepuisChaine(ld.latex);
      morceaux.forEach((m, j) => lignes.push(j === 0 && ld.justification ? { ...m, justification: ld.justification } : m));
    }
  }
  return lignes;
}

/** Quantité que prolonge une ligne « = … » de la copie (la ligne précédente n'est pas reprise). */
function nomContinuation(e: E): string {
  if (e.scenario === "G1") {
    const { a, b } = bornesG1(e);
    return `\\int_{${a.l}}^{${b.l}} f(x)\\,dx`;
  }
  if (e.scenario === "V1" || e.scenario === "V2") return "V";
  if (e.scenario === "R1" || e.scenario === "R2") return "\\mathcal{A}";
  return "";
}

function reponseFragments(e: E): FragmentConsigne[] {
  return valeursAttendues(e).flatMap((v, i) => (i === 0 ? valeurFragments(v) : [t(" ; "), ...valeurFragments(v)]));
}

export function correctionDetailleeDetectiveIntegrales(e: E): EtapeCorrection[] {
  const i = indiceLigneFausse(e);
  const lignes = versLignes(correction(e), nomContinuation(e));
  return [
    utilise("a", [t("On refait chaque ligne de la copie à partir de la précédente (en dérivant une primitive, en contrôlant un signe, en vérifiant que chaque donnée sert) : la ligne fausse est la première qui n'en découle pas ; les suivantes n'en sont que les conséquences.")]),
    calcul("a", lignesControle(e), [t(`Contrôle de la ligne ${i + 1} :`)]),
    resultat("a", [t(`La ligne ${i + 1} est fausse.`)]),
    verification("a", constat(e)),
    utilise("b", [t(`On nomme la règle du cours qui n'a pas été respectée à cette ligne ${renvoi(e)}.`)]),
    resultat("b", descriptionFragments(descriptionCorrecte(e), e)),
    lignePiege("b", piege(e)),
    utilise("c", [t(`On reprend la résolution à partir de la ligne ${i + 1}, avec la règle correcte ; les lignes suivantes sont recalculées ${renvoi(e)}.`)]),
    ...(lignes.length ? [calcul("c", lignes)] : []),
    resultat("c", souderPonctuation(reponseFragments(e))),
  ];
}

