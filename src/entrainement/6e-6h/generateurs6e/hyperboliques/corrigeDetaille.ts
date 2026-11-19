import type { ExerciceHyperboliques, ExerciceHyperboliquesA, ExerciceHyperboliquesB, ExerciceHyperboliquesC, ExerciceHyperboliquesD } from "../../core6e/hyperboliques.types";
import type { EtapeCorrection, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import { phaseApres, phaseInitiale, type PhaseHyperboliques } from "../../moteur6e/typesHyperboliques";
import { pariteAttendueA, signeLimiteMoinsInfiniD, signeLimitePlusInfiniD } from "../../moteur6e/verificationHyperboliques";
import { formatArgument, formatCoef, formatDeriveeC, formatDeriveeSecondeC, formatFMoinsXA, formatFonctionA, formatFormeExponentielleD, formatKLatex, formatRacineB, reponseAttendueLatex } from "../../ui6e/formatHyperboliques";
import { COURS_HYPERBOLIQUES, finaliserCorrige, justif, parN } from "../../ui6e/corrigeLogarithmes1";

/**
 * Corrigé détaillé « comme au tableau » de `6gen19` (sinus et cosinus hyperboliques) — règle
 * `.claude/rules/feuilles-evaluations.md`. SOURCE UNIQUE : importé par l'adaptateur papier
 * (`exportEvaluation.ts`) ET par l'appli (`App6gen19.tsx`). Une étape (lettre) = un écran
 * (`phasesHyperboliques`) ; résultats = `reponseAttendueLatex` de l'écran.
 */

const SH = "\\operatorname{sh}";
const CH = "\\operatorname{ch}";

export function phasesHyperboliques(e: ExerciceHyperboliques): PhaseHyperboliques[] {
  const phases: PhaseHyperboliques[] = [];
  let phase: PhaseHyperboliques | "termine" = phaseInitiale(e);
  while (phase !== "termine") {
    phases.push(phase);
    phase = phaseApres(phase);
  }
  return phases;
}

const PHRASE = { paire: "f est paire.", impaire: "f est impaire.", aucune: "f n'est ni paire ni impaire." } as const;

function correctionA(e: ExerciceHyperboliquesA): EtapeCorrection[] {
  const [avant, apres] = formatFMoinsXA(e).split(" = ");
  const f = formatFonctionA(e);
  const parite = pariteAttendueA(e);
  const l: LigneCalcul[] = [ligne(`f(-x)=${avant}`, "on remplace x par −x"), ligne(`=${apres}`, justif("", { l: `${SH}(-u)=-${SH}(u)` }, ", ", { l: `${CH}(-u)=${CH}(u)` }))];
  switch (e.type) {
    case "shKx":
      l.push(ligne(`=${formatCoef(-e.a)}${SH}(${formatArgument(e.k)})`, "règle des signes"), ligne("=-f(x)"));
      break;
    case "chKx":
    case "chCarre":
      l.push(ligne("=f(x)", "on retrouve f(x)"));
      break;
    case "shChProduit":
      l.push(ligne(`=-${SH}(x)\\cdot ${CH}(x)`, "règle des signes"), ligne("=-f(x)"));
      break;
    case "shCarre":
      l.push(ligne(`=\\left[${SH}(x)\\right]^2`, justif("", { l: "(-u)^2=u^2" })), ligne("=f(x)"));
      break;
    case "shCube":
      l.push(ligne(`=-\\left[${SH}(x)\\right]^3`, justif("", { l: "(-u)^3=-u^3" })), ligne("=-f(x)"));
      break;
    case "xSh":
      l.push(ligne(`=x\\,${SH}(x)`, "moins par moins"), ligne("=f(x)"));
      break;
    case "xCh":
      l.push(ligne(`=-x\\,${CH}(x)`, "règle des signes"), ligne("=-f(x)"));
      break;
    case "shPlusCh":
      l.push(ligne(`-${SH}(x)+${CH}(x)\\neq ${f}`, justif("dès que ", { l: `${SH}(x)\\neq 0` }, " : donc f(−x) ≠ f(x)")), ligne(`-${SH}(x)+${CH}(x)\\neq -${SH}(x)-${CH}(x)`, justif("car ", { l: `${CH}(x)\\geq 1` }, " : donc f(−x) ≠ −f(x)")));
      break;
    case "shMoinsCh":
      l.push(ligne(`-${SH}(x)-${CH}(x)\\neq ${f}`, justif("dès que ", { l: `${SH}(x)\\neq 0` }, " : donc f(−x) ≠ f(x)")), ligne(`-${SH}(x)-${CH}(x)\\neq -${SH}(x)+${CH}(x)`, justif("car ", { l: `${CH}(x)\\geq 1` }, " : donc f(−x) ≠ −f(x)")));
      break;
    case "shPlusConstante": {
      const c = e.c;
      const plusC = c < 0 ? `-${-c}` : `+${c}`;
      const moinsC = c < 0 ? `+${-c}` : `-${c}`;
      l.push(ligne(`-${SH}(x)${plusC}\\neq ${SH}(x)${plusC}`, justif("dès que ", { l: `${SH}(x)\\neq 0` }, " : donc f(−x) ≠ f(x)")), ligne(`-${SH}(x)${plusC}\\neq -${SH}(x)${moinsC}`, justif("car ", { l: `${c}\\neq 0` }, " : donc f(−x) ≠ −f(x)")));
      break;
    }
  }
  const etapes: EtapeCorrection[] = [
    utilise("a", [texte("On calcule "), latex("f(-x)"), texte(" avec "), latex(`${SH}(-x)=-${SH}(x)`), texte(" (sh impaire) et "), latex(`${CH}(-x)=${CH}(x)`), texte(" (ch paire), puis on compare à "), latex("f(x)"), texte(" et à "), latex("-f(x)"), texte(" "), texte(COURS_HYPERBOLIQUES), texte(".")]),
    calcul("a", l),
    resultat("a", [texte(PHRASE[parite])]),
  ];
  if (e.type === "shCarre") etapes.push(piege("a", [texte("sh est impaire, mais son carré est pair : "), latex("(-u)^2=u^2"), texte(".")]));
  else if (e.type === "xSh") etapes.push(piege("a", [texte("Produit de deux fonctions impaires (x et sh) : la fonction est paire.")]));
  else if (e.type === "shPlusConstante") etapes.push(piege("a", [texte("La constante casse la symétrie : sh est impaire, mais pas sh + c.")]));
  return etapes;
}

function correctionB(e: ExerciceHyperboliquesB): EtapeCorrection[] {
  const k = formatKLatex(e);
  const d2 = e.kDen * e.kDen;
  const n = e.sousType === "trouverCh" ? d2 + e.kNum * e.kNum : e.kNum * e.kNum - d2;
  const carre = d2 === 1 ? `${n}` : `\\dfrac{${n}}{${d2}}`;
  const racine = formatRacineB(e);
  const rac = `\\sqrt{${carre}}`;
  const l: LigneCalcul[] = [];
  if (e.sousType === "trouverCh") {
    l.push(
      ligne(`${CH}^2(x_0)=1+${SH}^2(x_0)`, justif("", { l: `${CH}^2-${SH}^2=1` })),
      ligne(`=1+\\left(${k}\\right)^2`, justif("", { l: `${SH}(x_0)=${k}` })),
      ligne(`=${carre}`, "on calcule"),
      ligne(`${CH}(x_0)=${rac}`, justif("racine positive : ", { l: `${CH}(x)\\geq 1` })),
    );
    if (racine !== rac) l.push(ligne(`=${racine}`, "on simplifie la racine"));
  } else {
    l.push(ligne(`${SH}^2(x_0)=${CH}^2(x_0)-1`, justif("", { l: `${CH}^2-${SH}^2=1` })), ligne(`=\\left(${k}\\right)^2-1`, justif("", { l: `${CH}(x_0)=${k}` })), ligne(`=${carre}`, "on calcule"));
    const signes = e.signeX0 === null ? [1, -1] : [e.signeX0];
    for (const s of signes) {
      const sg = s > 0 ? "" : "-";
      l.push(ligne(`${SH}(x_0)=${sg}${rac}`, s > 0 ? (e.signeX0 === null ? "si x₀ > 0 (sh a le signe de x)" : "x₀ > 0 et sh a le signe de x : racine positive") : e.signeX0 === null ? "si x₀ < 0" : "x₀ < 0 et sh a le signe de x : racine négative"));
      if (racine !== rac) l.push(ligne(`=${sg}${racine}`, "on simplifie la racine"));
    }
  }
  const etapes: EtapeCorrection[] = [
    utilise("a", [texte("Identité "), latex(`${CH}^2(x)-${SH}^2(x)=1`), texte(" en "), latex("x_0"), texte(" ; "), latex(`${CH}(x)\\geq 1`), texte(" et "), latex(`${SH}(x)`), texte(" a le signe de "), latex("x"), texte(" "), texte(COURS_HYPERBOLIQUES), texte(".")]),
    calcul("a", l),
    resultat("a", [latex(reponseAttendueLatex(e, "bValeurs"))]),
  ];
  if (e.sousType === "trouverSh") etapes.push(piege("a", e.signeX0 === null ? [texte("Sans le signe de "), latex("x_0"), texte(", les deux racines conviennent : il faut donner les deux valeurs.")] : [texte("Le signe de "), latex("x_0"), texte(" choisit la racine : "), latex(`${SH}(x)`), texte(" a le signe de "), latex("x"), texte(".")]));
  return etapes;
}

function correctionC(e: ExerciceHyperboliquesC): EtapeCorrection[] {
  const { a, b, k } = e;
  const arg = formatArgument(k);
  const d1 = formatDeriveeC(e);
  const d2 = formatDeriveeSecondeC(e);
  const regle = justif("", { l: `\\left(${SH}(kx)\\right)'=k\\,${CH}(kx)` }, ", ", { l: `\\left(${CH}(kx)\\right)'=k\\,${SH}(kx)` });
  const terme = (c: number, fn: string, premier: boolean) => `${premier || c < 0 ? "" : "+"}${c}\\cdot ${k}\\,${fn}(${arg})`;
  const la: LigneCalcul[] = [ligne(`f(x)=${a === 1 ? "" : a === -1 ? "-" : a}${SH}(${arg})${b < 0 ? "" : "+"}${b === 1 ? "" : b === -1 ? "-" : b}${CH}(${arg})`, "fonction de départ")];
  if (k === 1) la.push(ligne(`f'(x)=${d1}`, justif("", { l: `${SH}'=${CH}` }, ", ", { l: `${CH}'=${SH}` })));
  else la.push(ligne(`f'(x)=${terme(a, CH, true)}${terme(b, SH, false)}`, regle), ligne(`=${d1}`, "on multiplie les coefficients"));
  const lb: LigneCalcul[] = [ligne(`f'(x)=${d1}`, "dérivée de l'étape 1")];
  if (k === 1) lb.push(ligne(`f''(x)=${d2}`, justif("", { l: `${SH}'=${CH}` }, ", ", { l: `${CH}'=${SH}` })));
  else lb.push(ligne(`f''(x)=${terme(a * k, SH, true)}${terme(b * k, CH, false)}`, regle), ligne(`=${d2}`, "on multiplie les coefficients"));
  return [
    utilise("a", [latex(`${SH}'=${CH}`), texte(" et "), latex(`${CH}'=${SH}`), texte(" (sans changement de signe) ; la dérivée de l'argument "), latex(arg), texte(` fait apparaître le facteur ${k} ${COURS_HYPERBOLIQUES}.`)]),
    calcul("a", la),
    resultat("a", [latex(reponseAttendueLatex(e, "cDerivee"))]),
    piege("a", [texte("Contrairement à "), latex("\\cos' = -\\sin"), texte(", aucun signe ne change : "), latex(`${CH}'=${SH}`), texte(".")]),
    utilise("b", [texte("Même règle appliquée à "), latex("f'(x)"), texte(".")]),
    calcul("b", lb),
    resultat("b", [latex(reponseAttendueLatex(e, "cDeriveeSeconde"))]),
    verification("b", [texte("On retrouve "), latex(`f''=${k * k}\\cdot f`), texte(" :")], [ligne(`f''(x)=${k * k}\\left(${a === 1 ? "" : a === -1 ? "-" : a}${SH}(${arg})${b < 0 ? "" : "+"}${b === 1 ? "" : b === -1 ? "-" : b}${CH}(${arg})\\right)`, "on met en évidence")]),
  ];
}

function correctionD(e: ExerciceHyperboliquesD): EtapeCorrection[] {
  const { a, b } = e;
  const forme = formatFormeExponentielleD(e);
  const s = a + b;
  const t = b - a;
  const lp = signeLimitePlusInfiniD(e) === "plus_infini" ? "+\\infty" : "-\\infty";
  const lm = signeLimiteMoinsInfiniD(e) === "plus_infini" ? "+\\infty" : "-\\infty";
  const coefTerme = (c: number, partie: string, premier: boolean) => `${premier ? "" : c < 0 ? "" : "+"}${c === 1 ? "" : c === -1 ? "-" : c}${partie}`;
  return [
    utilise("a", [texte("Définitions "), latex(`${SH}(x)=\\dfrac{e^x-e^{-x}}{2}`), texte(" et "), latex(`${CH}(x)=\\dfrac{e^x+e^{-x}}{2}`), texte(` ; on met au même dénominateur et on regroupe ${COURS_HYPERBOLIQUES}.`)]),
    calcul("a", [
      ligne(`f(x)=${parN(a)}\\cdot\\dfrac{e^x-e^{-x}}{2}+${parN(b)}\\cdot\\dfrac{e^x+e^{-x}}{2}`, "on remplace sh et ch"),
      ligne(`=\\dfrac{${coefTerme(a, "e^x", true)}${coefTerme(-a, "e^{-x}", false)}${coefTerme(b, "e^x", false)}${coefTerme(b, "e^{-x}", false)}}{2}`, "même dénominateur, on distribue"),
      ligne(`=${forme}`, justif("on regroupe : ", { l: `a+b=${s}` }, ", ", { l: `b-a=${t}` })),
    ]),
    resultat("a", [latex(reponseAttendueLatex(e, "dReecriture"))]),
    utilise("b", [texte("En "), latex("+\\infty"), texte(", "), latex("e^{-x}\\to 0"), texte(" et "), latex("e^{x}\\to+\\infty"), texte(" ; en "), latex("-\\infty"), texte(", c'est l'inverse. Le terme qui survit impose le signe de la limite.")]),
    calcul("b", [
      ligne("\\lim_{x\\to+\\infty}e^{-x}=0", "le terme en e⁻ˣ disparaît"),
      ligne(`\\lim_{x\\to+\\infty}f(x)=${lp}`, justif("terme ", { l: `\\dfrac{${s}}{2}e^x` }, `, coefficient ${s > 0 ? "positif" : "négatif"}`)),
      ligne("\\lim_{x\\to-\\infty}e^{x}=0", "le terme en eˣ disparaît"),
      ligne(`\\lim_{x\\to-\\infty}f(x)=${lm}`, justif("terme ", { l: `\\dfrac{${t}}{2}e^{-x}` }, `, coefficient ${t > 0 ? "positif" : "négatif"}`)),
    ]),
    resultat("b", [latex(reponseAttendueLatex(e, "dLimites"))]),
  ];
}

export function correctionDetailleeHyperboliques(e: ExerciceHyperboliques): EtapeCorrection[] {
  switch (e.famille) {
    case "A":
      return finaliserCorrige(correctionA(e));
    case "B":
      return finaliserCorrige(correctionB(e));
    case "C":
      return finaliserCorrige(correctionC(e));
    case "D":
      return finaliserCorrige(correctionD(e));
  }
}
