import type { EtapeCorrection, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, ligne, piege, resultat, utilise, verification } from "../../../export/corrigeTableau";
import type { ExerciceAsymptoteOblique } from "../../core5e/asymptoteOblique.types";
import { ordreComplet, type PhaseAsymptoteOblique } from "../../moteur5e/typesAsymptoteOblique";
import { formatReponseAttenduePhaseLatex, formatTermesDonneesLatex } from "../../ui5e/formatAsymptoteOblique";
import {
  COURS_OBLIQUE,
  divisionEuclidienne,
  finaliser,
  fracBrute,
  lim,
  monomesDe,
  mulP,
  polyDepuisMonomes,
  polyFacteur,
  polyLatex,
  subP,
  t,
  f,
  type Poly,
} from "../../ui5e/corrigeLimites";

/**
 * Corrigé détaillé « comme au tableau » de 5gen21 (asymptote oblique) — règle
 * `.claude/rules/feuilles-evaluations.md`. Une lettre par ÉCRAN (`ordreComplet` du moteur) :
 * - division euclidienne : a = la division posée tour par tour (terme du quotient, produit,
 *   soustraction), vérification Q·D + R = P ; b = f(x) = Q(x) + R/D(x) ; c = l'asymptote (le reste
 *   divisé par D tend vers 0) ;
 * - via les limites : a = a = lim f(x)/x (termes de plus haut degré), b = b = lim [f(x) − ax]
 *   (même dénominateur, soustraction), c = y = ax + b, vérification f(x) − (ax + b) → 0.
 * P et D sont relus dans l'énoncé de l'écran (`formatTermesDonneesLatex`) ; « Résultat » = réponse de
 * l'écran (`formatReponseAttenduePhaseLatex`). SANS `docx` : importé par l'adaptateur ET par
 * `App5gen21.tsx`.
 */

const LETTRES = "abc";

export function lettrePhaseAsymptoteOblique(exercice: ExerciceAsymptoteOblique, phase: PhaseAsymptoteOblique): string {
  return LETTRES[ordreComplet(exercice).indexOf(phase)] ?? "a";
}

function groupeA(s: string, i: number): { contenu: string; fin: number } {
  let n = 0;
  for (let j = i; j < s.length; j++) {
    if (s[j] === "{") n++;
    else if (s[j] === "}") {
      n--;
      if (n === 0) return { contenu: s.slice(i + 1, j), fin: j + 1 };
    }
  }
  return { contenu: s.slice(i + 1), fin: s.length };
}

interface Donnees {
  pLatex: string;
  dLatex: string;
  P: Poly;
  D: Poly;
}

function donnees(e: ExerciceAsymptoteOblique): Donnees {
  const frac = formatTermesDonneesLatex(e)[0];
  const i = frac.indexOf("\\dfrac") + "\\dfrac".length;
  const num = groupeA(frac, i);
  const den = groupeA(frac, num.fin);
  return { pLatex: num.contenu, dLatex: den.contenu, P: polyDepuisMonomes(monomesDe(num.contenu) ?? []), D: polyDepuisMonomes(monomesDe(den.contenu) ?? []) };
}

/** « 2x\cdot D(x) », « -2\cdot D(x) », « x\cdot D(x) ». */
function foisD(terme: Poly): string {
  const l = polyLatex(terme);
  return `${l === "1" ? "" : l === "-1" ? "-" : `${l}\\cdot `}D(x)`;
}

/** Q(x)·D(x) non développé : « (x-6)(x^{2}-x+5) », « (2x-1)\cdot x » quand D(x) = x. */
function produitQD(quotient: Poly, D: Poly): string {
  const dl = polyLatex(D);
  return dl === "x" ? `${polyFacteur(quotient)}\\cdot x` : `${polyFacteur(quotient)}(${dl})`;
}

function definitions(d: Donnees): LigneCalcul[] {
  const pOrd = polyLatex(d.P);
  const dOrd = polyLatex(d.D);
  return [
    ligne(`P(x)=${pOrd}`, pOrd === d.pLatex ? "numérateur" : "numérateur, termes ordonnés"),
    ligne(`D(x)=${dOrd}`, dOrd === d.dLatex ? "dénominateur" : "dénominateur, termes ordonnés"),
  ];
}

