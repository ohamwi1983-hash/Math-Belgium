import type { ExReflexion, ExRefraction, ExVue, ExerciceProblemesArcfonctions } from "../core6e/problemesArcfonctions";
import {
  ANGLE_SECURITE,
  angleHauteur,
  angleLimite,
  angleRefracte,
  angleRefracteMax,
  angleSol,
  angleVue,
  angleVueMax,
  distanceOptimale,
  distanceSecurite,
  incidencePour,
  verdictRayon,
} from "../core6e/problemesArcfonctions";
import type { AideEcran, ChampEcran, Frag, OptionEcran } from "../../5e-4h/ui5e/ecransTrigo.types";
import { lx, tx } from "../../5e-4h/ui5e/ecransTrigo.types";
import { degL, degT, nbL, nbT } from "./nombresCycloLotG";

/**
 * Couche C — textes de `6gen156` « Problèmes avec arcfonctions ». Source unique de l'écran, des aides,
 * du récapitulatif, du corrigé et du papier. Trois vraies questions par problème (`q1`, `q2`, `q3`).
 */

type E = ExerciceProblemesArcfonctions;
export type PhaseProblemesArcfonctions = "q1" | "q2" | "q3";
export const PHASES_PROBLEMES: PhaseProblemesArcfonctions[] = ["q1", "q2", "q3"];

/** Indice de réfraction écrit à deux décimales (« 1{,}00 », « 1{,}33 »). */
export const nL = (n: number) => nbL(n, 2, true);
export const nT = (n: number) => nbT(n, 2, true);
/** Longueur en m (au plus deux décimales). */
export const mL = (x: number) => nbL(x, 2);
export const mT = (x: number) => nbT(x, 2);

export const ID_OUI = "oui";
export const ID_NON = "non";

/** Valeurs attendues (degrés ou mètres), une par question — la même source pour tout. */
export function valeurAttendue(e: E, phase: PhaseProblemesArcfonctions): number {
  switch (e.variante) {
    case "refraction":
      return phase === "q1" ? angleRefracte(e.milieu1.n, e.milieu2.n, e.theta1) : phase === "q2" ? incidencePour(e.milieu1.n, e.milieu2.n, e.theta2Voulu) : angleRefracteMax(e.milieu1.n, e.milieu2.n);
    case "reflexion-totale":
      return phase === "q1" ? angleLimite(e.milieu1.n, e.milieu2.n) : phase === "q2" ? angleRefracte(e.milieu1.n, e.milieu2.n, e.theta1) : verdictRayon(e) ? 1 : 0;
    case "angle-de-vue":
      return phase === "q1" ? angleVue(e.a, e.b, e.x0) : phase === "q2" ? distanceOptimale(e.a, e.b) : angleVueMax(e.a, e.b);
    case "echelle":
      return phase === "q1" ? angleSol(e.L, e.d) : phase === "q2" ? distanceSecurite(e.L) : angleHauteur(e.L, e.h);
  }
}

/** La question demande-t-elle une longueur (m) plutôt qu'un angle (°) ? */
export const estLongueur = (e: E, phase: PhaseProblemesArcfonctions): boolean => phase === "q2" && (e.variante === "angle-de-vue" || e.variante === "echelle");

const LOI: Frag[] = [tx(" Les angles sont mesurés par rapport à la normale à la surface ; loi de Snell-Descartes : "), lx("n_1\\sin\\theta_1=n_2\\sin\\theta_2"), tx(".")];

function milieuxTexte(e: ExRefraction | ExReflexion): Frag[] {
  return [tx(`passe ${e.milieu1.de} (indice `), lx(`n_1=${nL(e.milieu1.n)}`), tx(`) ${e.milieu2.dans} (indice `), lx(`n_2=${nL(e.milieu2.n)}`), tx(")")];
}

const NOM_VUE = { musee: "Au musée, un tableau est accroché au mur", cinema: "Dans une salle de cinéma, l'écran est fixé au mur du fond", panneau: "Un panneau d'affichage est fixé à un mur" } as const;
const OBJET_VUE = { musee: "le tableau", cinema: "l'écran", panneau: "le panneau" } as const;

