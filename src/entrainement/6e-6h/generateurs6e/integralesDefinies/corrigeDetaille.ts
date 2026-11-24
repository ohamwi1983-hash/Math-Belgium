import type { ExerciceIntegraleParametre, ExerciceIntegralesDefinies } from "../../core6e/integralesDefinies.types";
import type { EtapeCorrection, FragmentConsigne, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise } from "../../../export/corrigeTableau";
import { phasesPourExercice } from "../../moteur6e/typesIntegralesDefinies";
import type { PhaseIntegralesDefinies } from "../../moteur6e/typesIntegralesDefinies";
import type { PhaseCalculPrimitives } from "../../moteur6e/typesCalculPrimitives";
import { phasesPourExercice as phasesPrimitive } from "../../moteur6e/typesCalculPrimitives";
import { formatReponseAttenduePhaseLatex } from "../../ui6e/formatIntegralesDefinies";
import { primitiveLatex } from "../../ui6e/formatCalculPrimitives";
import { figureIntegralesDefiniesSvg } from "../../ui6e/figureIntegralesDefinies";
import { decimalLatex } from "../../ui6e/formatMonome";
import { borneL, cours, crochet, exact, lignesCrochet, lignesFin, moins, par, q, qAdd, qDepuis, qL, qMul, qNeg, qP, qSub, qVal, substituer } from "../../ui6e/corrigeIntegrales1";
import type { Q } from "../../ui6e/corrigeIntegrales1";
import { etapesPhasePrimitive } from "../calculPrimitives/corrigeDetaille";
import { valeurExacteIntegraleDefinie, valeurExacteMoyenne } from "../../moteur6e/verificationIntegralesDefinies";
import type { ValeurExacte } from "../../moteur6e/valeurExacteIntegrale";

/**
 * Corrigé détaillé « comme au tableau » de `6gen25` (intégrales définies, paramètre, valeur
 * moyenne) — règle `.claude/rules/feuilles-evaluations.md`. Écrans empruntés à 6gen23 :
 * `etapesPhasePrimitive` ; écrans propres : [F(x)]ₐᵇ puis F(b) − F(a) valeurs substituées, valeur
 * moyenne, équation en m (écrite avec la primitive) et sa résolution (second degré, logarithme,
 * arcsin / arccos). Figure de l'aire signée sur la dernière étape. Partagé par l'adaptateur papier
 * et `App6gen25.tsx`.
 */

const LETTRES = "abcdefghij";
const t = (s: string): FragmentConsigne => texte(s);
const f = (s: string): FragmentConsigne => latex(s);
const C3 = cours(3);

export function piegeIntegralesDefinies(e: ExerciceIntegralesDefinies, phase: PhaseIntegralesDefinies): string | null {
  if (phase === "finalIntegrale") return "Soustraire dans le mauvais ordre : c'est F(borne supérieure) − F(borne inférieure).";
  if (phase === "valeurMoyenne") return "Confondre l'intégrale et la valeur moyenne : il faut encore diviser par la longueur b − a de l'intervalle.";
  if (phase === "resoudreM" && e.scenario === "parametre") {
    if (e.technique === "polynomiale") return "Oublier une des deux solutions de l'équation du second degré, ou ne pas vérifier qu'elle convient.";
    if (e.technique === "exponentielle") return "Appliquer ln avant d'avoir isolé l'exponentielle, ou à un nombre négatif.";
    return "Garder une solution hors de l'intervalle imposé pour m.";
  }
  return null;
}

/** Chaîne F(b) − F(a) : quand l'intégrale est irrationnelle (forme exacte exigée, décision du
 * 24/11/2026), la valeur exacte RÉDUITE (`moteur6e/valeurExacteIntegrale.ts`) est écrite avant la
 * valeur approchée si la chaîne ne l'a pas déjà (la reconnaissance numérique ne voyait ni arctan(3) ni
 * ln(7) : la chaîne finissait par « ≈ » juste après la substitution). */
function avecValeurExacte(lignes: LigneCalcul[], exacte: ValeurExacte | null): LigneCalcul[] {
  if (!exacte || exacte.rationnel) return lignes;
  const iApprox = lignes.findIndex((l) => l.latex.startsWith("\\approx"));
  if (iApprox < 0) return lignes;
  const normal = (s: string) => s.replace(/\\dfrac/g, "\\frac").replace(/\s+/g, "").replace(/^=/, "");
  if (iApprox > 0 && normal(lignes[iApprox - 1].latex) === normal(exacte.latex)) return lignes;
  const approx = { ...lignes[iApprox], justification: "valeur approchée" };
  return [...lignes.slice(0, iApprox), ligne(`=${exacte.latex}`, "on réduit"), approx, ...lignes.slice(iApprox + 1)];
}

