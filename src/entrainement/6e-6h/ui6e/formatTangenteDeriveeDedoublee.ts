import type { AideEcran, ChampEcran, DefinitionEcrans, Frag, OptionEcran } from "../../5e-4h/ui5e/ecransTrigo.types";
import type { ExerciceTD, OptionTD, PhaseTD } from "../core6e/tangenteDeriveeDedoublee";
import { branche, PHASES_TD, pente, tangenteP, tangenteQ } from "../core6e/tangenteDeriveeDedoublee";
import type { Pt } from "./outilsConiquesLotH2";
import { branchesConique, COULEURS, coefL, coordL, equationConiqueL, fenetrePoints, figureConiqueRepere, l, nL, t } from "./outilsConiquesLotH2";
import { droiteL } from "./outilsLieuxLotH2";
import { diagnostiquer, messageIllisible, approchee, piege } from "../moteur6e/verificationTangenteDeriveeDedoublee";
import { correctionDetailleeTD } from "../generateurs6e/tangenteDeriveeDedoublee/corrigeDetaille";

/**
 * Couche C — textes de `6gen138` « Tangente par la dérivée et forme dédoublée » : énoncé, consignes des
 * quatre écrans, fonctions proposées, aides à deux niveaux, réponses, figure (conique, P et Q ; tangente
 * en P ajoutée une fois trouvée). Source unique de l'écran, du papier et du corrigé.
 */

type E = ExerciceTD;

export const nomConique = (e: E): string => ({ ellipse: "l'ellipse", hyperbole: "l'hyperbole", parabole: "la parabole" })[e.variante];

export function situation(e: E): Frag[] {
  return [t("Dans un repère orthonormé, on donne "), t(nomConique(e)), t(" "), l(`\\Gamma:\\ ${equationConiqueL(e.conique)}`), t(" et ses points "), l(`P${coordL(e.P)}`), t(" et "), l(`Q${coordL(e.Q)}`), t(".")];
}
export const consigneGenerale = situation;

// ---------------------------------------------------------------------------------------------
// Fonctions de l'écran 1
// ---------------------------------------------------------------------------------------------

/** f(x) sans signe, en LaTeX : la bonne formule ou la formule fausse (leurre). */
export function fL(e: E, leurre = false): string {
  const c = e.conique;
  if (c.type === "parabole") return leurre ? `\\sqrt{${c.p === 1 ? "" : nL(c.p)}x}` : `\\sqrt{${nL(2 * c.p)}x}`;
  const a2 = c.a * c.a;
  const b2 = c.b * c.b;
  if (c.type === "ellipse") return leurre ? `${coefL(c.a / c.b)}\\sqrt{${b2}-x^2}` : `${coefL(c.b / c.a)}\\sqrt{${a2}-x^2}`;
  return leurre ? `${coefL(c.b / c.a)}\\sqrt{${a2}-x^2}` : `${coefL(c.b / c.a)}\\sqrt{x^2-${a2}}`;
}

export function optionL(e: E, o: OptionTD): string {
  const signe = o === "bas" || o === "leurreBas" ? "-" : "";
  return `y=${signe}${fL(e, o.startsWith("leurre"))}`;
}

export function optionsBranche(e: E): OptionEcran[] {
  return e.options.map((o) => ({ id: o, fragments: [l(optionL(e, o))] }));
}

// ---------------------------------------------------------------------------------------------
// Réponses
// ---------------------------------------------------------------------------------------------

export const tangentePL = (e: E): string => droiteL(tangenteP(e));
export const tangenteQL = (e: E): string => (e.qSommet ? `x=${nL(e.Q.x)}` : droiteL(tangenteQ(e)));

export function reponse(e: E, p: PhaseTD): Frag[] {
  if (p === "branche") return [l(optionL(e, branche(e)))];
  if (p === "pente") return [l(`f'(x_P)=${nL(pente(e))}`)];
  if (p === "tangente") return [l(tangentePL(e))];
  return [l(tangenteQL(e))];
}
export const recap = reponse;

export function libelle(_e: E, p: PhaseTD): string {
  return { branche: "Fonction qui contient P", pente: "Pente en P", tangente: "Tangente en P", dedoublee: "Tangente en Q" }[p];
}