export function consigneGenerale(e: E): Frag[] {
  switch (e.variante) {
    case "refraction":
      return [tx("Un rayon laser "), ...milieuxTexte(e), tx("."), ...LOI];
    case "reflexion-totale": {
      const debut = {
        piscine: "Au fond d'une piscine, une lampe éclaire vers la surface : la lumière ",
        fibre: "Dans une fibre optique, la lumière qui arrive sur la paroi ",
        aquarium: "Un rayon lumineux traverse la vitre d'un aquarium : à la face intérieure, il ",
        diamant: "Dans un diamant taillé, un rayon lumineux qui atteint une face ",
      }[e.contexte];
      return [tx(debut), ...milieuxTexte(e), tx("."), ...LOI];
    }
    case "angle-de-vue":
      return [
        tx(`${NOM_VUE[e.contexte]} : son bord inférieur est à `),
        lx(`a=${mL(e.a)}`),
        tx(" m au-dessus de tes yeux, son bord supérieur à "),
        lx(`b=${mL(e.b)}`),
        tx(` m. Debout à la distance `),
        lx("x"),
        tx(` (en m) du mur, tu vois ${OBJET_VUE[e.contexte]} sous l'angle de vue `),
        lx("\\theta"),
        tx(" : l'angle entre le rayon vers son bord inférieur et le rayon vers son bord supérieur."),
      ];
    case "echelle":
      return [
        tx("Une échelle de longueur "),
        lx(`L=${mL(e.L)}`),
        tx(` m est appuyée contre un mur vertical, sur un sol horizontal. Les règles de sécurité recommandent un angle de ${ANGLE_SECURITE}° entre l'échelle et le sol.`),
      ];
  }
}

export function libelle(e: E, phase: PhaseProblemesArcfonctions): string {
  switch (e.variante) {
    case "refraction":
      return { q1: "Angle de réfraction", q2: "Incidence voulue", q3: "Angle de réfraction maximal" }[phase];
    case "reflexion-totale":
      return { q1: "Angle limite", q2: "Angle de réfraction", q3: "Rayon réfracté ?" }[phase];
    case "angle-de-vue":
      return { q1: "Angle de vue", q2: "Meilleure distance", q3: "Angle de vue maximal" }[phase];
    case "echelle":
      return { q1: "Angle avec le sol", q2: "Distance de sécurité", q3: "Angle pour la hauteur voulue" }[phase];
  }
}

/** Texte de la question (écran ET papier). */
export function question(e: E, phase: PhaseProblemesArcfonctions, papier = false): Frag[] {
  const dixieme = tx(" (en degrés, au dixième).");
  const dixiemeQ = tx(" (en degrés, au dixième) ?");
  switch (e.variante) {
    case "refraction":
      if (phase === "q1") return [tx("Le rayon arrive sous l'incidence "), lx(`\\theta_1=${degL(e.theta1, 0)}`), tx(". Calcule l'angle de réfraction "), lx("\\theta_2"), dixieme];
      if (phase === "q2") return [tx("Sous quelle incidence "), lx("\\theta_1"), tx(" faut-il envoyer le rayon pour que l'angle de réfraction vaille "), lx(degL(e.theta2Voulu, 0)), dixiemeQ];
      return [tx("Quand l'incidence s'approche de 90° (rayon rasant), vers quel angle de réfraction tend-on ? C'est le plus grand angle de réfraction possible"), dixieme];
    case "reflexion-totale":
      if (phase === "q1") return [tx("Calcule l'angle limite "), lx("\\theta_L"), tx(` : l'incidence pour laquelle le rayon réfracté rase la surface (`), lx("\\theta_2=90^{\\circ}"), tx(")"), dixieme];
      if (phase === "q2") return [tx("Un rayon arrive sous l'incidence "), lx(`\\theta_1=${degL(e.theta1, 0)}`), tx(". Calcule l'angle de réfraction "), lx("\\theta_2"), dixieme];
      return [tx("Un autre rayon arrive sous l'incidence "), lx(degL(e.theta1Verdict, 0)), tx(`. Existe-t-il un rayon réfracté (de la lumière qui passe ${e.milieu2.dans}) ?${papier ? " Justifie." : ""}`)];
    case "angle-de-vue":
      if (phase === "q1") return [tx("Calcule l'angle de vue à la distance "), lx(`x=${mL(e.x0)}`), tx(" m"), dixieme];
      if (phase === "q2") return [tx(`À quelle distance du mur l'angle de vue est-il le plus grand ? Justifie avec la dérivée${papier ? "" : " ; donne la valeur exacte ou au centimètre"} (en m).`)];
      return [tx("Quel est cet angle de vue maximal"), dixiemeQ];
    case "echelle":
      if (phase === "q1") return [tx("Le pied de l'échelle est à "), lx(`d=${mL(e.d)}`), tx(" m du mur. Calcule l'angle entre l'échelle et le sol"), dixieme];
      if (phase === "q2") return [tx(`À quelle distance du mur faut-il placer le pied pour respecter l'angle de ${ANGLE_SECURITE}° ? (en m, au centimètre)`)];
      return [tx("On veut que le haut de l'échelle touche le mur à "), lx(`h=${mL(e.h)}`), tx(" m de hauteur. Quel angle avec le sol l'échelle fait-elle alors"), dixiemeQ];
  }
}

