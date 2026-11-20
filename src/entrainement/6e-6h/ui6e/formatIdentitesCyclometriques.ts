import type { ExerciceArcTrig, ExerciceIdentites } from "../core6e/identitesCyclometriques.types";
import {
  arcDe,
  dansImage,
  domaineCorrect,
  domaineL,
  expressionArcTrigL,
  expressionLitteraleL,
  expressionTrigArcL,
  exterieure,
  formeSimplifieeL,
  IMAGE_L,
  k12De,
  phiL,
  signePositif,
  thetaL,
  valeurTrigArc,
} from "../moteur6e/modeleIdentitesCyclometriques";
import type { IdDomaine } from "../moteur6e/modeleIdentitesCyclometriques";
import type { AideEcran, ChampEcran, Frag, OptionEcran } from "./ecransExp.types";
import { lx, tx } from "./ecransExp.types";
import { piL, piLP, qL, qLi, radL, trigAngleL, trigExact } from "./nombresRecip";

/**
 * Couche C — textes de `6gen153` « Identités trig∘arc et arc∘trig » : consignes, options, champs,
 * aides à deux niveaux (propriété du cours, puis application à l'instance — jamais la réponse),
 * réponses. Source unique de l'écran, du papier et du corrigé.
 */

type E = ExerciceIdentites;
export type PhaseIdentites = "verdict" | "valeur";
export const PHASES_IDENTITES: PhaseIdentites[] = ["verdict", "valeur"];
const t = tx;
const l = lx;

const NOM_ARC: Record<string, string> = { sin: "arcsin", cos: "arccos", tan: "arctan" };

export function expressionL(e: E): string {
  return e.variante === "arcTrig" ? expressionArcTrigL(e) : e.variante === "trigArc" ? expressionTrigArcL(e) : expressionLitteraleL(e);
}

export function consigneGenerale(e: E): Frag[] {
  if (e.variante === "litteral") return [t("On considère la fonction "), l(`f(x)=${expressionL(e)}`), t(".")];
  return [t("On considère le nombre "), l(`A=${expressionL(e)}`), t(".")];
}

/** Consigne globale du papier (énoncé + consigne). */
export function consignePapier(e: E): string {
  if (e.variante === "litteral") return "";
  return "Calcule la valeur exacte de A (sans fonction trigonométrique ni arcfonction) en justifiant chaque étape.";
}

export function libelle(e: E, phase: PhaseIdentites): string {
  if (phase === "verdict") return e.variante === "arcTrig" ? "θ dans l'image ?" : e.variante === "trigArc" ? "Signe de A" : "Domaine de f";
  return e.variante === "litteral" ? "Forme simplifiée" : "Valeur exacte";
}

export function consigne(e: E, phase: PhaseIdentites): Frag[] {
  if (phase === "verdict") {
    if (e.variante === "arcTrig") return [t("L'angle "), l(`\\theta=${thetaL(e)}`), t(` appartient-il à l'image de ${NOM_ARC[e.fn]} ?`)];
    if (e.variante === "trigArc") return [t("Quel est le signe de "), l("A"), t(" ?")];
    return [t("Quel est le domaine de "), l("f"), t(" ?")];
  }
  if (e.variante === "arcTrig") return [t("Donne la valeur exacte de "), l("A"), t(" (un angle, sans fonction trigonométrique).")];
  if (e.variante === "trigArc") return [t("Donne la valeur exacte de "), l("A"), t(" (sans fonction trigonométrique ni arcfonction).")];
  return [t("Écris "), l("f(x)"), t(" sans fonction trigonométrique ni arcfonction.")];
}

export function options(e: E): OptionEcran[] {
  if (e.variante === "arcTrig")
    return [
      { id: "dans", fragments: [l(`${thetaL(e)}\\in ${IMAGE_L[e.fn]}`)] },
      { id: "hors", fragments: [l(`${thetaL(e)}\\notin ${IMAGE_L[e.fn]}`)] },
    ];
  if (e.variante === "trigArc")
    return [
      { id: "pos", fragments: [l("A>0")] },
      { id: "neg", fragments: [l("A<0")] },
    ];
  return e.options.map((id) => ({ id, fragments: [l(`\\mathrm{dom}\\,f=${domaineL(id as IdDomaine, e.k)}`)] }));
}

