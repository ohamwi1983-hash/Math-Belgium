import type { AideEcran, ChampEcran, DefinitionEcrans, Frag, OptionEcran } from "../../5e-4h/ui5e/ecransTrigo.types";
import type { BrancheLO, ExerciceLO, PhaseLO } from "../core6e/hyperboleLoran";
import { deltaT, intersectionsRoute, PHASES_LO, positions } from "../core6e/hyperboleLoran";
import type { Pt } from "./outilsConiquesLotH2";
import { COULEURS, equationConiqueL, figureSchema, l, nL, t } from "./outilsConiquesLotH2";
import { listeL } from "./outilsLieuxLotH2";
import { approchee, diagnostiquer, messageIllisible, piege } from "../moteur6e/verificationHyperboleLoran";
import { correctionDetailleeLO } from "../generateurs6e/hyperboleLoran/corrigeDetaille";

/**
 * Couche C — textes de `6gen142` « Hyperbole de navigation : LORAN » : situation, consignes, aides à deux
 * niveaux, réponses, schéma (émetteurs et route à l'écran ; branche, hyperbole et positions une fois
 * trouvées). Source unique de l'écran, du papier et du corrigé.
 */

type E = ExerciceLO;

export const routeL = (e: E): string => (e.variante === "parallele" ? `y=${nL(e.route)}` : `x=${nL(e.route)}`);
export const equationL = (e: E): string => equationConiqueL({ type: "hyperbole", a: e.a, b: e.b });
export const second = (e: E): "A" | "B" => (e.premier === "A" ? "B" : "A");

export function situation(e: E): Frag[] {
  return [
    t("Deux émetteurs LORAN, installés sur deux îles, sont repérés par "),
    l(`A(${nL(-e.c)}\\,;0)`),
    t(" et "),
    l(`B(${nL(e.c)}\\,;0)`),
    t(" dans un repère orthonormé (unité : le kilomètre). Ils émettent un signal au même instant (simplification : en réalité, l'un d'eux émet avec un retard connu). Un navire reçoit le signal de "),
    l(e.premier),
    t(" "),
    l(`${deltaT(e)}\\ \\mu\\text{s}`),
    t(" avant celui de "),
    l(second(e)),
    t(" ; les ondes radio se propagent à "),
    l("300\\,000\\text{ km/s}"),
    t(". Le navire suit la route rectiligne d'équation "),
    l(routeL(e)),
    t("."),
  ];
}
export const consigneGenerale = situation;

// ---------------------------------------------------------------------------------------------
// Réponses
// ---------------------------------------------------------------------------------------------

export const LIBELLES_BRANCHE: Record<BrancheLO, string> = {
  A: "La branche située du côté de A (abscisses négatives)",
  B: "La branche située du côté de B (abscisses positives)",
  deux: "Les deux branches de l'hyperbole",
};

export const positionsL = (e: E): string => listeL(positions(e));

export function reponse(e: E, p: PhaseLO): Frag[] {
  if (p === "difference") return [l(`|PA-PB|=${nL(2 * e.a)}\\text{ km}`)];
  if (p === "branche") return [t(LIBELLES_BRANCHE[e.premier])];
  if (p === "equation") return [l(equationL(e))];
  return [l(positionsL(e))];
}
export const recap = reponse;

export function libelle(_e: E, p: PhaseLO): string {
  return { difference: "Différence des distances", branche: "Branche", equation: "Hyperbole", position: "Position(s) du navire" }[p];
}

export function consigne(_e: E, p: PhaseLO): Frag[] {
  if (p === "difference") return [t("On note "), l("P"), t(" la position du navire. Calcule la différence des distances "), l("|PA-PB|"), t(", en km.")];
  if (p === "branche") return [t("Sur quelle partie de l'hyperbole de foyers "), l("A"), t(" et "), l("B"), t(" se trouve le navire ?")];
  if (p === "equation") return [t("Écris l'équation réduite de cette hyperbole.")];
  return [t("Donne la ou les positions possibles du navire sur sa route (coordonnées, séparées par « ; »).")];
}

export function champs(_e: E, p: PhaseLO): ChampEcran[] {
  if (p === "difference") return [{ label: "Différence des distances", labelLatex: "|PA-PB|=", unite: "km", placeholder: "valeur" }];
  if (p === "equation") return [{ label: "Équation de l'hyperbole", placeholder: "équation en x et y" }];
  return [{ label: "Positions possibles", placeholder: "(… ; …) ; (… ; …)" }];
}

export function optionsBranche(): OptionEcran[] {
  return (["A", "B", "deux"] as BrancheLO[]).map((b) => ({ id: b, fragments: [t(LIBELLES_BRANCHE[b])] }));
}

// ---------------------------------------------------------------------------------------------
// Aides
// ---------------------------------------------------------------------------------------------