function etapesDivision(e: ExerciceAsymptoteOblique): EtapeCorrection[] {
  const d = donnees(e);
  const { quotient, reste, tours } = divisionEuclidienne(d.P, d.D);
  const lignes: LigneCalcul[] = [...definitions(d)];
  let cumul: Poly = [0];
  tours.forEach((tour, k) => {
    const domAvant = polyLatex(tour.avant.map((c, i) => (i === tour.avant.length - 1 ? c : 0)));
    lignes.push(ligne(`\\dfrac{${domAvant}}{${polyLatex(d.D.map((c, i) => (i === d.D.length - 1 ? c : 0)))}}=${polyLatex(tour.terme)}`, k === 0 ? "terme de plus haut degré de P divisé par celui de D" : "on recommence avec le reste obtenu"));
    lignes.push(ligne(`${foisD(tour.terme)}=${polyLatex(tour.produit)}`, "on multiplie le diviseur"));
    cumul = subP(cumul, tour.terme.map((c) => -c));
    lignes.push(ligne(`P(x)-${polyFacteur(cumul)}\\cdot D(x)=${polyLatex(tour.reste)}`, k === tours.length - 1 ? "on soustrait : le degré du reste est inférieur à celui de D" : "on soustrait"));
  });
  const [rQ, rR] = formatReponseAttenduePhaseLatex(e, "diviserEuclidienne");
  const verifQDR = polyLatex(subP(mulP(quotient, d.D), reste.map((c) => -c)));
  return [
    utilise("a", [t("Division euclidienne de P(x) par D(x) : à chaque tour, on divise le terme de plus haut degré du reste par celui de D, on multiplie D par ce terme et on soustrait, jusqu'à un reste de degré inférieur à celui de D ; alors "), f("P(x)=Q(x)\\cdot D(x)+R(x)"), t(` ${COURS_OBLIQUE}.`)]),
    calcul("a", lignes),
    resultat("a", [f(rQ), t(" et "), f(rR), t(".")]),
    verification("a", [t("On redéveloppe "), f("Q(x)\\cdot D(x)+R(x)"), t(" :")], [ligne(`${produitQD(quotient, d.D)}+${polyLatex(reste)}=${verifQDR}`.replace("+-", "-"), "on retrouve P(x)")]),
    piege("a", [t("Soustraire un polynôme, c'est changer le signe de chacun de ses termes : une erreur de signe ici fausse le quotient.")]),
    ...etapeForme(e, d, quotient, reste),
    ...etapeConclusionDivision(e, d, reste),
  ];
}

function etapeForme(e: ExerciceAsymptoteOblique, d: Donnees, quotient: Poly, reste: Poly): EtapeCorrection[] {
  const forme = formatReponseAttenduePhaseLatex(e, "ecrireFormeDeveloppee")[0];
  const c = reste[0];
  const signeR = c < 0 ? `-\\dfrac{${-c}}{${polyLatex(d.D)}}` : `+\\dfrac{${c}}{${polyLatex(d.D)}}`;
  return [
    utilise("b", [t("De "), f("P(x)=Q(x)\\cdot D(x)+R(x)"), t(", on divise chaque membre par "), f("D(x)\\neq 0"), t(" : "), f("f(x)=Q(x)+\\dfrac{R(x)}{D(x)}"), t(` ${COURS_OBLIQUE}.`)]),
    calcul("b", [
      ligne(`f(x)=\\dfrac{${produitQD(quotient, d.D)}${c < 0 ? "" : "+"}${c}}{${polyLatex(d.D)}}`, [f("P=Q\\cdot D+R"), t(" (étape 1)")]),
      ligne(`=${polyLatex(quotient)}${signeR}`, "on sépare la fraction et on simplifie par D(x)"),
      ligne(forme, "même expression, termes de D dans l'ordre de l'énoncé"),
    ]),
    resultat("b", [f(`f(x)${forme}`)]),
  ];
}

function etapeConclusionDivision(e: ExerciceAsymptoteOblique, d: Donnees, reste: Poly): EtapeCorrection[] {
  const equation = formatReponseAttenduePhaseLatex(e, "conclureEquationAsymptote")[0];
  const q = polyLatex([e.b, e.a]);
  const c = reste[0];
  const fracR = `\\dfrac{${c}}{${polyLatex(d.D)}}`;
  return [
    utilise("c", [t("La droite "), f("y=ax+b"), t(" est asymptote oblique quand "), f("f(x)-(ax+b)"), t(" tend vers 0 en "), f("\\pm\\infty"), t(` ${COURS_OBLIQUE}.`)]),
    calcul("c", [
      ligne(`f(x)-(${q})=${fracR}`, "écriture de l'étape 2"),
      ligne(`${lim("\\pm\\infty")} ${fracR}=0`, d.D.length - 1 === 1 ? "numérateur constant, dénominateur → ±∞" : "numérateur constant, dénominateur → +∞"),
    ]),
    resultat("c", [f(equation)]),
    piege("c", [t("L'asymptote est le quotient seul : le reste disparaît à la limite, il ne figure jamais dans l'équation.")]),
  ];
}

// ============================================================================
// Via les limites.
// ============================================================================

/** « gauche = lim (expression) », « = lim N/D » (fraction réduite), « = lim termes de plus haut degré »,
 * « = valeur » — une transformation par ligne. */
