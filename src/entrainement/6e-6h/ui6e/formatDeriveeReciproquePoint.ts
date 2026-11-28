import type { ExerciceDeriveeReciproque } from "../core6e/deriveeReciproquePoint.types";
import { applicable, modele, y0L } from "../moteur6e/modeleDeriveeReciproquePoint";
import type { AideEcran, ChampEcran, Frag, OptionEcran } from "./ecransExp.types";
import { lx, tx } from "./ecransExp.types";

/**
 * Couche C — textes de `6gen155` « Dérivée d'une réciproque en un point » : consignes, options,
 * champs, aides à deux niveaux (règle du cours, puis application à l'instance — jamais la réponse),
 * réponses. Source unique de l'écran, du papier et du corrigé.
 */

type E = ExerciceDeriveeReciproque;
export type PhaseReciproque = "x0" | "derivee" | "theoreme" | "resultat";
const t = tx;
const l = lx;

export function phases(e: E): PhaseReciproque[] {
  return applicable(e) ? ["x0", "derivee", "theoreme", "resultat"] : ["x0", "derivee", "theoreme"];
}

export function consigneGenerale(e: E): Frag[] {
  const m = modele(e);
  return [
    t("La fonction "),
    l(`f(x)=${m.fL}`),
    t(" est continue et strictement croissante sur "),
    l(`I=${m.IL}`),
    t(" (admis) : elle admet une réciproque "),
    l("f^{-1}"),
    t(", dont on ne connaît pas d'expression. On s'intéresse à "),
    l(`y_0=${y0L(e)}`),
    t("."),
  ];
}

export function questionPapier(e: E): Frag[] {
  return [t("Calcule "), l(`(f^{-1})'(${y0L(e)})`), t(", ou justifie que ce nombre n'existe pas.")];
}

export function libelle(_e: E, phase: PhaseReciproque): string {
  return phase === "x0" ? "x₀ = f⁻¹(y₀)" : phase === "derivee" ? "f′(x₀)" : phase === "theoreme" ? "Le théorème s'applique ?" : "(f⁻¹)′(y₀)";
}

export function consigne(e: E, phase: PhaseReciproque): Frag[] {
  const y = y0L(e);
  if (phase === "x0") return [t("Trouve "), l("x_0=f^{-1}(y_0)"), t(", le réel de "), l("I"), t(" tel que "), l(`f(x_0)=${y}`), t(" (cherche une valeur évidente).")];
  if (phase === "derivee") return [t("Calcule "), l("f'(x_0)"), t(" (valeur exacte).")];
  if (phase === "theoreme") return [t("Le théorème de la dérivée d'une réciproque s'applique-t-il en "), l("y_0"), t(" ?")];
  return [t("Calcule "), l(`(f^{-1})'(${y})`), t(" (valeur exacte).")];
}

export function optionsTheoreme(): OptionEcran[] {
  return [
    { id: "oui", fragments: [t("Oui : "), l("f'(x_0)\\neq 0"), t(", donc "), l("(f^{-1})'(y_0)"), t(" existe.")] },
    { id: "nul", fragments: [t("Non : "), l("f'(x_0)=0"), t(" ; la tangente à "), l("f^{-1}"), t(" en "), l("y_0"), t(" est verticale.")] },
    { id: "inj", fragments: [t("Non : "), l("f'"), t(" s'annule, donc "), l("f"), t(" n'est pas injective.")] },
  ];
}

export const bonneOption = (e: E): string => (applicable(e) ? "oui" : "nul");

export function champs(e: E, phase: PhaseReciproque): ChampEcran[] {
  const y = y0L(e);
  if (phase === "x0") return [{ label: "x₀ =", labelLatex: `x_0=f^{-1}(${y})=`, placeholder: "ex. : 3/2" }];
  if (phase === "derivee") return [{ label: "f′(x₀) =", labelLatex: `f'(x_0)=`, placeholder: "ex. : 5/2" }];
  return [{ label: "(f⁻¹)′(y₀) =", labelLatex: `(f^{-1})'(${y})=`, placeholder: "ex. : 2/5" }];
}

export function reponse(e: E, phase: PhaseReciproque): Frag[] {
  const m = modele(e);
  const p = m.point;
  const y = y0L(e);
  if (phase === "x0") return [l(`x_0=f^{-1}(${y})=${p.x0L}`)];
  if (phase === "derivee") return [l(`f'(${p.x0L})=${p.fpL}`)];
  if (phase === "theoreme") return optionsTheoreme().find((o) => o.id === bonneOption(e))!.fragments;
  return [l(`(f^{-1})'(${y})=${p.invL}`)];
}

export const recap = reponse;

export function messageIllisible(_e: E, phase: PhaseReciproque): string {
  void phase;
  return "Je n'arrive pas à lire ta réponse (exemples d'écritures : 3/2, −1, π/2, e, 1/(e+2)). Cela ne compte pas comme une tentative.";
}

export function aide1(e: E, phase: PhaseReciproque): AideEcran {
  const y = y0L(e);
  if (phase === "x0") return { texte: [l("f^{-1}(y_0)"), t(" est le réel "), l("x_0"), t(" de "), l("I"), t(" tel que "), l("f(x_0)=y_0"), t(" (cours, point 1). On ne sait pas résoudre l'équation par calcul : cherche une valeur évidente ; f étant strictement croissante, c'est la seule solution.")], latex: `f(x_0)=${y}` };
  if (phase === "derivee") return { texte: [t("Dérive "), l("f"), t(" terme à terme avec les dérivées de référence, puis remplace "), l("x"), t(" par "), l("x_0"), t(" — et non par "), l("y_0"), t(".")] };
  if (phase === "theoreme") return { texte: [t("Théorème (cours, point 1) : si "), l("f"), t(" est continue, strictement monotone sur un intervalle et dérivable en "), l("x_0"), t(" avec "), l("f'(x_0)\\neq 0"), t(", alors :")], latex: "(f^{-1})'(y_0)=\\dfrac{1}{f'(x_0)}" };
  return { texte: [t("Théorème de la dérivée d'une réciproque (cours, point 1) :")], latex: "(f^{-1})'(y_0)=\\dfrac{1}{f'\\left(f^{-1}(y_0)\\right)}" };
}

export function aide2(e: E, phase: PhaseReciproque): AideEcran {
  const m = modele(e);
  if (phase === "x0") return { texte: [t("Calcule "), l("f"), t(" en quelques valeurs simples de "), l("I"), t(", par exemple :")], latex: `x\\in\\left\\{${m.evidentes.join("\\,;\\,")}\\right\\}` };
  if (phase === "derivee") return { texte: [t("Voici la dérivée ; remplace "), l("x"), t(" par la valeur de "), l("x_0"), t(" trouvée à l'écran 1 :")], latex: `f'(x)=${m.fpxL}` };
  if (phase === "theoreme") return { texte: [t("Regarde la valeur de "), l("f'(x_0)"), t(" trouvée à l'écran 2. Une fonction strictement croissante peut avoir une dérivée nulle en un point isolé (comme "), l("x^{3}"), t(" en "), l("0"), t(") : elle reste injective.")] };
  return { texte: [t("Ici "), l(`f^{-1}(${y0L(e)})=${m.point.x0L}`), t(" : il reste à calculer")], latex: `(f^{-1})'(${y0L(e)})=\\dfrac{1}{f'(${m.point.x0L})}` };
}

export function explicationChoix(e: E): string {
  return applicable(e) ? "f′(x₀) n'est pas nul : le théorème s'applique." : "f′(x₀) = 0 : l'hypothèse du théorème n'est pas remplie ; f reste injective (strictement croissante).";
}