function reponse(e: ExerciceIntegralesDefinies, phase: PhaseIntegralesDefinies): FragmentConsigne[] {
  return [f(formatReponseAttenduePhaseLatex(e, phase).join(",\\quad "))];
}

/** Équation en m écrite avec la primitive (membre de gauche simplifié, F(borne fixe) calculé). */
function equationM(e: ExerciceIntegraleParametre): { lignes: LigneCalcul[]; equation: string; gauche: string } {
  const P = primitiveLatex(e.primitive);
  const fix = e.borneFixeLatex;
  const [lo, up] = e.mEstBorneSuperieure ? [fix, "m"] : ["m", fix];
  const subUp = substituer(P, up);
  const subLo = substituer(P, lo);
  const Pm = substituer(P, "m");
  const Pfix = substituer(P, fix);
  const Ff = e.primitive.primitiveReference(e.borneFixe);
  const FfL = exact(Ff) ?? Pfix;
  const gauche = e.mEstBorneSuperieure ? moins(Pm, FfL) : moins(FfL, Pm);
  const lignes: LigneCalcul[] = [ligne(`\\int_{${lo}}^{${up}} f(x)\\,dx=${crochet(P, lo, up)}`, "théorème fondamental"), ligne(`=${moins(subUp, subLo)}`, "F(borne supérieure) − F(borne inférieure)")];
  if (gauche !== moins(subUp, subLo)) lignes.push(ligne(`=${gauche}`, [t("on calcule "), f(`F(${fix})`)]));
  const equation = `${gauche}=${e.cible.latex}`;
  return { lignes, equation, gauche };
}

/** Polynôme a·m² + b·m + c (coefficients rationnels) en LaTeX. */
function trinome(a: Q, b: Q, c: Q): string {
  const termes: string[] = [];
  const mono = (k: Q, corps: string) => {
    if (k.n === 0) return;
    const neg = k.n < 0;
    const abs = neg ? qNeg(k) : k;
    const mag = corps && abs.n === 1 && abs.d === 1 ? corps : `${qL(abs)}${corps}`;
    termes.push(termes.length === 0 ? (neg ? `-${mag}` : mag) : neg ? `-${mag}` : `+${mag}`);
  };
  mono(a, "m^{2}");
  mono(b, "m");
  mono(c, "");
  return termes.join("") || "0";
}