export function consigne(_e: E, p: PhaseTD): Frag[] {
  if (p === "branche") return [t("La conique "), l("\\Gamma"), t(" est la réunion de deux graphiques de fonctions. Sur le graphique de quelle fonction se trouve le point "), l("P"), t(" ?")];
  if (p === "pente") return [t("Calcule la pente de la tangente à "), l("\\Gamma"), t(" en "), l("P"), t(", c'est-à-dire "), l("f'(x_P)"), t(" pour la fonction choisie.")];
  if (p === "tangente") return [t("Écris une équation de la tangente à "), l("\\Gamma"), t(" en "), l("P"), t(".")];
  return [t("Écris, par la forme dédoublée, une équation de la tangente à "), l("\\Gamma"), t(" en "), l("Q"), t(".")];
}

export function champs(_e: E, p: PhaseTD): ChampEcran[] {
  if (p === "pente") return [{ label: "Pente f′(x_P)", labelLatex: "f'(x_P)=", placeholder: "valeur exacte" }];
  if (p === "tangente") return [{ label: "Tangente en P", placeholder: "équation en x et y" }];
  return [{ label: "Tangente en Q", placeholder: "équation en x et y" }];
}

// ---------------------------------------------------------------------------------------------
// Aides
// ---------------------------------------------------------------------------------------------

/** Dérivée de la branche supérieure, en LaTeX (aide 2 de l'écran 2). */
export function deriveeL(e: E): string {
  const c = e.conique;
  if (c.type === "parabole") return `f'(x)=\\dfrac{${nL(2 * c.p)}}{2\\sqrt{${nL(2 * c.p)}x}}=\\dfrac{${nL(c.p)}}{\\sqrt{${nL(2 * c.p)}x}}`;
  const k = coefL(c.b / c.a);
  if (c.type === "ellipse") return `f'(x)=${k}\\cdot\\dfrac{-2x}{2\\sqrt{${c.a * c.a}-x^2}}=-${k}\\dfrac{x}{\\sqrt{${c.a * c.a}-x^2}}`;
  return `f'(x)=${k}\\cdot\\dfrac{2x}{2\\sqrt{x^2-${c.a * c.a}}}=${k}\\dfrac{x}{\\sqrt{x^2-${c.a * c.a}}}`;
}

/** Forme dédoublée générale de la conique (aide 1 de l'écran 4). */
export function dedoubleeGeneraleL(e: E): string {
  const c = e.conique;
  if (c.type === "parabole") return "y\\,y_Q=p\\,(x+x_Q)";
  return c.type === "ellipse" ? "\\dfrac{x\\,x_Q}{a^2}+\\dfrac{y\\,y_Q}{b^2}=1" : "\\dfrac{x\\,x_Q}{a^2}-\\dfrac{y\\,y_Q}{b^2}=1";
}

export function aide1(e: E, p: PhaseTD): AideEcran {
  if (p === "branche") return { texte: [t("Isole "), l("y"), t(" dans l'équation de "), l("\\Gamma"), t(" : tu obtiens deux fonctions opposées, "), l("y=f(x)"), t(" et "), l("y=-f(x)"), t(". Celle qui contient "), l("P"), t(" a le signe de "), l("y_P"), t(".")] };
  if (p === "pente") return { texte: [t("Dérive la fonction choisie (cours, point 5) ; pour une racine :")], latex: "\\left(\\sqrt{u}\\right)'=\\dfrac{u'}{2\\sqrt{u}}" };
  if (p === "tangente") return { texte: [t("Droite de pente "), l("m"), t(" passant par "), l("P"), t(" :")], latex: "y-y_P=m\\,(x-x_P)" };
  return { texte: [t("Forme dédoublée (cours, point 5) : dans l'équation de "), l("\\Gamma"), t(", remplace "), l("x^2"), t(" par "), l("x\\,x_Q"), t(", "), l("y^2"), t(" par "), l("y\\,y_Q"), t(" et "), l("x"), t(" par "), l("\\dfrac{x+x_Q}{2}"), t(" :")], latex: dedoubleeGeneraleL(e) };
}