export function aide1(e: E, p: PhaseLO): AideEcran {
  if (p === "difference") return { texte: [t("Pendant le retard, le signal le plus lent parcourt la distance supplémentaire : distance = vitesse × durée. Attention aux unités (1 µs = 10⁻⁶ s).")] };
  if (p === "branche") return { texte: [t("Le signal qui arrive le premier vient de l'émetteur le plus proche du navire.")] };
  if (p === "equation") return { texte: [t("Hyperbole de foyers "), l("(\\pm c\\,;0)"), t(" (cours, § 1) : "), l("|PF-PF'|=2a"), t(" et :")], latex: "\\dfrac{x^2}{a^2}-\\dfrac{y^2}{b^2}=1,\\quad b^2=c^2-a^2" };
  return { texte: [t("Remplace "), l(e.variante === "parallele" ? "y" : "x"), t(" par "), l(nL(e.route)), t(" dans l'équation de l'hyperbole, puis garde les points de la bonne branche.")] };
}

export function aide2(e: E, p: PhaseLO): AideEcran | null {
  if (p === "difference") return { texte: [t("Ici "), l("300\\,000\\text{ km/s}=0{,}3\\text{ km/}\\mu\\text{s}"), t(" et le retard vaut "), l(`${deltaT(e)}\\ \\mu\\text{s}`), t(".")] };
  if (p === "branche") return { texte: [t("Le navire est plus proche de "), l(e.premier), t(" que de "), l(second(e)), t(" : quel signe a l'abscisse d'un tel point ?")] };
  if (p === "equation") return { texte: [t("Ici "), l(`2a=${nL(2 * e.a)}`), t(" et "), l(`c=${nL(e.c)}`), t(".")] };
  return { texte: [t("Pour "), l(routeL(e)), t(", l'équation donne deux points de l'hyperbole ; vérifie de quel côté ils sont.")] };
}

export function explicationChoix(e: E, p: PhaseLO): string {
  if (p !== "branche") return "";
  return `Le signal de ${e.premier} arrive le premier : le navire est plus proche de ${e.premier}, donc sur la seule branche située de son côté.`;
}

// ---------------------------------------------------------------------------------------------
// Figure
// ---------------------------------------------------------------------------------------------

function branche(e: E, s: number, T: number): Pt[] {
  const pts: Pt[] = [];
  for (let i = 0; i <= 100; i++) {
    const u = -T + (2 * T * i) / 100;
    pts.push({ x: s * e.a * Math.cosh(u), y: e.b * Math.sinh(u) });
  }
  return pts;
}

/** Schéma : émetteurs et route ; `avecBranche` : hyperbole (bonne branche en couleur) ; `final` : positions. */
export function figureLO(e: E, avecBranche: boolean, final: boolean): string {
  const pts = intersectionsRoute(e);
  const ext = Math.max(e.c * 1.3, ...pts.map((p) => Math.abs(p.x) * 1.15), 10);
  const extY = Math.max(e.c * 0.9, ...pts.map((p) => Math.abs(p.y) * 1.2));
  const fen = { xMin: -ext, xMax: ext, yMin: -extY, yMax: extY };
  const T = Math.asinh(extY / e.b) + 0.1;
  const route = e.variante === "parallele" ? { A: { x: -ext, y: e.route }, B: { x: ext, y: e.route } } : { A: { x: e.route, y: -extY }, B: { x: e.route, y: extY } };
  const s = e.premier === "B" ? 1 : -1;
  return figureSchema({
    fenetre: fen,
    axes: true,
    courbes: avecBranche ? [{ points: branche(e, s, T), couleur: COULEURS.accent, epaisseur: 2.6 }, { points: branche(e, -s, T), couleur: "#9aa1ab", epaisseur: 1.4, pointille: true }] : [],
    segments: [{ ...route, couleur: COULEURS.bleu, epaisseur: 1.4 }],
    points: [
      { P: { x: -e.c, y: 0 }, label: "A", position: "s" },
      { P: { x: e.c, y: 0 }, label: "B", position: "s" },
      ...(final ? pts.map((P) => ({ P, couleur: positions(e).some((q) => q.x === P.x && q.y === P.y) ? COULEURS.vert : "#9aa1ab", creux: !positions(e).some((q) => q.x === P.x && q.y === P.y) })) : []),
    ],
    textes: [{ P: { x: route.B.x - (e.variante === "parallele" ? ext * 0.02 : -ext * 0.03), y: route.B.y - extY * (e.variante === "parallele" ? 0.06 : 0.08) }, texte: "route", couleur: COULEURS.bleu, ancre: e.variante === "parallele" ? "end" : "start" }],
  });
}

export function figure(e: E, p: PhaseLO): string {
  return figureLO(e, p === "equation" || p === "position", false);
}

// ---------------------------------------------------------------------------------------------
// Définition
// ---------------------------------------------------------------------------------------------

/** `6gen142` : différence (champ), branche (choix jugé), équation (champ), positions (champ). */
export const DEFINITION_LO: DefinitionEcrans<E, PhaseLO> = {
  phases: () => PHASES_LO,
  estChoix: (_e, p) => p === "branche",
  mode: (e, p) => (p === "branche" ? { type: "choix", options: optionsBranche() } : { type: "champs", champs: champs(e, p) }),
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
  bonneOption: (e) => e.premier,
  messageIllisible,
  reponseAttendue: reponse,
  recap,
  explicationChoix,
  correction: correctionDetailleeLO,
  apercuEnonce: (e) => [t("LORAN : signal de "), l(e.premier), t(" en avance de "), l(`${deltaT(e)}\\ \\mu\\text{s}`), t(", route "), l(routeL(e))],
};

