import type { ExerciceVolumeA, ExerciceVolumeB, ExerciceVolumeC, ExerciceVolumeD, ExerciceVolumesRevolution, TermeDeveloppe } from "../../core6e/volumesRevolution.types";
import type { EtapeCorrection, FragmentConsigne, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise } from "../../../export/corrigeTableau";
import { phasesPourExercice } from "../../moteur6e/typesVolumesRevolution";
import type { PhaseVolumesRevolution } from "../../moteur6e/typesVolumesRevolution";
import { differenceCarresLatex, formatReponseAttenduePhaseLatex, kLatexD, nomsDessusDessous, sommePrimitiveVolumeLatex, sommeVolumeLatex, volumeExactALatex } from "../../ui6e/formatVolumesRevolution";
import { figureVolumesRevolutionSvg } from "../../ui6e/figureVolumesRevolution";
import { decimalLatex } from "../../ui6e/formatMonome";
import {
  argQ,
  cours,
  entoure,
  crochet,
  lignesCarrePoly,
  lignesIntegralePoly,
  lignesTrinome,
  moins,
  piL,
  polyDepuisNombres,
  polyEval,
  polyL,
  polyMul,
  polySub,
  polySubstitue,
  q,
  qAdd,
  qDiv,
  qL,
  qMul,
  qP,
  substituer,
} from "../../ui6e/corrigeIntegrales1";
import type { Poly } from "../../ui6e/corrigeIntegrales1";
import { coefficients } from "../calculAires/papierCommun";

/**
 * Corrigé détaillé « comme au tableau » de `6gen27` (volumes de révolution) — règle
 * `.claude/rules/feuilles-evaluations.md`. Carré développé par l'identité (a + b)², primitive terme
 * à terme, V = π[F]ₐᵇ avec F(b) − F(a) valeurs substituées ; rondelles (différence des carrés) ;
 * paraboloïde et cylindre englobant. Figure (région et solide) sur la dernière étape. Partagé par
 * l'adaptateur papier et `App6gen27.tsx`.
 */

const LETTRES = "abcdefgh";
const t = (s: string): FragmentConsigne => texte(s);
const f = (s: string): FragmentConsigne => latex(s);
const C5 = cours(5);

interface Contenu {
  utilise: FragmentConsigne[];
  calcul: LigneCalcul[];
  piege?: string;
}

const poly = (termes: ExerciceVolumeB["termes"]): Poly => polyDepuisNombres(coefficients(termes));

export function piegeDeveloppementVolume(e: ExerciceVolumeA | ExerciceVolumeB): string {
  if (e.famille === "A" && e.type === "trigonometrique") return "Écrire cos²(x) comme cos(x²) : c'est le carré du cosinus, pas le cosinus du carré.";
  return "Élever au carré terme à terme : (a + b)² n'est pas a² + b², il manque le double produit.";
}

function jTerme(terme: TermeDeveloppe): FragmentConsigne[] {
  switch (terme.type) {
    case "expRate2":
      return [t("primitive de "), f("e^{2x}"), t(" : "), f("\\dfrac{e^{2x}}{2}")];
    case "cosRate2":
      return [t("primitive de "), f("\\cos(2x)"), t(" : "), f("\\dfrac{\\sin(2x)}{2}")];
    case "expX":
      return [t("primitive de "), f("e^{x}"), t(" : "), f("e^{x}")];
    case "constante":
      return [t("primitive de "), f("k"), t(" : "), f("kx")];
    default:
      return [t("primitive de "), f("x^{n}"), t(" : "), f("\\dfrac{x^{n+1}}{n+1}")];
  }
}

/** Primitive terme à terme du carré développé. */
function lignesPrimitive(dev: TermeDeveloppe[], integrande: string): LigneCalcul[] {
  const lignes = dev.map((terme) => {
    const fx = sommeVolumeLatex([terme]);
    const corps = fx.startsWith("-") ? `\\left(${fx}\\right)` : `${fx}\\,`;
    return ligne(`\\int${fx.startsWith("-") ? "" : " "}${corps}dx=${sommePrimitiveVolumeLatex([terme])}`, jTerme(terme));
  });
  lignes.push(ligne(`\\int ${integrande}\\,dx=${sommePrimitiveVolumeLatex(dev)}+C`, "on additionne (linéarité)"));
  return lignes;
}

function utilisePrimitive(): FragmentConsigne[] {
  return [t(`On primitive terme à terme l'expression développée (linéarité) ${C5}.`)];
}

