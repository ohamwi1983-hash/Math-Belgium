import type { Exercice133, Phase133 } from "../core6e/representerConique";
import { phases133, pointsAttendus133 } from "../core6e/representerConique";
import { equationReduiteL } from "../core6e/coniquesLotH1";
import type { AideEcran, Frag } from "../../5e-4h/ui5e/ecransTrigo.types";
import type { P } from "./outilsLieuxLotH1";
import { coordL, l, nb, t } from "./outilsLieuxLotH1";
import { COULEURS } from "./outilsLieuxLotH2";
import { figureConique } from "./figureConiquesLotH1";

/**
 * Couche C — textes et figures de `6gen133` « Représenter une conique ». Le repère de l'écran est
 * vide (axes et quadrillage, jamais la courbe) ; les points déjà confirmés y restent, nommés ; une fois
 * l'écran clos, les points attendus sont entourés. Même fenêtre, même échelle qu'au corrigé (où la
 * courbe, les asymptotes ou la directrice sont tracées). Aides à deux niveaux (propriété du cours, puis
 * posée pour l'instance), jamais les coordonnées.
 */

type E = Exercice133;
type Ph = Phase133;

export function situation133(e: E): Frag[] {
  return [t("Dans un repère orthonormé, on donne la conique d'équation "), l(equationReduiteL(e.C)), t(".")];
}

export const consigneGlobale133 = (): Frag[] => [
  t("Représente-la : place son centre (pour une parabole : son sommet), ses sommets et ses foyers, puis ce qu'il faut pour tracer ses asymptotes ou sa directrice, et trace la courbe."),
];

export const consigneGenerale133 = (e: E): Frag[] => [...situation133(e), t(" "), ...consigneGlobale133()];

const LIBELLE: Record<Ph, string> = {
  centre: "Centre Ω",
  sommet: "Sommet S",
  sommetsFocaux: "Sommets sur l'axe focal",
  sommetsNonFocaux: "Sommets du petit axe",
  foyers: "Foyers",
  foyer: "Foyer F",
  rectangle: "Rectangle des asymptotes",
  piedDirectrice: "Directrice",
  cordeFocale: "Points au niveau du foyer",
};
export const libelle133 = (_e: E, p: Ph) => LIBELLE[p];

export const NOMS: Record<Ph, string[]> = {
  centre: ["Ω"],
  sommet: ["S"],
  sommetsFocaux: ["A", "A′"],
  sommetsNonFocaux: ["B", "B′"],
  foyers: ["F", "F′"],
  foyer: ["F"],
  rectangle: ["R₁", "R₂", "R₃", "R₄"],
  piedDirectrice: ["K"],
  cordeFocale: ["M", "M′"],
};
const NOMS_L: Record<Ph, string[]> = { ...NOMS, centre: ["\\Omega"], sommetsFocaux: ["A", "A'"], sommetsNonFocaux: ["B", "B'"], foyers: ["F", "F'"], rectangle: ["R_1", "R_2", "R_3", "R_4"], cordeFocale: ["M", "M'"] };

export function consigne133(e: E, p: Ph): Frag[] {
  switch (p) {
    case "centre":
      return [t("Place le centre Ω de cette conique.")];
    case "sommet":
      return [t("Place le sommet S de cette parabole.")];
    case "sommetsFocaux":
      return [t(e.C.nature === "ellipse" ? "Place les deux sommets du grand axe (axe focal)." : "Place les deux sommets de cette hyperbole.")];
    case "sommetsNonFocaux":
      return [t("Place les deux sommets du petit axe.")];
    case "foyers":
      return [t("Place les deux foyers.")];
    case "foyer":
      return [t("Place le foyer F.")];
    case "rectangle":
      return [t("Place les quatre sommets du rectangle dont les diagonales sont les asymptotes.")];
    case "piedDirectrice":
      return [t("Place le point K où la directrice d coupe l'axe focal.")];
    case "cordeFocale":
      return [t("Place les deux points de la parabole situés sur la perpendiculaire à l'axe focal passant par F.")];
  }
}

export function reponse133(e: E, p: Ph): Frag[] {
  const pts = pointsAttendus133(e, p);
  const morceaux: Frag[] = [];
  pts.forEach((q, i) => {
    if (i > 0) morceaux.push(t(" ; "));
    morceaux.push(l(`${NOMS_L[p][i] ?? ""}${coordL(q)}`));
  });
  if (p === "piedDirectrice") morceaux.push(t(" — directrice "), l(`d\\equiv ${e.C.axe === "x" ? `x=${nb(pts[0]!.x)}` : `y=${nb(pts[0]!.y)}`}`));
  return morceaux;
}

const a = (e: E) => Math.sqrt(e.C.a2);
const b = (e: E) => Math.sqrt(e.C.b2);
const axeTexte = (e: E) => (e.C.axe === "x" ? "horizontal" : "vertical");