export const consigne = (e: E, phase: PhaseProblemesArcfonctions): Frag[] => question(e, phase);

export const estChoix = (e: E, phase: PhaseProblemesArcfonctions): boolean => e.variante === "reflexion-totale" && phase === "q3";

export function options(e: ExReflexion): OptionEcran[] {
  return [
    { id: ID_OUI, fragments: [tx(`Oui : une partie de la lumière passe ${e.milieu2.dans}.`)] },
    { id: ID_NON, fragments: [tx(`Non : la lumière est entièrement réfléchie (réflexion totale).`)] },
  ];
}

function nomGrandeur(e: E, phase: PhaseProblemesArcfonctions): { latex: string; texte: string } {
  switch (e.variante) {
    case "refraction":
      return phase === "q2" ? { latex: "\\theta_1", texte: "θ₁" } : { latex: "\\theta_2", texte: "θ₂" };
    case "reflexion-totale":
      return phase === "q1" ? { latex: "\\theta_L", texte: "θL" } : { latex: "\\theta_2", texte: "θ₂" };
    case "angle-de-vue":
      return phase === "q2" ? { latex: "x", texte: "x" } : { latex: "\\theta", texte: "θ" };
    case "echelle":
      return phase === "q2" ? { latex: "d", texte: "d" } : { latex: "\\alpha", texte: "α" };
  }
}

export function champs(e: E, phase: PhaseProblemesArcfonctions): ChampEcran[] {
  const g = nomGrandeur(e, phase);
  if (estLongueur(e, phase)) {
    const exact = e.variante === "angle-de-vue";
    return [{ label: g.texte, labelLatex: `${g.latex}${exact ? "=" : "\\approx"}`, unite: "m", placeholder: exact ? "ex. : 2,45 ou √6" : "ex. : 1,25" }];
  }
  return [{ label: g.texte, labelLatex: `${g.latex}\\approx`, unite: "degrés", placeholder: "ex. : 32,5" }];
}

// --- Écritures communes (aides, réponses, corrigé) -------------------------------------------

/** « \dfrac{1{,}00\cdot\sin 40^{\circ}}{1{,}33} » */
export function sinusSubstL(n1: number, n2: number, theta: number): string {
  return `\\dfrac{${nL(n1)}\\cdot\\sin ${degL(theta, 0)}}{${nL(n2)}}`;
}
export function vueSubstL(e: ExVue, xL: string): string {
  return `\\arctan\\dfrac{${mL(e.b)}}{${xL}}-\\arctan\\dfrac{${mL(e.a)}}{${xL}}`;
}
export const abL = (e: ExVue): string => nbL(e.a * e.b, 4);
/** √(ab) écrit exactement : « \sqrt{1{,}08} ». */
export const xOptL = (e: ExVue): string => `\\sqrt{${abL(e)}}`;

