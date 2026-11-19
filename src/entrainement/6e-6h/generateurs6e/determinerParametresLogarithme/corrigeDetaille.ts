import type { ExerciceDeterminerParametresLogarithme } from "../../core6e/determinerParametresLogarithme.types";
import type { EtapeCorrection, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import { formatFonctionLatex, formatReponseAttenduePhaseLatex, ordonneeSecondeMarque } from "../../ui6e/formatDeterminerParametresLogarithme";
import { COURS_PARAMETRES, finaliserCorrige, justif, parN } from "../../ui6e/corrigeLogarithmes1";

/**
 * Corrigé détaillé « comme au tableau » de `6gen18` (paramètres a et b de f(x) = a + b·ln(x) depuis
 * le graphique) — règle `.claude/rules/feuilles-evaluations.md`. SOURCE UNIQUE : importé par
 * l'adaptateur papier (`exportEvaluation.ts`) ET par l'appli (`App6gen18.tsx`). Étapes a, b, c = les
 * écrans lireA, equationB, fonction ; résultats = `formatReponseAttenduePhaseLatex`. Lecture : une
 * ligne par chose lue, avec ce qu'on lit et où.
 */

export function correctionDetailleeParametresLog(e: ExerciceDeterminerParametresLogarithme): EtapeCorrection[] {
  const { a, b } = e;
  const rep = (p: "lireA" | "equationB" | "fonction") => formatReponseAttenduePhaseLatex(e, p);
  const etapes: EtapeCorrection[] = [
    utilise("a", [texte("En "), latex("x=1"), texte(", "), latex("\\ln(1)=0"), texte(" : l'image de 1 est "), latex("a"), texte(". On lit l'ordonnée du point de la courbe d'abscisse 1 "), texte(COURS_PARAMETRES), texte(".")]),
    calcul("a", [
      ligne("f(1)=a+b\\cdot\\ln(1)", "on remplace x par 1"),
      ligne("=a", justif("car ", { l: "\\ln(1)=0" })),
      ligne(`f(1)=${a}`, justif(`lecture : le point ${e.lettrePoint1} `, { l: `(1\\,;\\,${a})` }, " est sur la courbe")),
      ligne(`a=${a}`, "les deux expressions de f(1)"),
    ]),
    resultat("a", [latex(rep("lireA")[0])]),
  ];
  const lb: LigneCalcul[] = [];
  const lc: LigneCalcul[] = [];
  if (e.variante === "pente") {
    const m = b;
    etapes.push(utilise("b", [texte("La pente de la tangente en "), latex("x=1"), texte(" est le nombre dérivé "), latex("f'(1)"), texte(", avec "), latex("(\\ln x)'=\\dfrac{1}{x}"), texte(" ; la pente d'une droite passant par deux points est "), latex("\\dfrac{\\Delta y}{\\Delta x}"), texte(` ${COURS_PARAMETRES}.`)]));
    lb.push(
      ligne("f'(x)=\\dfrac{b}{x}", justif("", { l: "(a+b\\ln x)'=\\dfrac{b}{x}" })),
      ligne("f'(1)=b", "on remplace x par 1"),
      ligne(`\\dfrac{${a + b}-${parN(a)}}{2-1}=${m}`, justif("pente lue : la tangente passe par ", { l: `(1\\,;\\,${a})` }, " et ", { l: `(2\\,;\\,${a + b})` })),
      ligne(`f'(1)=${m}`, "la pente de la tangente est f′(1)"),
    );
    lc.push(ligne(`b=${b}`, "équation de l'étape 2 : f′(1) = b"));
  } else {
    const n = e.variante === "pointE" ? 1 : 2;
    const xL = e.variante === "pointE" ? "e" : "e^2";
    const y = ordonneeSecondeMarque(e);
    etapes.push(utilise("b", [texte(`Le point ${e.lettrePoint2} est sur la courbe : son ordonnée est l'image de son abscisse ; `), latex(`\\ln(${xL})=${n}`), texte(` ${COURS_PARAMETRES}.`)]));
    lb.push(
      ligne(`f(${xL})=${y}`, justif(`lecture : le point ${e.lettrePoint2} `, { l: `(${xL}\\,;\\,${y})` }, " est sur la courbe")),
      ligne(`${a === 0 ? "" : `${a}+`}b\\cdot\\ln(${xL})=${y}`, justif("on remplace x par ", { l: xL }, " et a par sa valeur")),
      ligne(`${a === 0 ? "" : `${a}+`}${n === 1 ? "" : "2"}b=${y}`, justif("", { l: `\\ln(${xL})=${n}` })),
    );
    lc.push(ligne(`${a === 0 ? "" : `${a}+`}${n === 1 ? "" : "2"}b=${y}`, "équation de l'étape 2"));
    if (a !== 0) lc.push(ligne(`${n === 1 ? "" : "2"}b=${y - a}`, a > 0 ? `on soustrait ${a}` : `on ajoute ${-a}`));
    if (n === 2) lc.push(ligne(`b=\\dfrac{${y - a}}{2}`, "on divise par 2"));
    lc.push(ligne(`b=${b}`, "on calcule"));
  }
  etapes.push(calcul("b", lb), resultat("b", [latex(rep("equationB")[0])]));
  if (e.variante !== "pente") etapes.push(piege("b", [texte("Au point d'abscisse "), latex(e.variante === "pointE" ? "e" : "e^2"), texte(" on lit "), latex(e.variante === "pointE" ? "a + b" : "a + 2b"), texte(", pas b : seul le point d'abscisse 1 donne directement un paramètre.")]));
  lc.push(ligne(formatFonctionLatex(e), justif("on remplace ", { l: `a=${a}` }, " et ", { l: `b=${b}` })));
  etapes.push(
    utilise("c", [texte("On résout l'équation du premier degré en b, puis on remplace a et b dans "), latex("f(x)=a+b\\ln(x)"), texte(".")]),
    calcul("c", dedoublonner(lc)),
    resultat("c", [latex(rep("fonction")[0]), texte(", donc "), latex(rep("fonction")[1])]),
  );
  if (e.variante === "pente") etapes.push(verification("c", [texte("La courbe passe bien par "), latex(`(1\\,;\\,${a})`), texte(" :")], [ligne(`f(1)=${a}${b < 0 ? "" : "+"}${b}\\cdot\\ln(1)`, "on remplace x par 1"), ligne(`=${a}`)]));
  else {
    const xL = e.variante === "pointE" ? "e" : "e^2";
    const n = e.variante === "pointE" ? 1 : 2;
    etapes.push(verification("c", [texte("On retrouve le second point :")], [ligne(`f(${xL})=${a}${b < 0 ? "" : "+"}${b}\\cdot ${n}`, justif("", { l: `\\ln(${xL})=${n}` })), ligne(`=${a + b * n}`)]));
  }
  return finaliserCorrige(etapes);
}

function dedoublonner(l: LigneCalcul[]): LigneCalcul[] {
  return l.filter((x, i) => i === 0 || x.latex.replace(/^b=/, "") !== l[i - 1].latex.replace(/^b=/, ""));
}