function lignesLimiteQuotient(gauche: string, expression: string, justifFraction: string, num: Poly, den: Poly, valeur: string): LigneCalcul[] {
  const dn = num.length - 1;
  const dd = den.length - 1;
  const tn = polyLatex(num.map((c, i) => (i === dn ? c : 0)));
  const td = polyLatex(den.map((c, i) => (i === dd ? c : 0)));
  const L = lim("\\pm\\infty");
  const lignes: LigneCalcul[] = [
    ligne(`${gauche}=${L} ${expression}`, "définition"),
    ligne(`=${L} \\dfrac{${polyLatex(num)}}{${polyLatex(den)}}`, justifFraction),
    ligne(`=${L} \\dfrac{${tn}}{${td}}`, "en ±∞, on garde les termes de plus haut degré"),
  ];
  if (dn === dd) {
    lignes.push(ligne(`=${fracBrute(num[dn], den[dd])}`, [t("on simplifie par "), f(dn === 1 ? "x" : `x^{${dn}}`)]));
    lignes.push(ligne(`=${valeur}`));
  } else {
    lignes.push(ligne(`=${valeur}`, "numérateur de degré inférieur : le quotient tend vers 0"));
  }
  return lignes;
}

function etapesLimites(e: ExerciceAsymptoteOblique): EtapeCorrection[] {
  const d = donnees(e);
  const xD = mulP([0, 1], d.D);
  const axD = mulP([0, e.a], d.D);
  const numB = subP(d.P, axD);
  const moinsAx = e.a === 1 ? "-x" : e.a === -1 ? "+x" : e.a > 0 ? `-${e.a}x` : `+${-e.a}x`;
  const axTxt = polyLatex([0, e.a]);
  const [rA] = formatReponseAttenduePhaseLatex(e, "calculerCoefficientA");
  const [rB] = formatReponseAttenduePhaseLatex(e, "calculerCoefficientB");
  const equation = formatReponseAttenduePhaseLatex(e, "conclureEquationAsymptote")[0];
  const q = polyLatex([e.b, e.a]);
  const reste = subP(d.P, mulP([e.b, e.a], d.D));
  const c = reste[0];
  const fracR = `\\dfrac{${c}}{${polyLatex(d.D)}}`;
  return [
    utilise("a", [t("Coefficient directeur de l'asymptote oblique : "), f(`a=${lim("\\pm\\infty")}\\dfrac{f(x)}{x}`), t(" ; en "), f("\\pm\\infty"), t(` un quotient de polynômes a la même limite que le quotient de leurs termes de plus haut degré ${COURS_OBLIQUE}.`)]),
    calcul("a", [
      ...definitions(d),
      ligne(`\\dfrac{f(x)}{x}=\\dfrac{P(x)}{x\\cdot D(x)}`, "on divise f(x) par x"),
      ligne(`x\\cdot D(x)=${polyLatex(xD)}`, "on développe"),
      ...lignesLimiteQuotient("a", "\\dfrac{f(x)}{x}", "on remplace P(x) et x·D(x)", d.P, xD, `${e.a}`),
    ]),
    resultat("a", [f(rA)]),
    utilise("b", [t("Ordonnée à l'origine : "), f(`b=${lim("\\pm\\infty")}\\left[f(x)-ax\\right]`), t(" avec "), f(`a=${e.a}`), t(" ; on réduit au même dénominateur, puis on compare les termes de plus haut degré "), t(COURS_OBLIQUE), t(".")]),
    calcul("b", [
      ligne(`f(x)${moinsAx}=\\dfrac{P(x)${moinsAx}\\cdot D(x)}{D(x)}`, "même dénominateur"),
      ligne(`${axTxt}\\cdot D(x)=${polyLatex(axD)}`, "on développe"),
      ligne(`P(x)${moinsAx}\\cdot D(x)=${polyLatex(numB)}`, "on soustrait terme à terme"),
      ...lignesLimiteQuotient("b", `\\left[f(x)${moinsAx}\\right]`, "fraction réduite au même dénominateur", numB, d.D, `${e.b}`),
    ]),
    resultat("b", [f(rB)]),
    piege("b", [t("b se calcule avec "), f(`f(x)-ax`), t(", pas avec f(x) seule : la limite de f(x) est infinie.")]),
    utilise("c", [t("L'asymptote oblique est la droite "), f("y=ax+b"), t(` avec les coefficients trouvés aux étapes 1 et 2 ${COURS_OBLIQUE}.`)]),
    calcul("c", [ligne("y=ax+b", "asymptote oblique"), ligne(`=${q}`, [t("on remplace "), f(`a=${e.a}`), t(" et "), f(`b=${e.b}`)])]),
    resultat("c", [f(equation)]),
    verification("c", [t("L'écart entre f et la droite tend vers 0 :")], [
      ligne(`f(x)-(${q})=${fracR}`, "même dénominateur"),
      ligne(`${lim("\\pm\\infty")} ${fracR}=0`, "numérateur constant"),
    ]),
  ];
}

export function correctionDetailleeAsymptoteOblique(exercice: ExerciceAsymptoteOblique): EtapeCorrection[] {
  return finaliser(exercice.variante === "divisionEuclidienne" ? etapesDivision(exercice) : etapesLimites(exercice));
}
