import type { ExerciceRelationsRacines } from "../../core/relationsRacines.types";
import type { PhaseRelationsRacines } from "../../moteur/sessionRelationsRacines";
import type { EtapeCorrection, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import { formatFormeFactoriseeDepuisRacines, formatMembreGauche } from "../../ui/formatEquation";
import { sommeEtProduitAttendus } from "../../moteur/verificationRelationsRacines";
import { q, qp } from "../../ui/corrigeChapitre3";
import { COURS_RESOUDRE, prefixe } from "../../ui/corrigeSecondDegre2";

/**
 * Corrigé détaillé « comme au tableau » de gen67 (relations entre racines et coefficients) — règle
 * `.claude/rules/feuilles-evaluations.md`. Trois écrans = trois vraies questions a) b) c) : somme et
 * produit (relations de Viète), factorisation à partir des racines, équation de coefficient 1. Valeurs
 * de l'instance et mêmes fonctions que l'appli (`sommeEtProduitAttendus`,
 * `formatFormeFactoriseeDepuisRacines`, `formatMembreGauche`). Partagé par l'adaptateur et l'appli.
 */

type E = ExerciceRelationsRacines;

const PHASES: PhaseRelationsRacines[] = ["sommeProduit", "factorisation", "equationDepuisRacines"];

export function lettrePhaseRelationsRacines(phase: PhaseRelationsRacines): string {
  return "abc"[PHASES.indexOf(phase)] ?? "";
}

export function factorisationLatex(e: E): string {
  return `${formatFormeFactoriseeDepuisRacines(e.enonce, e.racines)} = 0`;
}

export function equationUnitaireLatex(e: E): string {
  const { s, p } = sommeEtProduitAttendus(e);
  return `${formatMembreGauche({ a: 1, b: -s, c: p })} = 0`;
}

export function correctionDetailleeRelationsRacines(e: E): EtapeCorrection[] {
  const { a, b, c } = e.enonce;
  const { s, p } = sommeEtProduitAttendus(e);
  const [x1, x2] = e.racines;
  const double = x1 === x2;
  const M = formatMembreGauche(e.enonce);
  const forme = formatFormeFactoriseeDepuisRacines(e.enonce, e.racines);
  const substitue = double ? `${prefixe(a)}(x-${qp(x1)})^2` : `${prefixe(a)}(x-${qp(x1)})(x-${qp(x2)})`;
  const lignesB: LigneCalcul[] = [ligne(double ? `${M}=a(x-x_0)^2` : `${M}=a(x-x_1)(x-x_2)`, "forme factorisée à partir des racines"), ligne(`=${substitue}`, "on remplace a et les racines")];
  if (substitue.replace(/\s/g, "") !== forme.replace(/\s/g, "")) lignesB.push(ligne(`=${forme}`, "on simplifie les signes"));
  const unitaire = formatMembreGauche({ a: 1, b: -s, c: p });
  const lignesC: LigneCalcul[] = [ligne(`x^2-Sx+P=0`, "équation de coefficient 1 de racines x₁ et x₂"), ligne(`x^2-${s === 1 ? "" : qp(s)}x+${qp(p)}=0`, "on remplace S et P (question a)")];
  lignesC.push(ligne(`${unitaire} = 0`, "on simplifie les signes"));
  const termeX = (r: number) => (s === 0 ? "" : `${-s < 0 ? "-" : "+"}${Math.abs(s) === 1 ? "" : `${q(Math.abs(s))}\\cdot `}${qp(r)}`);
  const testeC = (r: number) => `${qp(r)}^2${termeX(r)}${p === 0 ? "" : `${p < 0 ? "-" : "+"}${q(Math.abs(p))}`}=0`;
  return [
    utilise("a", [texte("Relations de Viète : "), latex("S=x_1+x_2=-\\dfrac{b}{a}"), texte(" et "), latex("P=x_1\\cdot x_2=\\dfrac{c}{a}"), texte(` ${COURS_RESOUDRE}.`)]),
    calcul("a", [ligne("S=-\\dfrac{b}{a}"), ligne(`=-\\dfrac{${q(b)}}{${q(a)}}`, "on remplace a et b"), ligne(`=${q(s)}`), ligne("P=\\dfrac{c}{a}"), ligne(`=\\dfrac{${q(c)}}{${q(a)}}`, "on remplace a et c"), ligne(`=${q(p)}`)]),
    resultat("a", [latex(`S = ${q(s)}`), texte(" et "), latex(`P = ${q(p)}`)]),
    piege("a", [texte("Le signe moins de "), latex("S = -\\dfrac{b}{a}"), texte(" : S n'est pas "), latex("\\dfrac{b}{a}"), texte(".")]),
    utilise("b", [texte("Factorisation à partir des racines, avec le même coefficient a que l'équation : "), latex(double ? "a(x-x_0)^2=0" : "a(x-x_1)(x-x_2)=0"), texte(` ${COURS_RESOUDRE}.`)]),
    calcul("b", lignesB),
    resultat("b", [latex(factorisationLatex(e))]),
    verification("b", [texte("En développant, on retrouve l'équation : ")], [ligne(`${forme}=${prefixe(a)}(${unitaire})`, "produit des deux facteurs"), ligne(`=${M}`, "on distribue a")]),
    piege("b", [texte(a === 1 ? "Une racine négative donne un facteur avec un signe plus : " : "Oublier le coefficient a devant le produit change l'équation : "), latex(a === 1 ? "x - (-3) = x + 3" : `a = ${q(a)}`), texte(".")]),
    utilise("c", [texte("L'équation de coefficient 1 qui a ces racines est "), latex("x^2 - Sx + P = 0"), texte(`, avec S et P de la question a) ${COURS_RESOUDRE}.`)]),
    calcul("c", lignesC),
    resultat("c", [latex(equationUnitaireLatex(e))]),
    verification("c", [texte(double ? "La racine double vérifie l'équation : " : "Chaque racine vérifie l'équation : ")], double ? [ligne(testeC(x1))] : [ligne(testeC(x1)), ligne(testeC(x2))]),
  ];
}