function contenuA(e: ExerciceVolumeA, phase: PhaseVolumesRevolution): Contenu {
  const fL = sommeVolumeLatex(e.termes);
  if (phase === "aEcran1") {
    const pg = piegeDeveloppementVolume(e);
    if (e.type === "polynomiale") return { utilise: [t(`On développe le carré avec l'identité (a + b)² ${C5} ; le signe de f n'intervient pas.`)], calcul: lignesCarrePoly(poly(e.termes), "[f(x)]^2"), piege: pg };
    if (e.type === "exponentielle") {
      const a = e.termes[0].coef;
      const b = e.termes[1].coef;
      const ae = `${a === 1 ? "" : a === -1 ? "-" : a}e^{x}`;
      return {
        utilise: [t(`On développe le carré avec l'identité (a + b)², puis `), f("\\left(e^{x}\\right)^2=e^{2x}"), t(` ${C5}.`)],
        calcul: [ligne(`[f(x)]^2=\\left(${fL}\\right)^2`), ligne(`=(${ae})^2+2\\cdot ${ae.startsWith("-") ? `(${ae})` : ae}\\cdot ${qP(q(b))}+${qP(q(b))}^2`, [t("identité "), f("(a+b)^2=a^2+2ab+b^2")]), ligne(`=${sommeVolumeLatex(e.developpe)}`, [f("\\left(e^{x}\\right)^2=e^{2x}")])],
        piege: pg,
      };
    }
    const c = e.termes[0].coef;
    return {
      utilise: [t("On élève au carré, puis on abaisse le degré "), f("\\cos^2(x)=\\dfrac{1+\\cos(2x)}{2}"), t(` ${C5}.`)],
      calcul: [ligne(`[f(x)]^2=\\left(${fL}\\right)^2`), ligne(`=${c * c}\\cos^2(x)`, "on élève au carré"), ligne(`=${c * c}\\cdot\\dfrac{1+\\cos(2x)}{2}`, "on abaisse le degré"), ligne(`=${sommeVolumeLatex(e.developpe)}`, "on distribue")],
      piege: pg,
    };
  }
  if (phase === "aEcran2") return { utilise: utilisePrimitive(), calcul: lignesPrimitive(e.developpe, "[f(x)]^2") };
  return lignesVolume(e.developpe, e.a, e.b, "[f(x)]^2", volumeExactALatex(e), (x) => e.primitiveDeveloppeReference(x));
}

/** V = π∫ₐᵇ … : polynôme (calcul exact) ou exponentielle / trigonométrique (forme exacte de l'écran). */
function lignesVolume(dev: TermeDeveloppe[], a: number, b: number, integrande: string, exacte: string | null, P: (x: number) => number): Contenu {
  const utilise = [t(`Méthode des disques ${C5} : `), f("V=\\pi\\int_a^b [f(x)]^2\\,dx"), t(", avec la primitive de l'étape précédente.")];
  const polynomial = dev.every((x) => x.type === "puissance" || x.type === "constante");
  if (polynomial) {
    const { lignes } = lignesIntegralePoly({ gauche: "V", integrande, p: poly(dev as ExerciceVolumeB["termes"]), a: q(a), b: q(b), facteur: "\\pi" });
    return { utilise, calcul: lignes, piege: "Oublier le facteur π devant l'intégrale." };
  }
  const F = sommePrimitiveVolumeLatex(dev);
  const v = Math.PI * (P(b) - P(a));
  const lignes: LigneCalcul[] = [
    ligne(`V=\\pi\\int_{${a}}^{${b}} ${integrande}\\,dx`),
    ligne(`=\\pi${crochet(F, `${a}`, `${b}`)}`, "primitive de l'étape précédente"),
    ligne(`=\\pi${entoure(moins(substituer(F, `${b}`), substituer(F, `${a}`)))}`, "F(b) − F(a)"),
  ];
  if (exacte) lignes.push(ligne(`=${exacte}`, "on regroupe"));
  lignes.push(ligne(`\\approx ${decimalLatex(v, 2)}`, "valeur approchée"));
  return { utilise, calcul: lignes, piege: "Oublier le facteur π devant l'intégrale." };
}

