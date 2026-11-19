import type { ExerciceGraphiqueDeriveeLogarithme } from "../../core6e/graphiqueDeriveeLogarithme.types";
import type { EtapeCorrection, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import { construireSvgFonction } from "../../../export/svgGraph";
import { calculerViewBoxGraphique, evaluerCandidat, formatDeriveeCorrecteLatex } from "../../ui6e/formatGraphiqueDeriveeLogarithme";
import { COURS_GRAPHIQUE_DERIVEE, finaliserCorrige, justif } from "../../ui6e/corrigeLogarithmes1";

/**
 * Corrigé détaillé « comme au tableau » de `6gen20` (graphique de la fonction dérivée) — règle
 * `.claude/rules/feuilles-evaluations.md`. SOURCE UNIQUE : importé par l'adaptateur papier
 * (`exportEvaluation.ts`) ET par l'appli (`App6gen20.tsx`). Étape a = « selection » (lecture du
 * graphique de f, une ligne par chose lue, figure des candidats avec le bon mis en évidence),
 * étape b = « derivee » (règle du produit / du quotient ligne à ligne, résultat
 * `formatDeriveeCorrecteLatex`, vérification du zéro ou du signe).
 */

const LETTRES = "ABCD";

function grilleCandidats(e: ExerciceGraphiqueDeriveeLogarithme): string {
  const viewBox = calculerViewBoxGraphique(e);
  const svgs = e.candidats.map((_, i) => construireSvgFonction((x) => evaluerCandidat(e, i, x), viewBox, { lettre: LETTRES[i] ?? String(i + 1), estCorrect: e.indexCorrect === i })).join("");
  return `<div class="grille-graphes-cyclo">${svgs}</div>`;
}

function pgcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) [x, y] = [y, x % y];
  return x;
}

/** Abscisse exacte de l'extremum de f : e (famille A), e^{−(k+p)/k} (famille C), aucune (B). */
export function abscisseExtremumLatex(e: ExerciceGraphiqueDeriveeLogarithme): string | null {
  if (e.famille === "A") return "e";
  if (e.famille === "B") return null;
  let num = -(e.k + e.p);
  let den = e.k;
  if (num === 0) return "1";
  if (den < 0) {
    num = -num;
    den = -den;
  }
  const g = pgcd(num, den);
  num /= g;
  den /= g;
  return `e^{${den === 1 ? `${num}` : `${num < 0 ? "-" : ""}\\frac{${Math.abs(num)}}{${den}}`}}`;
}

function coef(k: number): string {
  return k === 1 ? "" : k === -1 ? "-" : `${k}`;
}