export function aide1(e: E, phase: PhaseProblemesArcfonctions): AideEcran {
  switch (e.variante) {
    case "refraction":
      if (phase === "q1") return { texte: [tx("Isole le sinus de l'angle cherché dans la loi, puis applique arcsin (calculatrice réglée en degrés) :")], latex: "n_1\\sin\\theta_1=n_2\\sin\\theta_2\\iff\\sin\\theta_2=\\dfrac{n_1\\sin\\theta_1}{n_2}" };
      if (phase === "q2") return { texte: [tx("Cette fois, l'inconnue est l'incidence : isole "), lx("\\sin\\theta_1"), tx(" dans la même loi :")], latex: "\\sin\\theta_1=\\dfrac{n_2\\sin\\theta_2}{n_1}" };
      return { texte: [tx("Le rayon rasant correspond à "), lx("\\theta_1=90^{\\circ}"), tx(", et "), lx("\\sin 90^{\\circ}=1"), tx(" :")], latex: "n_1\\cdot 1=n_2\\sin\\theta_2" };
    case "reflexion-totale":
      if (phase === "q1") return { texte: [tx("À l'angle limite, le rayon réfracté rase la surface : "), lx("\\theta_2=90^{\\circ}"), tx(", donc "), lx("\\sin\\theta_2=1"), tx(" :")], latex: "n_1\\sin\\theta_L=n_2\\cdot 1" };
      if (phase === "q2") return { texte: [tx("Isole le sinus de l'angle cherché dans la loi, puis applique arcsin (calculatrice réglée en degrés) :")], latex: "\\sin\\theta_2=\\dfrac{n_1\\sin\\theta_1}{n_2}" };
      return { texte: [tx("Un rayon réfracté existe seulement si "), lx("\\sin\\theta_2=\\dfrac{n_1\\sin\\theta_1}{n_2}"), tx(" ne dépasse pas 1 : arcsin n'est défini que sur "), lx("[-1\\,;\\,1]"), tx(".")] };
    case "angle-de-vue":
      if (phase === "q1") return { texte: [tx("Dans le triangle rectangle formé par tes yeux, le mur et un point du mur à la hauteur "), lx("h"), tx(", l'angle vers ce point a pour tangente "), lx("\\dfrac{h}{x}"), tx(". L'angle de vue est la différence de deux angles :")], latex: "\\theta(x)=\\arctan\\dfrac{b}{x}-\\arctan\\dfrac{a}{x}" };
      if (phase === "q2") return { texte: [tx("L'angle est maximal là où "), lx("\\theta'"), tx(" s'annule (en changeant de signe). La dérivée de "), lx("\\arctan\\dfrac{k}{x}"), tx(" (règle de la chaîne) est :")], latex: "\\left(\\arctan\\dfrac{k}{x}\\right)'=\\dfrac{-k}{x^{2}+k^{2}}" };
      return { texte: [tx("Remplace "), lx("x"), tx(" par la distance trouvée à la question précédente dans "), lx("\\theta(x)"), tx(" (calculatrice en degrés).")] };
    case "echelle":
      if (phase === "q1") return { texte: [tx("Triangle rectangle : l'échelle est l'hypoténuse, la distance au mur est le côté adjacent à l'angle au sol :")], latex: "\\cos\\alpha=\\dfrac{d}{L}" };
      if (phase === "q2") return { texte: [tx("Même triangle, mais l'angle est connu et la distance cherchée :")], latex: "d=L\\cos\\alpha" };
      return { texte: [tx("La hauteur atteinte sur le mur est le côté opposé à l'angle au sol :")], latex: "\\sin\\alpha=\\dfrac{h}{L}" };
  }
}