export function aide2(e: E, p: PhaseTD): AideEcran | null {
  const c = e.conique;
  if (p === "branche") return { texte: [t("Ici "), l(`y_P=${nL(e.P.y)}`), t(e.P.y > 0 ? " est positif." : " est négatif."), t(" Vérifie aussi que la formule vient bien de l'équation de "), l("\\Gamma"), t(".")] };
  if (p === "pente") return { texte: [t(e.P.y > 0 ? "Pour la branche supérieure :" : "Pour la branche inférieure, c'est l'opposé de :")], latex: deriveeL(e) };
  if (p === "tangente") return { texte: [t("Ici "), l(`x_P=${nL(e.P.x)}`), t(" et "), l(`y_P=${nL(e.P.y)}`), t(" ; "), l("m"), t(" est la pente trouvée à l'écran précédent.")] };
  const val = [t("Ici "), l(`x_Q=${nL(e.Q.x)}`), t(" et "), l(`y_Q=${nL(e.Q.y)}`)];
  if (c.type === "parabole") return { texte: [...val, t(" et "), l(`p=${nL(c.p)}`), t(" (car "), l(`2p=${nL(2 * c.p)}`), t(").")] };
  return { texte: [...val, t(" ; "), l(`a^2=${c.a * c.a}`), t(" et "), l(`b^2=${c.b * c.b}`), t(".")] };
}

export function explicationChoix(e: E, p: PhaseTD): string {
  if (p !== "branche") return "";
  return e.P.y > 0 ? "P a une ordonnée positive : il est sur la branche y = f(x), au-dessus de l'axe des abscisses." : "P a une ordonnée négative : il est sur la branche y = −f(x), sous l'axe des abscisses.";
}

// ---------------------------------------------------------------------------------------------
// Figure
// ---------------------------------------------------------------------------------------------

export function fenetreTD(e: E) {
  const c = e.conique;
  const cadre: Pt[] = [e.P, e.Q];
  if (c.type === "parabole") cadre.push({ x: -1, y: 0 }, { x: Math.max(4, e.P.x, e.Q.x), y: 0 });
  else cadre.push({ x: c.a, y: c.b }, { x: -c.a, y: -c.b });
  return fenetrePoints(cadre, 1, 8);
}

/** Figure : conique, P, Q ; `tanP` / `tanQ` : tangentes ajoutées (corrigé, écran suivant). */
export function figureTD(e: E, tanP: boolean, tanQ: boolean): string {
  const fen = fenetreTD(e);
  return figureConiqueRepere({
    fenetre: fen,
    courbes: branchesConique(e.conique, fen).map((points) => ({ points, couleur: COULEURS.bleu })),
    droites: [...(tanP ? [{ d: tangenteP(e), couleur: COULEURS.accent }] : []), ...(tanQ ? [{ d: tangenteQ(e), couleur: COULEURS.vert }] : [])],
    points: [
      { P: e.P, label: "P", position: e.P.y > 0 ? "ne" : "se", couleur: COULEURS.accent },
      { P: e.Q, label: "Q", position: e.Q.y >= 0 ? "no" : "so", couleur: COULEURS.vert },
    ],
  });
}

export function figure(e: E, p: PhaseTD): string {
  return figureTD(e, p === "dedoublee", false);
}

// ---------------------------------------------------------------------------------------------
// Définition
// ---------------------------------------------------------------------------------------------

/** `6gen138` : fonction qui contient P (choix jugé), pente, tangente en P, tangente en Q (champs). */
export const DEFINITION_TD: DefinitionEcrans<E, PhaseTD> = {
  phases: () => PHASES_TD,
  estChoix: (_e, p) => p === "branche",
  mode: (e, p) => (p === "branche" ? { type: "choix", options: optionsBranche(e) } : { type: "champs", champs: champs(e, p) }),
  libelle,
  consigneGenerale,
  figure,
  consigne,
  approchee,
  aide1,
  aide2,
  diagnostiquer,
  piege,
  piegeChoixRevele: true,
  bonneOption: (e) => branche(e),
  messageIllisible,
  reponseAttendue: reponse,
  recap,
  explicationChoix,
  correction: correctionDetailleeTD,
  apercuEnonce: (e) => [l(`\\Gamma:\\ ${equationConiqueL(e.conique)}`), t(" ; tangentes en P et en Q")],
};