export function correctionDetailleeGraphiqueDeriveeLog(e: ExerciceGraphiqueDeriveeLogarithme): EtapeCorrection[] {
  const lettre = LETTRES[e.indexCorrect] ?? String(e.indexCorrect + 1);
  const xe = abscisseExtremumLatex(e);
  const rep = formatDeriveeCorrecteLatex(e);
  const la: LigneCalcul[] = [];
  let resA: string;
  if (xe === null) {
    const monte = e.k > 0;
    la.push(ligne(`x\\in\\mathopen{]}0\\,;\\,+\\infty\\mathclose{[}`, `la courbe de f ${monte ? "monte" : "descend"} sur tout son domaine, sans sommet`), ligne(`f'(x)${monte ? ">" : "<"}0`, `f ${monte ? "croissante" : "décroissante"} : f′ ${monte ? "positive" : "négative"}`), ligne("f'(x)\\neq 0", "aucun extremum : la courbe de f′ ne coupe jamais l'axe des x"));
    resA = `Graphique ${lettre} : f′ ${monte ? "positive" : "négative"} sur tout le domaine, jamais nulle.`;
  } else {
    const maximum = (e.famille === "A" && e.k > 0) || (e.famille === "C" && e.k < 0);
    const s1 = maximum ? ">" : "<";
    const s2 = maximum ? "<" : ">";
    la.push(
      ligne(`x\\in\\mathopen{]}0\\,;\\,${xe}\\mathclose{[}`, `la courbe de f ${maximum ? "monte" : "descend"} : f′(x) ${maximum ? ">" : "<"} 0`),
      ligne(`f'(x)${s1}0`, "sur cet intervalle"),
      ligne(`f'(${xe})=0`, `${maximum ? "maximum" : "minimum"} de f en x = ${xe === "e" ? "e" : "cette abscisse"} : la courbe de f′ coupe l'axe des x`),
      ligne(`x\\in\\mathopen{]}${xe}\\,;\\,+\\infty\\mathclose{[}`, `la courbe de f ${maximum ? "descend" : "monte"} ensuite`),
      ligne(`f'(x)${s2}0`, "sur cet intervalle"),
    );
    resA = `Graphique ${lettre} : f′ ${maximum ? "positive puis négative" : "négative puis positive"}, nulle à l'abscisse de l'extremum de f.`;
  }
  const etapes: EtapeCorrection[] = [
    utilise("a", [latex("f"), texte(" croissante ⇔ "), latex("f'(x)>0"), texte(" ; "), latex("f"), texte(" décroissante ⇔ "), latex("f'(x)<0"), texte(" ; en un extremum de "), latex("f"), texte(", "), latex("f'(x)=0"), texte(` ${COURS_GRAPHIQUE_DERIVEE}. On lit les variations de `), latex("f"), texte(`, puis on cherche le graphique qui a ces signes${xe === null ? "" : " et ce zéro"}.`)]),
    calcul("a", la),
    { ...resultat("a", [texte(resA)]), figureHtml: grilleCandidats(e) },
    piege("a", [texte("Le graphique de "), latex("f'"), texte(" n'a pas la même forme que celui de "), latex("f"), texte(" : on lit le signe de "), latex("f'"), texte(" sur les variations de "), latex("f"), texte(", pas sur le signe de "), latex("f"), texte(".")]),
  ];
  // b) dérivée
  const lb: LigneCalcul[] = [];
  let utiliseB: string;
  let formule: string;
  if (e.famille === "A") {
    utiliseB = "Dérivée d'un quotient";
    formule = "\\left(\\dfrac{u}{v}\\right)'=\\dfrac{u'v-uv'}{v^2}";
    const k = e.k;
    const lnB = e.baseEstE ? "" : `\\ln(${e.base})`;
    const logx = e.baseEstE ? "\\ln(x)" : `\\log_{${e.base}}(x)`;
    lb.push(
      ligne(`u(x)=${coef(k)}${logx}`, "numérateur"),
      ligne(`u'(x)=\\dfrac{${k}}{x${lnB}}`, justif("", { l: e.baseEstE ? "(\\ln x)'=\\dfrac{1}{x}" : "(\\log_b x)'=\\dfrac{1}{x\\ln(b)}" })),
      ligne("v(x)=x", "dénominateur"),
      ligne("v'(x)=1", "on dérive"),
      ligne("f'(x)=\\dfrac{u'(x)v(x)-u(x)v'(x)}{v(x)^2}", e.c === 0 ? "dérivée d'un quotient" : "dérivée d'un quotient (la constante a une dérivée nulle)"),
      ligne(`=\\dfrac{\\dfrac{${k}}{x${lnB}}\\cdot x-${k < 0 ? `(${coef(k)}${logx})` : `${coef(k)}${logx}`}\\cdot 1}{x^2}`, "on remplace u, u′, v, v′"),
      ...(lnB ? [ligne(`=\\dfrac{\\dfrac{${k}}{${lnB}}-\\dfrac{${coef(k)}\\ln(x)}{${lnB}}}{x^2}`, justif("on simplifie par x et ", { l: `\\log_{${e.base}}(x)=\\dfrac{\\ln(x)}{\\ln(${e.base})}` }))] : [ligne(`=\\dfrac{${k}-${k < 0 ? `(${coef(k)}\\ln(x))` : `${coef(k)}\\ln(x)`}}{x^2}`, "on simplifie par x")]),
      ligne(`=${rep.replace(/^f'\(x\) = /, "")}`, lnB ? justif("on met ", { l: `\\dfrac{${k}}{\\ln(${e.base})}` }, " en évidence") : justif("on met ", { l: `${k}` }, " en évidence")),
    );
  } else if (e.famille === "B") {
    utiliseB = "Dérivée d'un produit";
    formule = "(uv)'=u'v+uv'";
    const exp = e.a === 1 ? "e^{x}" : `e^{${e.a}x}`;
    lb.push(
      ligne(`u(x)=${coef(e.k)}${exp}`, "premier facteur"),
      ligne(`u'(x)=${coef(e.k * e.a)}${exp}`, justif("", { l: "(e^{ax})'=a\\,e^{ax}" })),
      ligne("v(x)=\\ln(x)", "second facteur"),
      ligne("v'(x)=\\dfrac{1}{x}", justif("", { l: "(\\ln x)'=\\dfrac{1}{x}" })),
      ligne("f'(x)=u'(x)v(x)+u(x)v'(x)", e.c === 0 ? "dérivée d'un produit" : "dérivée d'un produit (la constante a une dérivée nulle)"),
      ligne(`=${coef(e.k * e.a)}${exp}\\ln(x)+${e.k < 0 ? `(${coef(e.k)}${exp})` : `${coef(e.k)}${exp}`}\\cdot\\dfrac{1}{x}`, "on remplace u, u′, v, v′"),
      ligne(`=${rep.replace(/^f'\(x\) = /, "")}`, justif("on met ", { l: `${coef(e.k)}${exp}` }, " en évidence")),
    );
  } else {
    utiliseB = "Dérivée d'un produit pour x ln(x)";
    formule = "(uv)'=u'v+uv'";
    const termeP = e.p === 0 ? "" : e.p > 0 ? `+${e.p}` : `${e.p}`;
    lb.push(
      ligne("(x\\ln(x))'=1\\cdot\\ln(x)+x\\cdot\\dfrac{1}{x}", "dérivée d'un produit"),
      ligne("=\\ln(x)+1", "on simplifie"),
      ligne(`f'(x)=${e.k}(\\ln(x)+1)${termeP}`, e.c === 0 ? "on multiplie par k et on dérive le terme en x" : "on multiplie par k, on dérive le terme en x ; la constante disparaît"),
      ligne(`=${rep.replace(/^f'\(x\) = /, "")}`, "on distribue"),
    );
  }
  etapes.push(utilise("b", [texte(`${utiliseB} : `), latex(formule), texte(` ${COURS_GRAPHIQUE_DERIVEE}.`)]), calcul("b", lb), resultat("b", [latex(rep)]));
  if (e.famille === "B") etapes.push(verification("b", [latex(`${e.a === 1 ? "e^{x}" : `e^{${e.a}x}`}>0`), texte(" et "), latex(`${e.a === 1 ? "" : e.a}\\ln(x)+\\dfrac{1}{x}>0`), texte(" sur "), latex("]0\\,;+\\infty["), texte(" : "), latex("f'"), texte(" a le signe de "), latex("k"), texte(`, ici ${e.k > 0 ? "positif" : "négatif"} ; elle ne s'annule jamais — cela confirme le graphique ${lettre}.`)]));
  else if (e.famille === "A") etapes.push(verification("b", [texte("En "), latex("x=e"), texte(`, on retrouve le zéro (graphique ${lettre}) :`)], [ligne(`f'(e)=\\dfrac{${coef(e.k)}(1-\\ln(e))}{e^{2}${e.baseEstE ? "" : `\\ln(${e.base})`}}`, "on remplace x par e"), ligne("=0", justif("car ", { l: "\\ln(e)=1" }))]));
  else if (e.famille === "C" && xe !== null) etapes.push(verification("b", [texte(`À l'abscisse de l'extremum, on retrouve le zéro (graphique ${lettre}) :`)], [ligne(`f'(${xe})=${coef(e.k)}\\ln\\left(${xe}\\right)${e.k + e.p === 0 ? "" : e.k + e.p > 0 ? `+${e.k + e.p}` : `${e.k + e.p}`}`, "on remplace x"), ligne("=0", justif("car ", { l: `\\ln\\left(${xe}\\right)=${xe === "1" ? "0" : xe.slice(3, -1)}` }))]));
  return finaliserCorrige(etapes);
}
