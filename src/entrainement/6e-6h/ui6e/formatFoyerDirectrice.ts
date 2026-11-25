import type { Exercice135, Phase135 } from "../core6e/foyerDirectrice";
import { conique135, eVal, phases135, pied135, poly135, sommet135, verticale } from "../core6e/foyerDirectrice";
import type { AideEcran, ChampEcran, Frag, OptionEcran } from "../../5e-4h/ui5e/ecransTrigo.types";
import { ILLISIBLE, coordL, l, nb, t } from "./outilsLieuxLotH1";
import { COULEURS, equationPolyL, normaliserPoly } from "./outilsLieuxLotH2";
import { figureConique } from "./figureConiquesLotH1";
import { apercuLibre } from "../moteur6e/saisieConiquesLotH1";

/**
 * Couche C — textes de `6gen135` « Équation depuis foyer, directrice et excentricité » : énoncé
 * (F, d, e), options de nature (ordre FIXE), aides à deux niveaux (caractérisation focale du cours, puis
 * posée pour l'instance — jamais l'équation), réponses ; figure à l'écran : F et d seuls (la courbe
 * trahirait la nature) ; au corrigé : la conique, F, d et le sommet S.
 */

type E = Exercice135;
type Ph = Phase135;

export const eL = (e: E) => (e.den === 1 ? nb(e.num) : `\\dfrac{${e.num}}{${e.den}}`);
export const directriceL135 = (e: E) => `d\\equiv ${verticale(e) ? "x" : "y"}=${nb(e.k)}`;

export function situation135(e: E): Frag[] {
  return [t("Dans un repère orthonormé, on donne le point "), l(`F${coordL(e.F)}`), t(", la droite "), l(directriceL135(e)), t(" et le nombre "), l(`e=${eL(e)}`), t(". On considère la conique de foyer F, de directrice d et d'excentricité e.")];
}

export const consigneGlobale135 = (): Frag[] => [t("Donne la nature de cette conique, établis une équation cartésienne de cette conique, puis donne les coordonnées de son sommet situé entre F et d.")];
export const consigneGenerale135 = (e: E): Frag[] => [...situation135(e), t(" "), ...consigneGlobale135()];

const LIBELLE: Record<Ph, string> = { nature: "Nature", equation: "Équation cartésienne", sommet: "Sommet entre F et d" };
export const libelle135 = (_e: E, p: Ph) => LIBELLE[p];

export function consigne135(_e: E, p: Ph): Frag[] {
  if (p === "nature") return [t("Quelle est la nature de cette conique ?")];
  if (p === "equation") return [t("Établis une équation cartésienne de cette conique (une forme développée ou toute forme équivalente).")];
  return [t("Donne les coordonnées du sommet S de la conique situé entre F et d (sur la perpendiculaire à d issue de F).")];
}

export const estChoix135 = (_e: E, p: Ph) => p === "nature";
export const options135 = (): OptionEcran[] => [
  { id: "ellipse", fragments: [t("Une ellipse.")] },
  { id: "parabole", fragments: [t("Une parabole.")] },
  { id: "hyperbole", fragments: [t("Une hyperbole.")] },
];
export const bonneOption135 = (e: E) => e.nature;

export function champs135(_e: E, p: Ph): ChampEcran[] {
  if (p === "equation") return [{ label: "Équation cartésienne", placeholder: "équation en x et y, avec « = »", apercuLatex: apercuLibre }];
  if (p === "sommet") return [{ label: "Sommet S", labelLatex: "S=", placeholder: "(… ; …)", apercuLatex: apercuLibre }];
  return [];
}

export function messageIllisible135(_e: E, p: Ph): string {
  if (p === "sommet") return ILLISIBLE.point;
  return "Équation non reconnue : écris une équation en x et y avec « = », par exemple 3x² + 4y² − 6x + 2 = 0 (tape ² ou ^2). Cette saisie ne compte pas comme une tentative.";
}

export const equation135L = (e: E) => equationPolyL(normaliserPoly(poly135(e)));

export function reponse135(e: E, p: Ph): Frag[] {
  if (p === "nature") return [t(`C'est une ${e.nature} (`), l(`e=${eL(e)}${e.nature === "ellipse" ? "<1" : e.nature === "parabole" ? "=1" : ">1"}`), t(").")];
  if (p === "equation") return [l(equation135L(e))];
  return [l(`S${coordL(sommet135(e))}`)];
}

export const recap135 = reponse135;

export function aide1_135(_e: E, p: Ph): AideEcran {
  if (p === "nature") return { texte: [t("Cours, § 2 : 0 < e < 1 → ellipse ; e = 1 → parabole ; e > 1 → hyperbole.")] };
  if (p === "equation") return { texte: [t("Cours, § 2 : un point P(x ; y) est sur la conique si et seulement si "), l("|PF|=e\\cdot\\text{dist}(P\\,;d)"), t(" ; élève au carré (deux membres positifs) :")], latex: "|PF|^2=e^2\\cdot\\text{dist}(P\\,;d)^2" };
  return { texte: [t("Cours, § 2 : le sommet S est sur la perpendiculaire à d issue de F ; comme il est sur la conique, "), l("|SF|=e\\cdot|SH|"), t(", où H est le pied de cette perpendiculaire.")] };
}

export function aide2_135(e: E, p: Ph): AideEcran | null {
  if (p === "nature") return { texte: [t("Ici, compare "), l(`e=${eL(e)}`), t(" à 1.")] };
  if (p === "equation")
    return {
      texte: [t("Ici, "), l(`|PF|^2=(x${e.F.x > 0 ? "-" : "+"}${nb(Math.abs(e.F.x))})^2+(y${e.F.y > 0 ? "-" : "+"}${nb(Math.abs(e.F.y))})^2`), t(" ; la directrice est "), t(verticale(e) ? "verticale, donc la distance de P à d ne dépend que de x" : "horizontale, donc la distance de P à d ne dépend que de y"), t(". N'oublie pas d'élever e au carré.")],
    };
  const H = pied135(e);
  return { texte: [t("Ici, "), l(`H${coordL(H)}`), t(" : S est sur le segment [FH] et partage ce segment dans le rapport "), l("\\dfrac{|SF|}{|SH|}=e"), t(".")] };
}

/** Figure de l'écran : F et d seulement. */
export function figure135(e: E): string {
  const H = pied135(e);
  const fenetre = {
    xMin: Math.min(e.F.x, H.x, 0) - 3,
    xMax: Math.max(e.F.x, H.x, 0) + 3,
    yMin: Math.min(e.F.y, H.y, 0) - 3,
    yMax: Math.max(e.F.y, H.y, 0) + 3,
  };
  return figureConique(conique135(e), { courbe: false, fenetre, points: [{ P: e.F, label: "F", couleur: COULEURS.accent }], droites: directriceDonnee(e) });
}

/** La directrice d donnée (une seule, même si la conique centrée en a deux). */
const directriceDonnee = (e: E) => [{ d: verticale(e) ? { a: 1, b: 0, c: -e.k } : { a: 0, b: 1, c: -e.k }, label: "d", couleur: COULEURS.gris, pointille: true }];

/** Figure du corrigé : la conique, F, d, S. */
export function figureCorrige135(e: E): string {
  const C = conique135(e);
  return figureConique(C, { points: [{ P: e.F, label: "F", couleur: COULEURS.accent }, { P: sommet135(e), label: "S", couleur: COULEURS.noir }], cadre: [e.F, pied135(e)], droites: directriceDonnee(e) });
}

export { phases135, eVal };
