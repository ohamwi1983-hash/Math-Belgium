import type { ExerciceAireA, ExerciceAireB, ExerciceAireC, ExerciceAireD, ExerciceCalculAires } from "../../core6e/calculAires.types";
import type { EtapeCorrection, FragmentConsigne, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import { phasesPourExercice } from "../../moteur6e/typesCalculAires";
import type { PhaseCalculAires } from "../../moteur6e/typesCalculAires";
import { aireExacteALatex, cibleExacteLatex, formatReponseAttenduePhaseLatex, polynomeLatex } from "../../ui6e/formatCalculAires";
import { figureCalculAiresSvg } from "../../ui6e/figureCalculAires";
import { decimalLatex } from "../../ui6e/formatMonome";
import { racineSimplifiee } from "../../ui6e/nombresExactsIntegrales";
import {
  argQ,
  cours,
  entoure,
  crochet,
  lignesIntegralePoly,
  lignesTrinome,
  lignesValeurPoly,
  moins,
  polyDepuisNombres,
  polyL,
  polyEval,
  polyNeg,
  polySubstitue,
  polySub,
  q,
  qAdd,
  qDiv,
  qL,
  substituer,
} from "../../ui6e/corrigeIntegrales1";
import type { Poly, Q } from "../../ui6e/corrigeIntegrales1";
import { coefficients, dominant, factoriseLatex } from "./papierCommun";

/**
 * Corrigé détaillé « comme au tableau » de `6gen26` (calcul d'aires) — règle
 * `.claude/rules/feuilles-evaluations.md`. Signe : le raisonnement fait au tableau (signe de chaque
 * facteur, valeur test entre deux racines) ; racines : discriminant (degré 2) ou racines évidentes
 * vérifiées puis forme factorisée (degré 3) ; aire : ±∫, [F]ₐᵇ, F(b) − F(a) valeurs substituées,
 * calcul exact. Figure du domaine sur la dernière étape. Partagé par l'adaptateur et `App6gen26.tsx`.
 */

const LETTRES = "abcdefgh";
const t = (s: string): FragmentConsigne => texte(s);
const f = (s: string): FragmentConsigne => latex(s);
const C4 = cours(4);

interface Contenu {
  utilise: FragmentConsigne[];
  calcul: LigneCalcul[];
  verification?: EtapeCorrection;
  piege?: string;
  /** Résultat propre au corrigé quand la réponse de l'écran ne se lit pas seule (signe : chaque
   * inégalité suivie de son intervalle). Sinon : la réponse de l'écran. */
  resultat?: FragmentConsigne[];
}

const poly = (termes: ExerciceAireB["termes"]): Poly => polyDepuisNombres(coefficients(termes));
const signeL = (positif: boolean) => (positif ? "f(x)\\geq 0" : "f(x)\\leq 0");

/** Valeur test au milieu d'un intervalle : f(m) substitué, puis sa valeur. */
function lignesTest(p: Poly, a: number, b: number, nom = "f"): LigneCalcul[] {
  const m = qDiv(qAdd(q(a), q(b)), q(2));
  return lignesValeurPoly(p, m, nom, [t("valeur test entre "), f(`${a}`), t(" et "), f(`${b}`)]);
}

/** Racines d'un polynôme : discriminant (degré 2) ou racines évidentes + forme factorisée (degré 3). */
function lignesRacines(p: Poly, racines: { r: number; m?: number }[], termes: ExerciceAireB["termes"]): LigneCalcul[] {
  const degre = Math.max(...[...p.keys()]);
  if (degre === 2) return [ligne(`${polyL(p)}=0`, "les bornes sont les racines de f"), ...lignesTrinome(p).lignes];
  const distinctes = [...new Set(racines.map((x) => x.r))];
  const lignes: LigneCalcul[] = [];
  for (const r of distinctes) lignes.push(...lignesValeurPoly(p, q(r), "f", [t("on teste "), f(`x=${r}`)]));
  const dom = dominant(coefficients(termes));
  lignes.push(ligne(`f(x)=${factoriseLatex(dom, racines)}`, [t("forme factorisée (coefficient dominant "), f(`${dom}`), t(")")]));
  return lignes;
}

function primitiveTermeA(e: ExerciceAireA): string {
  const c = e.terme.coef;
  const coef = c === 1 ? "" : c === -1 ? "-" : `${c}`;
  if (e.terme.type === "expX") return `${coef}e^{x}`;
  if (e.terme.type === "invX") return `${coef}\\ln|x|`;
  return `${coef}\\sin(x)`;
}

function contenuA(e: ExerciceAireA, phase: PhaseCalculAires): Contenu {
  const c = e.terme.coef;
  const pos = e.signe === "positif";
  const sc = c > 0 ? ">" : "<";
  const sf = pos ? ">" : "<";
  if (phase === "aEcran1") {
    if (e.terme.type === "expX") {
      return {
        utilise: [t(`Une exponentielle est toujours strictement positive : f a le signe de son coefficient ${C4}.`)],
        calcul: [ligne("e^{x}>0", "pour tout réel x"), ligne(`${c}${sc}0`, "coefficient de f"), ligne(`f(x)=${polynomeLatex([e.terme])}${sf}0`, "produit de deux facteurs de signes connus")],
      };
    }
    if (e.terme.type === "invX") {
      const sx = e.a > 0 ? ">" : "<";
      return {
        utilise: [t(`Sur l'intervalle, x garde un seul signe (0 n'en fait pas partie) : f a le signe du quotient du coefficient par x ${C4}.`)],
        calcul: [ligne(`x${sx}0`, [t("pour "), f(`x\\in[${e.a};${e.b}]`)]), ligne(`${c}${sc}0`, "numérateur"), ligne(`f(x)=\\dfrac{${c}}{x}${sf}0`, "règle des signes d'un quotient")],
      };
    }
    return {
      utilise: [t("Sur "), f(`[${e.a};${e.b}]`), t(", on reste entre "), f("-\\frac{\\pi}{2}"), t(" et "), f("\\frac{\\pi}{2}"), t(`, où le cosinus est positif : f a le signe de son coefficient ${C4}.`)],
      calcul: [ligne(`-\\dfrac{\\pi}{2}<${e.a}\\leq x\\leq ${e.b}<\\dfrac{\\pi}{2}`, "car π/2 ≈ 1,57"), ligne("\\cos(x)>0", "sur cet intervalle"), ligne(`${c}${sc}0`, "coefficient de f"), ligne(`f(x)=${polynomeLatex([e.terme])}${sf}0`, "produit de deux facteurs de signes connus")],
    };
  }
  const F = primitiveTermeA(e);
  const s = pos ? "" : "-";
  const env = (x: string) => (pos ? x : `-${entoure(x)}`);
  const subB = substituer(F, `${e.b}`);
  const subA = substituer(F, `${e.a}`);
  const aire = Math.abs(e.primitiveReference(e.b) - e.primitiveReference(e.a));
  const exacte = aireExacteALatex(e);
  const jPrim = e.terme.type === "expX" ? [t("primitive de "), f("e^{x}"), t(" : "), f("e^{x}")] : e.terme.type === "invX" ? [t("primitive de "), f("\\dfrac{1}{x}"), t(" : "), f("\\ln|x|")] : [t("primitive de "), f("\\cos(x)"), t(" : "), f("\\sin(x)")];
  const lignes: LigneCalcul[] = [
    ligne(`\\text{Aire}=${s}\\int_{${e.a}}^{${e.b}} f(x)\\,dx`, pos ? "f ≥ 0 sur l'intervalle" : "f ≤ 0 : l'aire est l'opposé de l'intégrale"),
    ligne(`=${s}${crochet(F, `${e.a}`, `${e.b}`)}`, jPrim),
    ligne(`=${env(moins(subB, subA))}`, "F(b) − F(a)"),
  ];
  lignes.push(ligne(`=${exacte}`, e.terme.type === "invX" ? [t("car "), f("\\ln|a|-\\ln|b|=\\ln\\left|\\dfrac{a}{b}\\right|")] : e.terme.type === "cosX" ? [t("car "), f("\\sin(-x)=-\\sin(x)")] : "on factorise"));
  lignes.push(ligne(`\\approx ${decimalLatex(aire, 2)}`, "valeur approchée"));
  return {
    utilise: pos ? [t("Comme "), f("f\\geq 0"), t(`, l'aire est l'intégrale de f sur l'intervalle ${C4}.`)] : [t("Comme "), f("f\\leq 0"), t(`, l'aire est l'opposé de l'intégrale de f : une aire est toujours positive ${C4}.`)],
    calcul: lignes,
    piege: pos ? undefined : "Donner l'intégrale (négative) au lieu de son opposé : une aire n'est jamais négative.",
  };
}

function racinesB(e: ExerciceAireB): { r: number; m?: number }[] {
  if (e.type === "parabole") return [{ r: e.r1 }, { r: e.r2 }];
  // racine double : là où la dérivée s'annule aussi
  let d = 0;
  for (const [n, c] of coefficients(e.termes)) if (n > 0) d += n * c * e.r1 ** (n - 1);
  return Math.abs(d) < 1e-9 ? [{ r: e.r1, m: 2 }, { r: e.r2 }] : [{ r: e.r1 }, { r: e.r2, m: 2 }];
}

function contenuB(e: ExerciceAireB, phase: PhaseCalculAires): Contenu {
  const p = poly(e.termes);
  const pos = e.signe === "positif";
  if (phase === "bEcran1") {
    return { utilise: [t("Sans bornes données, la région est limitée par les points où la courbe coupe l'axe des abscisses : on résout "), f("f(x)=0"), t(` ${C4}.`)], calcul: lignesRacines(p, racinesB(e), e.termes) };
  }
  if (phase === "bEcran2") {
    return { utilise: [t(`Entre deux racines consécutives, f garde un signe constant : on teste une valeur de l'intervalle ${C4}.`)], calcul: [...lignesTest(p, e.r1, e.r2), ligne(`${signeL(pos)}`, [t("sur "), f(`[${e.r1};${e.r2}]`)])], resultat: [f(`${signeL(pos)}\\text{ sur }[${e.r1};${e.r2}]`)] };
  }
  const { lignes } = lignesIntegralePoly({ gauche: "\\text{Aire}", integrande: "f(x)", p, a: q(e.r1), b: q(e.r2), facteur: pos ? "" : "-" });
  return {
    utilise: pos ? [t("Comme "), f("f\\geq 0"), t(` entre les racines, l'aire est l'intégrale de f de r₁ à r₂ ${C4}.`)] : [t("Comme "), f("f\\leq 0"), t(` entre les racines, l'aire est l'opposé de l'intégrale ${C4}.`)],
    calcul: lignes,
    piege: pos ? undefined : "Oublier le signe moins : sous l'axe, l'intégrale est négative mais l'aire est positive.",
  };
}

function contenuC(e: ExerciceAireC, phase: PhaseCalculAires): Contenu {
  const p = poly(e.termes);
  if (phase === "cEcran1") {
    return { utilise: [t("On résout "), f("f(x)=0"), t(` : on cherche les racines évidentes parmi les petits entiers, puis on écrit la forme factorisée ${C4}.`)], calcul: lignesRacines(p, [{ r: e.r1 }, { r: e.r2 }, { r: e.r3 }], e.termes) };
  }
  if (phase === "cEcran2") {
    return {
      utilise: [t(`f change de signe à chaque racine simple : on teste une valeur dans chaque sous-intervalle ${C4}.`)],
      calcul: [...lignesTest(p, e.r1, e.r2), ligne(signeL(e.signeGauche === "positif"), [t("sur "), f(`]${e.r1};${e.r2}[`)]), ...lignesTest(p, e.r2, e.r3), ligne(signeL(e.signeDroit === "positif"), [t("sur "), f(`]${e.r2};${e.r3}[`)])],
      resultat: [f(`${signeL(e.signeGauche === "positif")}\\text{ sur }]${e.r1};${e.r2}[,\\quad ${signeL(e.signeDroit === "positif")}\\text{ sur }]${e.r2};${e.r3}[`)],
    };
  }
  const i1 = lignesIntegralePoly({ gauche: "I_1", integrande: "f(x)", p, a: q(e.r1), b: q(e.r2) });
  const i2 = lignesIntegralePoly({ gauche: "I_2", integrande: "f(x)", p, a: q(e.r2), b: q(e.r3) });
  if (phase === "cEcran3") {
    return { utilise: [t(`On intègre séparément sur chaque sous-intervalle, avec la même primitive ${C4}.`)], calcul: [...i1.lignes, ...i2.lignes] };
  }
  const a1 = i1.valeur;
  const a2 = i2.valeur;
  const abs = (x: Q) => (x.n < 0 ? q(-x.n, x.d) : x);
  const total = qAdd(abs(a1), abs(a2));
  const lignes: LigneCalcul[] = [ligne("\\text{Aire}=|I_1|+|I_2|", "chaque morceau compte positivement"), ligne(`=\\left|${qL(a1)}\\right|+\\left|${qL(a2)}\\right|`, "intégrales de l'étape précédente"), ligne(`=${qL(abs(a1))}+${qL(abs(a2))}`), ligne(`=${qL(total)}`)];
  if (Math.abs(qValR(total) * 100 - Math.round(qValR(total) * 100)) > 1e-9) lignes.push(ligne(`\\approx ${decimalLatex(qValR(total), 2)}`, "valeur approchée"));
  return {
    utilise: [t("Une aire est toujours positive : chaque morceau compte pour sa valeur absolue, "), f("\\text{Aire}=|I_1|+|I_2|"), t(` ${C4}.`)],
    calcul: lignes,
    piege: "Calculer une seule intégrale de r₁ à r₃ : les parties positive et négative se compensent.",
  };
}

const qValR = (x: Q) => x.n / x.d;

function contenuD(e: ExerciceAireD, phase: PhaseCalculAires): Contenu {
  if (e.sousType === "parametre") {
    const droite = e.motif === "droiteParOrigine";
    const m = e.m;
    if (phase === "dEcran2") {
      return droite
        ? {
            utilise: [t(`Le signe de f − g indique quelle courbe est au-dessus ${C4}.`)],
            calcul: [ligne("f(x)-g(x)=x^2-mx", "on soustrait"), ligne("=x(x-m)", "mise en évidence de x"), ligne("x(x-m)\\leq 0", [t("pour "), f("0\\leq x\\leq m"), t(" : "), f("x\\geq 0"), t(" et "), f("x-m\\leq 0")])],
          }
        : {
            utilise: [t(`Le signe de g − f indique quelle courbe est au-dessus ${C4}.`)],
            calcul: [ligne("g(x)-f(x)=m-x^2", "on soustrait"), ligne("m-x^2\\geq 0", [t("pour "), f("-\\sqrt{m}\\leq x\\leq\\sqrt{m}"), t(", car "), f("x^2\\leq m")])],
          };
    }
    if (phase === "dEcran3") {
      return droite
        ? {
            utilise: [t(`Aire = intégrale de (courbe du dessus − courbe du dessous) sur l'intervalle ${C4}.`)],
            calcul: [
              ligne("\\text{Aire}(m)=\\int_0^m \\left(mx-x^2\\right)dx", "la droite est au-dessus"),
              ligne(`=${crochet("\\dfrac{mx^2}{2}-\\dfrac{x^3}{3}", "0", "m")}`, "primitive terme à terme (m est une constante)"),
              ligne("=\\dfrac{m\\cdot m^2}{2}-\\dfrac{m^3}{3}-0", "F(m) − F(0)"),
              ligne("=\\dfrac{3m^3}{6}-\\dfrac{2m^3}{6}", "même dénominateur"),
              ligne("=\\dfrac{m^3}{6}"),
            ],
          }
        : {
            utilise: [t(`Aire = intégrale de (courbe du dessus − courbe du dessous) sur l'intervalle ${C4}.`)],
            calcul: [
              ligne("\\text{Aire}(m)=\\int_{-\\sqrt{m}}^{\\sqrt{m}} \\left(m-x^2\\right)dx", "la droite est au-dessus"),
              ligne(`=${crochet("mx-\\dfrac{x^3}{3}", "-\\sqrt{m}", "\\sqrt{m}")}`, "primitive terme à terme (m est une constante)"),
              ligne("=\\left(m\\sqrt{m}-\\dfrac{m\\sqrt{m}}{3}\\right)-\\left(-m\\sqrt{m}+\\dfrac{m\\sqrt{m}}{3}\\right)", [t("F(b) − F(a), avec "), f("(\\sqrt{m})^3=m\\sqrt{m}")]),
              ligne("=2m\\sqrt{m}-\\dfrac{2m\\sqrt{m}}{3}", "on réduit"),
              ligne("=\\dfrac{4}{3}m\\sqrt{m}"),
            ],
          };
    }
    const cible = cibleExacteLatex(e);
    if (droite) {
      return {
        utilise: [t(`On égale l'aire en fonction de m à l'aire visée, puis on résout pour m > 0 ${C4}.`)],
        calcul: [ligne(`\\dfrac{m^3}{6}=${cible}`, "aire visée"), ligne(`m^3=${m ** 3}`, "on multiplie par 6"), ligne(`m=\\sqrt[3]{${m ** 3}}`, "racine cubique"), ligne(`=${m}`)],
        verification: verification("d", [t("On remplace m par "), f(`${m}`), t(" : "), f(`\\dfrac{${m}^3}{6}=${cible}`), t(" ✓")]),
      };
    }
    const { coef, radicande } = racineSimplifiee(m);
    const mRacineM = radicande === 1 ? `${m * coef}` : `${m * coef}\\sqrt{${radicande}}`;
    return {
      utilise: [t(`On égale l'aire en fonction de m à l'aire visée, puis on résout pour m > 0 ${C4} ; on élève au carré : `), f("(m\\sqrt{m})^2=m^3"), t(".")],
      calcul: [ligne(`\\dfrac{4}{3}m\\sqrt{m}=${cible}`, "aire visée"), ligne(`m\\sqrt{m}=${mRacineM}`, [t("on multiplie par "), f("\\frac{3}{4}")]), ligne(`m^3=${m ** 3}`, "on élève au carré"), ligne(`m=\\sqrt[3]{${m ** 3}}`, "racine cubique"), ligne(`=${m}`)],
    };
  }
  const h = polySub(poly(e.termesF), poly(e.termesG));
  const fSurG = e.ordre === "fSurG";
  const dd = fSurG ? "f(x)-g(x)" : "g(x)-f(x)";
  if (phase === "dEcran1") {
    const tri = lignesTrinome(h);
    return {
      utilise: [t("Les bornes sont les abscisses des points d'intersection : on résout "), f("f(x)=g(x)"), t(", c'est-à-dire "), f("f(x)-g(x)=0"), t(` ${C4}.`)],
      calcul: [ligne(`f(x)-g(x)=${polyL(h)}`, "on soustrait et on réduit"), ...tri.lignes],
    };
  }
  if (phase === "dEcran2") {
    const m = qDiv(qAdd(q(e.r1), q(e.r2)), q(2));
    const sub = polySubstitue(h, m);
    const lignes = [ligne(`f(x)-g(x)=${polyL(h)}`, "on soustrait et on réduit"), ligne(`f${argQ(m)}-g${argQ(m)}=${sub}`, [t("valeur test entre "), f(`${e.r1}`), t(" et "), f(`${e.r2}`)]), ligne(`=${qL(polyEval(h, m))}`)];
    return { utilise: [t(`Le signe de f − g en un point de l'intervalle indique quelle courbe est au-dessus ${C4}.`)], calcul: [...lignes, ligne(fSurG ? "f(x)\\geq g(x)" : "g(x)\\geq f(x)", [t("sur "), f(`[${e.r1};${e.r2}]`)])] };
  }
  const integrande = fSurG ? h : polyNeg(h);
  const { lignes } = lignesIntegralePoly({ gauche: "", integrande: `\\left(${polyL(integrande)}\\right)`, p: integrande, a: q(e.r1), b: q(e.r2) });
  return {
    utilise: [t("Aire = intégrale de (courbe du dessus − courbe du dessous) : "), f(dd), t(` ${C4}.`)],
    calcul: [ligne(`\\text{Aire}=\\int_{${e.r1}}^{${e.r2}} \\left(${dd}\\right)dx`, "courbe du dessus moins courbe du dessous"), ...lignes],
    piege: "Intégrer f − g sans savoir quelle courbe est au-dessus : le résultat peut être négatif.",
  };
}

function contenu(e: ExerciceCalculAires, phase: PhaseCalculAires): Contenu {
  switch (e.famille) {
    case "A":
      return contenuA(e, phase);
    case "B":
      return contenuB(e, phase);
    case "C":
      return contenuC(e, phase);
    case "D":
      return contenuD(e, phase);
  }
}

export function piegeCalculAires(e: ExerciceCalculAires, phase: PhaseCalculAires): string | undefined {
  return contenu(e, phase).piege;
}

export function correctionDetailleeCalculAires(e: ExerciceCalculAires): EtapeCorrection[] {
  const phases = phasesPourExercice(e);
  return phases.flatMap((phase, i) => {
    const sq = LETTRES[i];
    const c = contenu(e, phase);
    const etapes: EtapeCorrection[] = [utilise(sq, c.utilise), calcul(sq, c.calcul)];
    const derniere = i === phases.length - 1;
    etapes.push({ ...resultat(sq, c.resultat ?? [f(formatReponseAttenduePhaseLatex(e, phase).join(",\\quad "))]), ...(derniere ? { figureHtml: figureCalculAiresSvg(e) } : {}) });
    if (c.verification) etapes.push({ ...c.verification, sousQuestion: sq });
    if (c.piege) etapes.push(piege(sq, [t(c.piege)]));
    return etapes;
  });
}