function contenuB(e: ExerciceVolumeB, phase: PhaseVolumesRevolution): Contenu {
  const p = poly(e.termes);
  if (phase === "bEcran1") return { utilise: [t("Les bornes sont les racines de f : on résout "), f("f(x)=0"), t(` avec le discriminant ${C5}.`)], calcul: [ligne(`${polyL(p)}=0`, "les bornes sont les racines"), ...lignesTrinome(p).lignes] };
  if (phase === "bEcran2") return { utilise: [t(`Carré d'un trinôme : `), f("(a+b+c)^2=a^2+b^2+c^2+2ab+2ac+2bc"), t(` ${C5}.`)], calcul: lignesCarrePoly(p, "[f(x)]^2"), piege: piegeDeveloppementVolume(e) };
  if (phase === "bEcran3") return { utilise: utilisePrimitive(), calcul: lignesPrimitive(e.developpe, "[f(x)]^2") };
  return lignesVolume(e.developpe, e.r1, e.r2, "[f(x)]^2", null, (x) => e.primitiveDeveloppeReference(x));
}

function contenuC(e: ExerciceVolumeC, phase: PhaseVolumesRevolution): Contenu {
  const pf = poly(e.termesF);
  const pg = poly(e.termesG);
  const h = polySub(pf, pg);
  const fSurG = e.ordre === "fSurG";
  if (phase === "cEcran1") {
    return {
      utilise: [t("Les bornes sont les abscisses des points d'intersection : on résout "), f("f(x)=g(x)"), t(`, c'est-à-dire f(x) − g(x) = 0 ${C5}.`)],
      calcul: [ligne(`f(x)-g(x)=${polyL(h)}`, "on soustrait et on réduit"), ...lignesTrinome(h).lignes],
    };
  }
  if (phase === "cEcran2") {
    const m = qDiv(qAdd(q(e.r1), q(e.r2)), q(2));
    return {
      utilise: [t(`Le signe de f − g en un point de l'intervalle indique quelle courbe est au-dessus ${C5}.`)],
      calcul: [ligne(`f(x)-g(x)=${polyL(h)}`, "on soustrait et on réduit"), ligne(`f${argQ(m)}-g${argQ(m)}=${polySubstitue(h, m)}`, [t("valeur test entre "), f(`${e.r1}`), t(" et "), f(`${e.r2}`)]), ligne(`=${qL(polyEval(h, m))}`), ligne(fSurG ? "f(x)\\geq g(x)" : "g(x)\\geq f(x)", [t("sur "), f(`[${e.r1};${e.r2}]`)])],
    };
  }
  const { dessus, dessous } = nomsDessusDessous(e);
  const sup = fSurG ? pf : pg;
  const inf = fSurG ? pg : pf;
  const dev = polySub(polyMul(sup, sup), polyMul(inf, inf));
  if (phase === "cEcran3") {
    return {
      utilise: [t(`Méthode des rondelles ${C5} : on soustrait les carrés, courbe du dessus moins courbe du dessous (et non le carré de la différence).`)],
      calcul: [
        ligne(`${differenceCarresLatex(e)}=\\left(${polyL(sup)}\\right)^2-\\left(${polyL(inf)}\\right)^2`, [t(`${dessus} au-dessus, ${dessous} en dessous`)]),
        ligne(`=\\left(${polyL(polyMul(sup, sup))}\\right)-\\left(${polyL(polyMul(inf, inf))}\\right)`, [t("on développe chaque carré : "), f("(a+b)^2=a^2+2ab+b^2")]),
        ligne(`=${polyL(dev)}`, "on soustrait et on réduit"),
      ],
      piege: "Élever la différence au carré, [f(x) − g(x)]², au lieu de soustraire les carrés.",
    };
  }
  const integrande = `\\left(${differenceCarresLatex(e)}\\right)`;
  const P = sommePrimitiveVolumeLatex(e.developpe);
  const { lignes } = lignesIntegralePoly({ gauche: "V", integrande, p: dev, a: q(e.r1), b: q(e.r2), facteur: "\\pi" });
  return {
    utilise: [t(`Méthode des rondelles ${C5} : `), f("V=\\pi\\int_a^b\\left([f(x)]^2-[g(x)]^2\\right)dx"), t(", avec la primitive "), f(P), t(" de la forme développée.")],
    calcul: lignes,
    piege: "Oublier le facteur π devant l'intégrale.",
  };
}