export function bonneOption(e: E): string {
  if (e.variante === "arcTrig") return dansImage(e.fn, k12De(e)) ? "dans" : "hors";
  if (e.variante === "trigArc") return signePositif(e) ? "pos" : "neg";
  return domaineCorrect(e.couple);
}

export function champs(e: E): ChampEcran[] {
  if (e.variante === "litteral") return [{ label: "f(x) =", labelLatex: "f(x)=", placeholder: "ex. : x/√(1+x²)", apercu: true }];
  return [{ label: "A =", labelLatex: "A=", placeholder: e.variante === "arcTrig" ? "ex. : 7π/12" : "ex. : 3√5/7" }];
}

/** Réponse attendue de l'écran 2 (LaTeX). */
export function valeurL(e: E): string {
  if (e.variante === "arcTrig") return phiL(e);
  if (e.variante === "trigArc") return radL(valeurTrigArc(e));
  return formeSimplifieeL(e);
}

export function reponse(e: E, phase: PhaseIdentites): Frag[] {
  if (phase === "verdict") return options(e).find((o) => o.id === bonneOption(e))!.fragments;
  if (e.variante === "litteral") return [l(`f(x)=${valeurL(e)}`)];
  return [l(`A=${valeurL(e)}`)];
}

export const recap = reponse;

export function messageIllisible(e: E, phase: PhaseIdentites): string {
  void phase;
  if (e.variante === "arcTrig") return "Je n'arrive pas à lire ta réponse (exemples d'écritures : 7π/12, −π/4, 2pi/3). Cela ne compte pas comme une tentative.";
  if (e.variante === "trigArc") return "Je n'arrive pas à lire ta réponse (exemples d'écritures : 3√5/7, −4/5, sqrt(3)/3). Cela ne compte pas comme une tentative.";
  return "Je n'arrive pas à lire ton expression (exemples d'écritures : x/√(1+x²), sqrt(1−x^2), 1/sqrt(1+x²)). Cela ne compte pas comme une tentative.";
}

// ============================================================================
// Aides.
// ============================================================================

function bornesAuDenominateur(e: ExerciceArcTrig): string {
  const d = e.d;
  const ecrire = (k12: number) => {
    if (k12 === 0) return "0";
    const N = (k12 * d) / 12;
    if (!Number.isInteger(N)) return piL(k12, 12);
    const a = Math.abs(N);
    return d === 1 ? `${N < 0 ? "-" : ""}${a === 1 ? "" : a}\\pi` : `${N < 0 ? "-" : ""}\\dfrac{${a === 1 ? "" : a}\\pi}{${d}}`;
  };
  const b = e.fn === "cos" ? [0, 12] : [-6, 6];
  return b.filter((k) => k !== 0).map((k) => `${piL(k, 12)}=${ecrire(k)}`).join("\\qquad ");
}