function lignesResoudre(e: ExerciceIntegraleParametre): { utilise: FragmentConsigne[]; lignes: LigneCalcul[] } {
  const { equation } = equationM(e);
  const debut = ligne(equation, "équation de l'étape précédente");
  const cible = qDepuis(e.cible.numerique);
  if (e.technique === "polynomiale" && e.primitive.famille === "A" && e.primitive.sousType === "direct" && cible) {
    const k = e.primitive.termes.find((x) => x.type === "puissance")?.coef ?? 0;
    const c = e.primitive.termes.find((x) => x.type === "constante")?.coef ?? 0;
    const Ff = qDepuis(e.primitive.primitiveReference(e.borneFixe)) ?? q(0);
    // haut : k m²/2 + c m − F(fix) = cible ; bas : F(fix) − (k m²/2 + c m) = cible.
    const a = q(k, 2);
    const b = q(c);
    const c0 = e.mEstBorneSuperieure ? qSub(qNeg(Ff), cible) : qSub(cible, Ff);
    const lignes: LigneCalcul[] = [debut, ligne(`${trinome(a, b, c0)}=0`, "on regroupe tout dans le membre de gauche")];
    const A2 = qMul(a, q(2));
    const B2 = qMul(b, q(2));
    const C2 = qMul(c0, q(2));
    const entiers = [A2, B2, C2].every((x) => x.d === 1);
    let [A, B, C] = [a, b, c0];
    if (a.d !== 1 && entiers) {
      lignes.push(ligne(`${trinome(A2, B2, C2)}=0`, "on multiplie par 2"));
      [A, B, C] = [A2, B2, C2];
    }
    const D = qSub(qMul(B, B), qMul(q(4), qMul(A, C)));
    lignes.push(ligne(`\\Delta=${B.n === 0 ? "" : `${qP(B)}^2`}-4\\cdot ${qP(A)}\\cdot ${qP(C)}`, "discriminant"));
    lignes.push(ligne(`=${qL(D)}`));
    const racine = Math.sqrt(qVal(D));
    const s = qDepuis(racine);
    const deuxA = qMul(q(2), A);
    if (s && s.n === 0) {
      lignes.push(ligne(`m=\\dfrac{${qL(qNeg(B))}}{${qL(deuxA)}}`, "Δ = 0 : une seule solution"), ...lignesFin(e.solutionsM[0], null));
    } else if (s) {
      lignes.push(ligne(`\\sqrt{\\Delta}=${qL(s)}`));
      const r1 = qMul(qAdd(qNeg(B), s), q(1, 1));
      const r2 = qSub(qNeg(B), s);
      const sols = [
        { num: r1, val: qVal(r1) / qVal(deuxA), signe: "+" },
        { num: r2, val: qVal(r2) / qVal(deuxA), signe: "-" },
      ];
      // ordre de l'écran (solutionsM)
      sols.sort((x, y) => Math.abs(x.val - e.solutionsM[0]) - Math.abs(y.val - e.solutionsM[0]));
      sols.forEach((so, i) => {
        lignes.push(ligne(`m_{${i + 1}}=\\dfrac{${qL(qNeg(B))}${so.signe}${qL(s)}}{${qL(deuxA)}}`, i === 0 ? [f("m=\\dfrac{-b\\pm\\sqrt{\\Delta}}{2a}")] : undefined));
        lignes.push(...lignesFin(so.val, null));
      });
    }
    return { utilise: [t(`On ramène l'équation à une équation du second degré en m, puis on la résout ${C3} : `), f("am^{2}+bm+c=0,\\quad m=\\dfrac{-b\\pm\\sqrt{\\Delta}}{2a}")], lignes };
  }
  if (e.technique === "exponentielle" && e.primitive.famille === "B") {
    const k = e.primitive.k;
    const fix = e.borneFixe;
    const E = fix === 0 ? "1" : fix === 1 ? "e" : `e^{${fix}}`;
    const kE = fix === 0 ? `${k}` : `${k === 1 ? "" : k === -1 ? "-" : k}${E}`;
    const kEm = `${k === 1 ? "" : k === -1 ? "-" : k}e^{m}`;
    const cibleL = e.cible.latex;
    const droite = e.mEstBorneSuperieure ? `${cibleL}${kE.startsWith("-") ? "" : "+"}${kE}` : moins(kE, cibleL);
    const sol = e.solutionsMLatex?.[0] ?? decimalLatex(e.m, 2);
    const interieur = sol.replace(/^\\ln\\left\((.*)\\right\)$/, "$1").replace(/^\\ln\((.*)\)$/, "$1");
    const lignes: LigneCalcul[] = [debut, ligne(`${kEm}=${droite}`, [t("on isole le terme en "), f("e^{m}")])];
    if (k !== 1) lignes.push(ligne(`e^{m}=${interieur}`, `on divise par ${k < 0 ? "−" : ""}${Math.abs(k)}`));
    else if (interieur !== droite) lignes.push(ligne(`e^{m}=${interieur}`, "on réduit"));
    lignes.push(ligne(`m=${sol}`, [t("on applique ln (le second membre est positif) : "), f("e^{m}=A\\iff m=\\ln(A)")]));
    lignes.push(...lignesFin(e.m, sol));
    return { utilise: [t(`On isole l'exponentielle, puis on applique le logarithme népérien ${C3} : `), f("e^{m}=A\\iff m=\\ln(A)\\quad(A>0)")], lignes };
  }
  // trigonométrique
  const cosU = e.primitive.famille === "B" && e.primitive.typeG === "cosU";
  const fn = cosU ? "\\sin" : "\\cos";
  const arc = cosU ? "\\arcsin" : "\\arccos";
  const valFix = cosU ? Math.sin(e.borneFixe) : Math.cos(e.borneFixe);
  const valFixL = exact(valFix) ?? decimalLatex(valFix, 3);
  const v = cosU ? Math.sin(e.m) : Math.cos(e.m);
  const vL = exact(v) ?? decimalLatex(v, 3);
  const cibleL = e.cible.latex;
  // cosU (F = sin) : haut sin m − sin f = c → sin m = c + sin f ; bas sin f − sin m = c → sin m = sin f − c.
  // sinU (F = −cos) : haut −cos m + cos f = c → cos m = cos f − c ; bas −cos f + cos m = c → cos m = c + cos f.
  const somme = (cosU ? e.mEstBorneSuperieure : !e.mEstBorneSuperieure) ? `${cibleL}+${par(valFixL)}` : moins(valFixL, cibleL);
  const mL = e.solutionsMLatex?.[0] ?? decimalLatex(e.m, 2);
  const lignes: LigneCalcul[] = [debut, ligne(`${fn}(m)=${somme}`, [t("on isole "), f(`${fn}(m)`), t(", avec "), f(`${fn}\\left(${e.borneFixeLatex}\\right)=${valFixL}`)])];
  if (vL !== somme) lignes.push(ligne(`=${vL}`, "on calcule"));
  lignes.push(ligne(`m=${arc}\\left(${vL}\\right)`, [t("m dans "), f(cosU ? "\\left[-\\frac{\\pi}{2}\\,;\\frac{\\pi}{2}\\right]" : "\\left[0\\,;\\pi\\right]"), t(" : branche principale")]));
  lignes.push(ligne(`=${mL}`, "valeur remarquable"));
  return { utilise: [t(`On isole ${cosU ? "le sinus" : "le cosinus"} de m, puis on revient à m dans l'intervalle imposé ${C3} : `), f(cosU ? "\\sin(m)=v\\iff m=\\arcsin(v)" : "\\cos(m)=v\\iff m=\\arccos(v)")], lignes };
}