function contenuD(e: ExerciceVolumeD, phase: PhaseVolumesRevolution): Contenu {
  const k = q(e.kNum, e.kDen);
  const k2 = qMul(k, k);
  const L = e.L;
  const kL = kLatexD(e);
  const Vp = qDiv(qMul(k2, q(L * L)), q(2));
  const r = qMul(k, q(Math.round(Math.sqrt(L))));
  const Vc = qMul(qMul(r, r), q(L));
  if (phase === "dEcran1") {
    const k2L = qL(k2);
    const coefX = k2L === "1" ? "x" : `${k2L}x`;
    const lignes: LigneCalcul[] = [
      ligne(`V_{\\text{paraboloïde}}=\\pi\\int_0^{${L}}\\left(${kL}\\sqrt{x}\\right)^2dx`, "méthode des disques"),
      ligne(`=\\pi\\int_0^{${L}} ${coefX}\\,dx`, [f("\\left(\\sqrt{x}\\right)^2=x")]),
      ligne(`=\\pi${crochet(polyL(new Map([[2, qDiv(k2, q(2))]])), "0", `${L}`)}`, [t("primitive de "), f("x"), t(" : "), f("\\dfrac{x^{2}}{2}")]),
      ligne(`=\\pi\\cdot ${polySubstitue(new Map([[2, qDiv(k2, q(2))]]), q(L))}`, "F(L) − F(0), avec F(0) = 0"),
      ligne(`=${piL(Vp)}`),
      ligne(`\\approx ${decimalLatex(qVal(Vp) * Math.PI, 2)}`, "valeur approchée"),
    ];
    return { utilise: [t(`Méthode des disques ${C5} : le carré fait disparaître la racine.`)], calcul: lignes };
  }
  if (phase === "dEcran2") {
    return {
      utilise: [t(`Volume d'un cylindre ${C5} : aire de la base × hauteur, `), f("V=\\pi r^2h"), t(", avec le rayon "), f("r=f(L)"), t(" et la hauteur "), f("h=L"), t(".")],
      calcul: [
        ligne(`r=f(${L})=${kL}${kL === "" ? "" : "\\cdot "}\\sqrt{${L}}`, "rayon : valeur de f en L"),
        ligne(`=${qL(r)}`),
        ligne(`V_{\\text{cylindre}}=\\pi\\cdot ${qP(r)}^2\\cdot ${L}`, [f("V=\\pi r^2h")]),
        ligne(`=${piL(Vc)}`),
        ligne(`\\approx ${decimalLatex(qVal(Vc) * Math.PI, 2)}`, "valeur approchée"),
      ],
      piege: "Prendre L pour le rayon : le rayon du cylindre est f(L), la hauteur est L.",
    };
  }
  return {
    utilise: [t("On divise les deux volumes : π, "), f("k^2"), t(" et "), f("L^2"), t(` se simplifient — le paraboloïde occupe toujours la moitié de son cylindre ${C5}.`)],
    calcul: [ligne(`\\dfrac{V_{\\text{paraboloïde}}}{V_{\\text{cylindre}}}=\\dfrac{${piL(Vp)}}{${piL(Vc)}}`, "volumes des étapes précédentes"), ligne(`=\\dfrac{${qL(Vp)}}{${qL(Vc)}}`, "on simplifie par π"), ligne("=\\dfrac{1}{2}")],
  };
}

const qVal = (x: { n: number; d: number }) => x.n / x.d;

function contenu(e: ExerciceVolumesRevolution, phase: PhaseVolumesRevolution): Contenu {
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

export function piegeVolumesRevolution(e: ExerciceVolumesRevolution, phase: PhaseVolumesRevolution): string | undefined {
  return contenu(e, phase).piege;
}

export function correctionDetailleeVolumesRevolution(e: ExerciceVolumesRevolution): EtapeCorrection[] {
  const phases = phasesPourExercice(e);
  return phases.flatMap((phase, i) => {
    const sq = LETTRES[i];
    const c = contenu(e, phase);
    const etapes: EtapeCorrection[] = [utilise(sq, c.utilise), calcul(sq, c.calcul)];
    const figure = i === phases.length - 1 ? { figureHtml: figureVolumesRevolutionSvg(e) } : {};
    etapes.push({ ...resultat(sq, [f(formatReponseAttenduePhaseLatex(e, phase).join(",\\quad "))]), ...figure });
    if (c.piege) etapes.push(piege(sq, [t(c.piege)]));
    return etapes;
  });
}

/** Les trois calculs d'un volume de famille A (carré développé, primitive, V) — réutilisés par
 * 6gen29 (pièce percée), dont un seul écran fait tout le calcul. */
export function blocsVolumeA(e: ExerciceVolumeA): { titre: string; lignes: LigneCalcul[] }[] {
  return [
    { titre: "Carré", lignes: contenuA(e, "aEcran1").calcul },
    { titre: "Primitive", lignes: contenuA(e, "aEcran2").calcul },
    { titre: "Volume", lignes: contenuA(e, "aEcran3").calcul },
  ];
}