export function aide1(e: E, phase: PhaseIdentites): AideEcran {
  if (e.variante === "arcTrig") {
    if (phase === "verdict") return { texte: [t(`${NOM_ARC[e.fn]} ne renvoie que des angles de son image (cours, § 2) :`)], latex: IMAGE_L[e.fn] };
    return { texte: [l("A"), t(` est l'angle de l'image de ${NOM_ARC[e.fn]} qui a le même ${e.fn === "sin" ? "sinus" : e.fn === "cos" ? "cosinus" : "tangente"} que `), l("\\theta"), t(" :")], latex: `\\arc${e.fn}(\\${e.fn}\\theta)=\\varphi\\iff\\varphi\\in ${IMAGE_L[e.fn]}\\ \\text{et}\\ \\${e.fn}\\varphi=\\${e.fn}\\theta` };
  }
  if (e.variante === "trigArc") {
    const f = arcDe(e.couple);
    if (phase === "verdict") return { texte: [t("L'angle "), l(`\\alpha=\\arc${f}\\left(${qL(e.a)}\\right)`), t(` appartient à l'image de ${NOM_ARC[f]} :`)], latex: `\\alpha\\in ${IMAGE_L[f]}` };
    if (f === "tan") return { texte: [t("On connaît "), l(`\\tan\\alpha=${qL(e.a)}`), t(". Relie le cosinus à la tangente :")], latex: "1+\\tan^{2}\\alpha=\\dfrac{1}{\\cos^{2}\\alpha}" };
    return { texte: [t("On connaît "), l(`\\${f}\\alpha=${qL(e.a)}`), t(". Relie sinus et cosinus :")], latex: `\\cos^{2}\\alpha+\\sin^{2}\\alpha=1${exterieure(e.couple) === "tan" ? "\\qquad\\tan\\alpha=\\dfrac{\\sin\\alpha}{\\cos\\alpha}" : ""}` };
  }
  const f = arcDe(e.couple);
  if (phase === "verdict")
    return {
      texte: [t(`Conditions d'existence : ${NOM_ARC[f]}(u) existe pour `), l(f === "tan" ? "u\\in\\mathbb{R}" : "u\\in[-1\\,;\\,1]"), t(exterieure(e.couple) === "tan" ? " ; une tangente est un quotient, son dénominateur doit être non nul." : " ; le résultat suit le domaine de l'arcfonction.")],
    };
  if (f === "tan") return { texte: [t("Pose "), l(`\\alpha=\\arctan(${e.k}x)`), t(", donc "), l(`\\tan\\alpha=${e.k}x`), t(", et utilise :")], latex: "1+\\tan^{2}\\alpha=\\dfrac{1}{\\cos^{2}\\alpha}" };
  return { texte: [t("Pose "), l(`\\alpha=\\arc${f}(${e.k}x)`), t(", donc "), l(`\\${f}\\alpha=${e.k}x`), t(", et utilise :")], latex: "\\cos^{2}\\alpha+\\sin^{2}\\alpha=1" };
}