export function aide2(e: E, phase: PhaseProblemesArcfonctions): AideEcran | null {
  switch (e.variante) {
    case "refraction":
      if (phase === "q1") return { texte: [tx("Ici :")], latex: `\\sin\\theta_2=${sinusSubstL(e.milieu1.n, e.milieu2.n, e.theta1)}` };
      if (phase === "q2") return { texte: [tx("Ici :")], latex: `\\sin\\theta_1=${sinusSubstL(e.milieu2.n, e.milieu1.n, e.theta2Voulu)}` };
      return { texte: [tx("Ici, applique arcsin à :")], latex: `\\sin\\theta_2=\\dfrac{${nL(e.milieu1.n)}}{${nL(e.milieu2.n)}}` };
    case "reflexion-totale":
      if (phase === "q1") return { texte: [tx("Ici, applique arcsin à :")], latex: `\\sin\\theta_L=\\dfrac{${nL(e.milieu2.n)}}{${nL(e.milieu1.n)}}` };
      if (phase === "q2") return { texte: [tx("Ici :")], latex: `\\sin\\theta_2=${sinusSubstL(e.milieu1.n, e.milieu2.n, e.theta1)}` };
      return { texte: [tx("Calcule ce nombre pour l'incidence de l'énoncé, puis compare-le à 1 :")], latex: `\\dfrac{${nL(e.milieu1.n)}\\cdot\\sin ${degL(e.theta1Verdict, 0)}}{${nL(e.milieu2.n)}}` };
    case "angle-de-vue":
      if (phase === "q1") return { texte: [tx("Ici :")], latex: `\\theta(${mL(e.x0)})=${vueSubstL(e, mL(e.x0))}` };
      if (phase === "q2") return { texte: [tx("Ici, "), lx("\\theta'(x)=0"), tx(" s'écrit (produit en croix, puis isole "), lx("x^{2}"), tx(") :")], latex: `\\dfrac{${mL(e.a)}}{x^{2}+${nbL(e.a * e.a, 4)}}=\\dfrac{${mL(e.b)}}{x^{2}+${nbL(e.b * e.b, 4)}}` };
      return { texte: [tx("Ici :")], latex: `\\theta\\left(${xOptL(e)}\\right)=${vueSubstL(e, xOptL(e))}` };
    case "echelle":
      if (phase === "q1") return { texte: [tx("Ici, applique arccos à :")], latex: `\\cos\\alpha=\\dfrac{${mL(e.d)}}{${mL(e.L)}}` };
      if (phase === "q2") return { texte: [tx("Ici (calculatrice en degrés) :")], latex: `d=${mL(e.L)}\\cos ${degL(ANGLE_SECURITE, 0)}` };
      return { texte: [tx("Ici, applique arcsin à :")], latex: `\\sin\\alpha=\\dfrac{${mL(e.h)}}{${mL(e.L)}}` };
  }
}

export function messageIllisible(e: E, phase: PhaseProblemesArcfonctions): string {
  if (estLongueur(e, phase)) return "Nombre non reconnu : écris par exemple 2,45 ou √6 (virgule ou point). Cette saisie ne compte pas comme une tentative.";
  return "Angle non reconnu : écris un nombre de degrés, par exemple 32,5 (virgule ou point). Cette saisie ne compte pas comme une tentative.";
}

/** Réponse attendue (fragments) — écran, récapitulatif, papier, corrigé. */
export function reponse(e: E, phase: PhaseProblemesArcfonctions): Frag[] {
  const g = nomGrandeur(e, phase);
  const v = valeurAttendue(e, phase);
  if (e.variante === "reflexion-totale" && phase === "q3") {
    const L = angleLimite(e.milieu1.n, e.milieu2.n);
    return verdictRayon(e)
      ? [tx("Oui : "), lx(`${degL(e.theta1Verdict, 0)}<\\theta_L\\approx ${degL(L)}`), tx(", il existe un rayon réfracté.")]
      : [tx("Non : "), lx(`${degL(e.theta1Verdict, 0)}>\\theta_L\\approx ${degL(L)}`), tx(", réflexion totale.")];
  }
  if (e.variante === "angle-de-vue" && phase === "q2") return [lx(`x=${xOptL(e)}\\approx ${nbL(v, 2, true)}`), tx(" m")];
  if (estLongueur(e, phase)) return [lx(`${g.latex}\\approx ${nbL(v, 2, true)}`), tx(" m")];
  return [lx(`${g.latex}\\approx ${degL(v, 1, true)}`)];
}

export const recap = reponse;

export function explicationChoix(e: E, phase: PhaseProblemesArcfonctions): string {
  if (e.variante !== "reflexion-totale" || phase !== "q3") return "";
  const L = angleLimite(e.milieu1.n, e.milieu2.n);
  return verdictRayon(e)
    ? `L'incidence ${degT(e.theta1Verdict, 0)} est inférieure à l'angle limite (≈ ${degT(L)}) : le sinus calculé est inférieur à 1, un rayon réfracté existe.`
    : `L'incidence ${degT(e.theta1Verdict, 0)} dépasse l'angle limite (≈ ${degT(L)}) : le sinus calculé dépasse 1, aucun angle ne convient — réflexion totale.`;
}