function etapesPropres(e: ExerciceIntegralesDefinies, phase: PhaseIntegralesDefinies, sq: string): EtapeCorrection[] {
  const etapes: EtapeCorrection[] = [];
  const avecFigure = (e.scenario === "simple" && phase === "finalIntegrale") || (e.scenario === "moyenne" && phase === "valeurMoyenne") || (e.scenario === "parametre" && phase === "resoudreM");
  if (phase === "finalIntegrale" && e.scenario !== "parametre") {
    const P = primitiveLatex(e.primitive);
    const aL = borneL(e.a);
    const bL = borneL(e.b);
    const Fa = e.primitive.primitiveReference(e.a);
    const Fb = e.primitive.primitiveReference(e.b);
    etapes.push(
      utilise(sq, [t(`Théorème fondamental ${C3} : `), f("\\int_a^b f(x)\\,dx=F(b)-F(a)"), t(", avec la primitive trouvée (la constante disparaît dans la différence).")]),
      calcul(sq, avecValeurExacte([ligne(`\\int_{${aL}}^{${bL}} f(x)\\,dx=${crochet(P, aL, bL)}`, "primitive de l'étape précédente"), ...lignesCrochet({ F: P, aL, bL, Fa, Fb, gauche: "" })], valeurExacteIntegraleDefinie(e))),
    );
  } else if (phase === "valeurMoyenne" && e.scenario === "moyenne") {
    const aL = borneL(e.a);
    const bL = borneL(e.b);
    const I = e.primitive.primitiveReference(e.b) - e.primitive.primitiveReference(e.a);
    const IL = exact(I);
    const L = borneL(e.b - e.a);
    const moyenne = I / (e.b - e.a);
    const lignes: LigneCalcul[] = [ligne(`\\mu=\\dfrac{1}{${bL}-${par(aL)}}\\int_{${aL}}^{${bL}} f(x)\\,dx`, "définition de la valeur moyenne")];
    // Intégrale irrationnelle : sa valeur exacte symbolique (forme exacte exigée), sinon la reconnaissance d'avant.
    const exacteI = valeurExacteIntegraleDefinie(e);
    const IExact = exacteI && !exacteI.rationnel ? exacteI.latex : IL;
    if (IExact !== null) lignes.push(ligne(`=\\dfrac{1}{${L}}\\cdot ${par(IExact)}`, "intégrale de l'étape précédente"));
    const exacteM = valeurExacteMoyenne(e);
    if (exacteM && !exacteM.rationnel) {
      lignes.push(ligne(`=${exacteM.latex}`, "on divise"), ligne(`\\approx ${decimalLatex(moyenne, 2)}`, "valeur approchée"));
    } else lignes.push(...lignesFin(moyenne, null, "on divise"));
    etapes.push(utilise(sq, [t(`Valeur moyenne de f sur [a ; b] ${C3} : `), f("\\mu=\\dfrac{1}{b-a}\\int_a^b f(x)\\,dx")]), calcul(sq, lignes));
  } else if (phase === "poserEquationM" && e.scenario === "parametre") {
    const { lignes, equation } = equationM(e);
    etapes.push(
      utilise(sq, [t(`On écrit l'intégrale avec la primitive ${C3}, dans le bon ordre (borne supérieure moins borne inférieure), puis on l'égale à la valeur donnée.`)]),
      calcul(sq, [...lignes, ligne(equation, "on égale à la valeur donnée")]),
    );
  } else if (phase === "resoudreM" && e.scenario === "parametre") {
    const r = lignesResoudre(e);
    etapes.push(utilise(sq, r.utilise), calcul(sq, r.lignes));
  }
  etapes.push({ ...resultat(sq, reponse(e, phase)), ...(avecFigure ? { figureHtml: figureIntegralesDefiniesSvg(e) } : {}) });
  const pg = piegeIntegralesDefinies(e, phase);
  if (pg) etapes.push(piege(sq, [t(pg)]));
  return etapes;
}

export function correctionDetailleeIntegralesDefinies(e: ExerciceIntegralesDefinies): EtapeCorrection[] {
  const phases = phasesPourExercice(e);
  const base = phasesPrimitive(e.primitive);
  return phases.flatMap((phase, i) =>
    base.includes(phase as PhaseCalculPrimitives)
      ? etapesPhasePrimitive(e.primitive, phase as PhaseCalculPrimitives, LETTRES[i], { derniere: i === base.length - 1, avecPiege: true })
      : etapesPropres(e, phase, LETTRES[i]),
  );
}