export function aide2(e: E, phase: PhaseIdentites): AideEcran {
  if (e.variante === "arcTrig") {
    if (phase === "verdict") return { texte: [t("Écris les bornes de l'image au dénominateur de "), l("\\theta"), t(", puis compare :")], latex: bornesAuDenominateur(e) };
    if (dansImage(e.fn, k12De(e))) {
      const v = trigExact(e.fn, k12De(e))!;
      return { texte: [t("Valeur remarquable : "), l(`${trigAngleL(e.fn, e.n, e.d)}=${radL(v)}`), t(". Quel angle de l'image a cette valeur ?")] };
    }
    const th = piLP(e.n, e.d);
    const cands = e.fn === "sin" ? `${thetaL(e)}+2k\\pi\\qquad\\pi-${th}+2k\\pi` : e.fn === "cos" ? `${thetaL(e)}+2k\\pi\\qquad -${th}+2k\\pi` : `${thetaL(e)}+k\\pi`;
    return { texte: [t(`Angles de même ${e.fn === "sin" ? "sinus" : e.fn === "cos" ? "cosinus" : "tangente"} que `), l("\\theta"), t(" (avec "), l("k"), t(" entier) ; garde celui qui est dans l'image :")], latex: cands };
  }
  if (e.variante === "trigArc") {
    const f = arcDe(e.couple);
    const g = exterieure(e.couple);
    const neg = e.a.n < 0;
    if (phase === "verdict") {
      const moitie =
        f === "sin" ? (neg ? "\\left[-\\dfrac{\\pi}{2}\\,;\\,0\\right[" : "\\left]0\\,;\\,\\dfrac{\\pi}{2}\\right]") : f === "cos" ? (neg ? "\\left]\\dfrac{\\pi}{2}\\,;\\,\\pi\\right]" : "\\left[0\\,;\\,\\dfrac{\\pi}{2}\\right[") : neg ? "\\mathopen{]}-\\dfrac{\\pi}{2}\\,;\\,0\\mathclose{[}" : "\\mathopen{]}0\\,;\\,\\dfrac{\\pi}{2}\\mathclose{[}";
      return { texte: [t("Le signe de "), l(qL(e.a)), t(" situe "), l("\\alpha"), t(` dans une moitié de l'image ; lis le signe de ${g === "sin" ? "sinus" : g === "cos" ? "cosinus" : "la tangente"} sur cette moitié du cercle :`)], latex: `\\alpha\\in ${moitie}` };
    }
    const a = qL(e.a);
    const aP = e.a.n < 0 || e.a.d !== 1 ? `\\left(${a}\\right)` : a;
    const racMoins = `\\sqrt{1-${aP}^{2}}`;
    const racPlus = `\\sqrt{1+${aP}^{2}}`;
    const aI = qLi(e.a);
    const expr =
      e.couple === "cos_arcsin" || e.couple === "sin_arccos"
        ? `\\${g}\\alpha=${racMoins}`
        : e.couple === "tan_arcsin"
          ? `\\tan\\alpha=\\dfrac{${aI}}{${racMoins}}`
          : e.couple === "tan_arccos"
            ? `\\tan\\alpha=\\dfrac{${racMoins}}{${aI}}`
            : e.couple === "cos_arctan"
              ? `\\cos\\alpha=\\dfrac{1}{${racPlus}}`
              : `\\sin\\alpha=\\tan\\alpha\\cdot\\cos\\alpha=\\dfrac{${aI}}{${racPlus}}`;
    return { texte: [t("Avec le signe de l'étape 1, il reste à calculer :")], latex: expr };
  }
  const f = arcDe(e.couple);
  const k = e.k;
  if (phase === "verdict") {
    if (f === "tan") return { texte: [t("Ici "), l(`u=${k}x`), t(" : pour quels "), l("x"), t(" "), l(`\\arctan(${k}x)`), t(" existe-t-il ? Le cosinus d'un angle de "), l(IMAGE_L.tan), t(" peut-il être nul ?")] };
    const extra = e.couple === "tan_arcsin" ? [t(" Le dénominateur "), l(`\\cos\\left(\\arcsin(${k}x)\\right)`), t(" s'annule-t-il aux bornes ?")] : e.couple === "tan_arccos" ? [t(" Le dénominateur "), l(`\\cos\\left(\\arccos(${k}x)\\right)=${k}x`), t(" doit être non nul.")] : [];
    return { texte: [t("Ici "), l(`u=${k}x`), t(" : résous la double inéquation ci-dessous."), ...extra], latex: `-1\\leq ${k}x\\leq 1` };
  }
  const g = exterieure(e.couple);
  const L =
    f === "tan"
      ? g === "cos"
        ? `\\cos\\alpha=\\dfrac{1}{\\sqrt{1+(${k}x)^{2}}}`
        : `\\sin\\alpha=\\tan\\alpha\\cdot\\cos\\alpha=\\dfrac{${k}x}{\\sqrt{1+(${k}x)^{2}}}`
      : g === "tan"
        ? f === "sin"
          ? `\\tan\\alpha=\\dfrac{${k}x}{\\sqrt{1-(${k}x)^{2}}}`
          : `\\tan\\alpha=\\dfrac{\\sqrt{1-(${k}x)^{2}}}{${k}x}`
        : `\\${g}\\alpha=\\sqrt{1-(${k}x)^{2}}`;
  return { texte: [t("Substitue (racine positive : l'angle est dans l'image) ; développe ensuite le carré — il porte sur "), l(`${k}`), t(" aussi :")], latex: L };
}

export function explicationChoix(e: E, phase: PhaseIdentites): string {
  void phase;
  if (e.variante === "arcTrig") return "Compare θ aux deux bornes de l'image, écrites au même dénominateur.";
  if (e.variante === "trigArc") return "Le signe dépend de la position de l'angle dans l'image de l'arcfonction, pas seulement du signe de a.";
  return "Le domaine combine le domaine de l'arcfonction et, pour une tangente, un dénominateur non nul.";
}

/** Énoncé papier d'une variante à deux vraies questions (littéral : domaine, puis forme). */
export function questionsPapierLitteral(): Frag[][] {
  return [[t("Détermine le domaine de "), l("f"), t(".")], [t("Écris "), l("f(x)"), t(" sans fonction trigonométrique ni arcfonction.")]];
}