export function aide1_133(e: E, p: Ph): AideEcran {
  switch (p) {
    case "centre":
      return { texte: [t("Cours, point 2 : dans "), l("\\dfrac{(x-h)^2}{\\ldots}\\pm\\dfrac{(y-k)^2}{\\ldots}=1"), t(", le centre est "), l("\\Omega(h\\,;k)"), t(" : on lit h et k au signe près dans les parenthèses.")] };
    case "sommet":
      return { texte: [t("Cours, point 2 : dans "), l("(y-k)^2=2p(x-h)"), t(" (ou "), l("(x-h)^2=2p(y-k)"), t("), le sommet est "), l("S(h\\,;k)"), t(".")] };
    case "sommetsFocaux":
      return { texte: [t("Cours, point 1 : les sommets de l'axe focal sont à la distance a du centre ; "), l("a^2"), t(" est le dénominateur "), t(e.C.nature === "ellipse" ? "le plus grand." : "du carré précédé du signe +.")] };
    case "sommetsNonFocaux":
      return { texte: [t("Cours, point 1 : les deux autres sommets de l'ellipse sont sur l'axe non focal, à la distance b du centre.")] };
    case "foyers":
      return { texte: [t("Cours, point 1 : les foyers sont sur l'axe focal, à la distance c du centre, avec :")], latex: e.C.nature === "ellipse" ? "c^2=a^2-b^2" : "c^2=a^2+b^2" };
    case "foyer":
      return { texte: [t("Cours, point 1 : le foyer est sur l'axe focal, à la distance "), l("\\dfrac{p}{2}"), t(" du sommet, du côté de l'ouverture.")] };
    case "rectangle":
      return { texte: [t("Cours, point 1 : le rectangle a pour centre celui de l'hyperbole ; il mesure 2a le long de l'axe focal et 2b le long de l'autre axe.")] };
    case "piedDirectrice":
      return { texte: [t("Cours, point 1 : la directrice est perpendiculaire à l'axe focal, à la distance "), l("\\dfrac{p}{2}"), t(" du sommet, du côté opposé au foyer.")] };
    case "cordeFocale":
      return { texte: [t("Cours, point 1 : un point M de la parabole est à la même distance du foyer et de la directrice. Au niveau du foyer, sa distance à la directrice vaut p.")] };
  }
}

export function aide2_133(e: E, p: Ph): AideEcran | null {
  const C = e.C;
  switch (p) {
    case "centre":
    case "sommet":
      return { texte: [t("Ici, regarde les nombres qui accompagnent x et y dans les parenthèses : "), l(equationReduiteL(C)), t(".")] };
    case "sommetsFocaux":
      return { texte: [t(`Ici, l'axe focal est ${axeTexte(e)} et `), l(`a^2=${nb(C.a2)}`), t(" : prends a et reporte-le de part et d'autre du centre.")] };
    case "sommetsNonFocaux":
      return { texte: [t("Ici, "), l(`b^2=${nb(C.b2)}`), t(" : reporte b de part et d'autre du centre, perpendiculairement à l'axe focal.")] };
    case "foyers":
      return { texte: [t("Ici, "), l(`a=${nb(a(e))}`), t(" et "), l(`b=${nb(b(e))}`), t(" : calcule c, puis reporte-le depuis le centre sur l'axe focal.")] };
    case "foyer":
    case "piedDirectrice":
      return { texte: [t("Ici, le coefficient 2p vaut "), l(nb(2 * C.p * C.sens)), t(" : calcule "), l("\\dfrac{p}{2}"), t(" et repère le sens d'ouverture avec son signe.")] };
    case "rectangle":
      return { texte: [t("Ici, "), l(`a=${nb(a(e))}`), t(" et "), l(`b=${nb(b(e))}`), t(" : les sommets du rectangle sont à ± a du centre le long de l'axe focal et à ± b le long de l'autre axe.")] };
    case "cordeFocale":
      return { texte: [t("Ici, "), l(`p=${nb(C.p)}`), t(" : reporte p de part et d'autre du foyer, perpendiculairement à l'axe focal.")] };
  }
}

// ---------------------------------------------------------------------------------------------
// Repère de placement (géométrie partagée avec `EtapePlacerPointsTrig5e` de 5gen52)
// ---------------------------------------------------------------------------------------------

export const MARGE = 18;
export const unite133 = (e: E) => Math.max(14, Math.min(24, Math.floor(330 / Math.max(e.fenetre.xMax - e.fenetre.xMin, e.fenetre.yMax - e.fenetre.yMin))));

export type StylePlace = "eleve" | "juste" | "faux" | "base" | "attendu";
const COUL: Record<StylePlace, string> = { eleve: "#1d4ed8", juste: COULEURS.vert, faux: "#b91c1c", base: COULEURS.noir, attendu: COULEURS.accent };

/** Repère de l'écran : quadrillage, points confirmés (nommés), points de l'élève, points attendus entourés. */
export function repere133(e: E, points: { P: P; style: StylePlace; label?: string }[]): string {
  return figureConique(e.C, {
    courbe: false,
    fenetre: e.fenetre,
    largeur: unite133(e) * Math.max(e.fenetre.xMax - e.fenetre.xMin, e.fenetre.yMax - e.fenetre.yMin),
    points: points.map((q) => ({ P: q.P, label: q.label, couleur: COUL[q.style], creux: q.style === "attendu" })),
  });
}

/** Points déjà confirmés avant l'écran `p` (affichés en noir, nommés). */
export function pointsConfirmes133(e: E, p: Ph): { P: P; style: StylePlace; label?: string }[] {
  const phases = phases133(e);
  return phases.slice(0, phases.indexOf(p)).flatMap((q) => pointsAttendus133(e, q).map((P, i) => ({ P, style: "base" as const, label: NOMS[q][i] })));
}

/** Figure du corrigé : courbe, éléments, asymptotes ou directrice, points de l'exercice nommés. */
export function figureCorrige133(e: E): string {
  const C = e.C;
  const pts = phases133(e).flatMap((q) => pointsAttendus133(e, q).map((P, i) => ({ P, label: NOMS[q][i], couleur: q === "foyers" || q === "foyer" ? COULEURS.accent : COULEURS.noir })));
  return figureConique(C, {
    fenetre: e.fenetre,
    asymptotes: C.nature === "hyperbole",
    rectangle: C.nature === "hyperbole",
    directrices: C.nature === "parabole",
    points: pts,
  });
}

export { phases133 };
