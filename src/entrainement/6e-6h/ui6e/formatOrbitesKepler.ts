import type { AideEcran, ChampEcran, DefinitionEcrans, Frag } from "../../5e-4h/ui5e/ecransTrigo.types";
import type { ExerciceKE, PhaseKE } from "../core6e/orbitesKepler";
import { aphelie, excentricite, perihelie, PHASES_KE, unite } from "../core6e/orbitesKepler";
import type { Pt } from "./outilsConiquesLotH2";
import { COULEURS, figureSchema, l, milliersL, milliersT, nL, t } from "./outilsConiquesLotH2";
import { approchee, diagnostiquer, messageIllisible, piege } from "../moteur6e/verificationOrbitesKepler";
import { correctionDetailleeKE } from "../generateurs6e/orbitesKepler/corrigeDetaille";

/**
 * Couche C — textes de `6gen141` « Orbites et ellipses : Kepler » : situation (jamais la position du corps
 * central : c'est la réponse de l'écran 2), consignes, aides à deux niveaux, réponses, schéma de l'orbite
 * (même échelle sur les deux axes ; le corps central n'est dessiné qu'une fois l'écran 2 passé).
 */

type E = ExerciceKE;

/** Vocabulaire de la situation. */
export function mots(e: E) {
  if (e.variante === "satellite") return { astre: "le satellite", central: "la Terre", centralDe: "de la Terre", proche: "périgée", loin: "apogée", nom: "T" };
  return { astre: e.variante === "comete" ? "la comète" : "l'astéroïde", central: "le Soleil", centralDe: "du Soleil", proche: "périhélie", loin: "aphélie", nom: "S" };
}

/** Longueur avec unité (LaTeX). */
export function longueurL(e: E, v: number): string {
  return `${milliersL(v)}\\text{ ${unite(e)}}`;
}
/** Longueur : nombre en KaTeX, unité en texte (« 128 millions de km »). */
export function longueurFr(e: E, v: number): Frag[] {
  return [l(milliersL(v)), t(` ${unite(e)}`)];
}

export function situation(e: E): Frag[] {
  const m = mots(e);
  if (e.variante === "satellite")
    return [
      t("Un satellite artificiel décrit autour de la Terre une orbite elliptique. Au périgée (point de l'orbite le plus proche de la Terre), il passe à "),
      ...longueurFr(e, perihelie(e) - e.R),
      t(" d'altitude au-dessus du sol ; à l'apogée (le plus éloigné), à "),
      ...longueurFr(e, aphelie(e) - e.R),
      t(". Le rayon de la Terre vaut "),
      ...longueurFr(e, e.R),
      t(". On place un repère orthonormé dont l'origine est le centre de l'orbite, l'axe des abscisses portant le grand axe, le périgée du côté des abscisses positives (unité : le kilomètre)."),
    ];
  return [
    t(e.variante === "comete" ? "Une comète décrit autour du Soleil une orbite elliptique très allongée. " : "Un astéroïde décrit autour du Soleil une orbite elliptique. "),
    t("Au périhélie (point de l'orbite le plus proche du Soleil), "),
    t(m.astre === "la comète" ? "elle" : "il"),
    t(" est à "),
    ...longueurFr(e, perihelie(e)),
    t(" du centre du Soleil ; à l'aphélie (le plus éloigné), à "),
    ...longueurFr(e, aphelie(e)),
    t(`. On place un repère orthonormé dont l'origine est le centre de l'orbite, l'axe des abscisses portant le grand axe, le périhélie du côté des abscisses positives (unité : ${e.variante === "comete" ? "l'unité astronomique, UA" : "le million de kilomètres"}).`),
  ];
}
export const consigneGenerale = situation;

// ---------------------------------------------------------------------------------------------
// Réponses
// ---------------------------------------------------------------------------------------------

export const coordCentralL = (e: E): string => `${mots(e).nom}\\left(${milliersL(e.c)}\\,;0\\right)`;

export function reponse(e: E, p: PhaseKE): Frag[] {
  if (p === "axes") return [l(`a=${milliersL(e.a)}`), t(` ${unite(e)}`), t(" et "), l(`c=${milliersL(e.c)}`), t(` ${unite(e)}`)];
  if (p === "foyer") return [l(coordCentralL(e)), t(" : un foyer de l'orbite")];
  if (p === "excentricite") return [l(`e=${nL(excentricite(e))}`)];
  return [l(`b=${milliersL(e.b)}`), t(` ${unite(e)}`)];
}
export const recap = reponse;

export function libelle(_e: E, p: PhaseKE): string {
  return { axes: "a et c", foyer: "Corps central", excentricite: "Excentricité", petitAxe: "Demi-petit axe" }[p];
}

export function consigne(e: E, p: PhaseKE): Frag[] {
  const m = mots(e);
  if (p === "axes") return [t("Calcule le demi-grand axe "), l("a"), t(" et la demi-distance focale "), l("c"), t(" de l'orbite.")];
  if (p === "foyer") return [t(`Donne les coordonnées du centre ${m.centralDe}, noté `), l(m.nom), t(", dans le repère de l'énoncé.")];
  if (p === "excentricite") return [t("Calcule l'excentricité "), l("e"), t(" de l'orbite (valeur exacte).")];
  return [t("Calcule le demi-petit axe "), l("b"), t(" de l'orbite.")];
}

export function champs(e: E, p: PhaseKE): ChampEcran[] {
  const u = unite(e);
  if (p === "axes") return [{ label: "a", labelLatex: "a=", unite: u, placeholder: "valeur exacte" }, { label: "c", labelLatex: "c=", unite: u, placeholder: "valeur exacte" }];
  if (p === "foyer") return [{ label: `Coordonnées de ${mots(e).nom}`, placeholder: "(… ; …)" }];
  if (p === "excentricite") return [{ label: "Excentricité", labelLatex: "e=", placeholder: "fraction" }];
  return [{ label: "b", labelLatex: "b=", unite: u, placeholder: "valeur exacte" }];
}

// ---------------------------------------------------------------------------------------------
// Aides
// ---------------------------------------------------------------------------------------------

export function aide1(e: E, p: PhaseKE): AideEcran {
  const m = mots(e);
  if (p === "axes") return { texte: [t(`Le ${m.proche} et l'${m.loin} sont les deux sommets du grand axe : leur distance vaut `), l("2a"), t(`. Distances au corps central : `), l("a-c"), t(" et "), l("a+c"), t(".")] };
  if (p === "foyer") return { texte: [t("Première loi de Kepler : l'orbite est une ellipse dont le corps central occupe une position remarquable — laquelle ?")] };
  if (p === "excentricite") return { texte: [t("Excentricité d'une ellipse (cours, § 2) :")], latex: "e=\\dfrac{c}{a}" };
  return { texte: [t("Relation entre les demi-axes de l'ellipse (cours, § 1) :")], latex: "b^2=a^2-c^2" };
}

export function aide2(e: E, p: PhaseKE): AideEcran | null {
  const m = mots(e);
  if (p === "axes") {
    if (e.variante === "satellite") return { texte: [t("Les distances utiles sont mesurées depuis le centre de la Terre : ajoute le rayon terrestre aux altitudes, puis "), l("a-c=q"), t(" et "), l("a+c=Q"), t(".")] };
    return { texte: [t("Ici "), l(`a-c=${milliersL(perihelie(e))}`), t(" et "), l(`a+c=${milliersL(aphelie(e))}`), t(" : additionne puis soustrais.")] };
  }
  if (p === "foyer") return { texte: [t(`Le ${m.proche}, du côté des abscisses positives, est le point de l'orbite le plus proche ${m.centralDe} : de quel côté de O se trouve ${m.central} ? Un foyer est à la distance `), l("c"), t(" du centre.")] };
  if (p === "excentricite") return { texte: [t("Ici "), l(`c=${milliersL(e.c)}`), t(" et "), l(`a=${milliersL(e.a)}`), t(" ; simplifie la fraction.")] };
  return { texte: [t("Ici "), l(`a^2=${milliersL(e.a * e.a)}`), t(" et "), l(`c^2=${milliersL(e.c * e.c)}`), t(".")] };
}

// ---------------------------------------------------------------------------------------------
// Figure
// ---------------------------------------------------------------------------------------------

/** Schéma de l'orbite ; `avecFoyer` : corps central et foyers dessinés ; `final` : demi-axes cotés. */
export function figureKE(e: E, avecFoyer: boolean, final: boolean): string {
  const m = mots(e);
  const pts: Pt[] = [];
  for (let i = 0; i <= 160; i++) {
    const a0 = (2 * Math.PI * i) / 160;
    pts.push({ x: e.a * Math.cos(a0), y: e.b * Math.sin(a0) });
  }
  const fen = { xMin: -e.a * 1.15, xMax: e.a * 1.15, yMin: -e.b * 1.25 - e.a * 0.05, yMax: e.b * 1.25 + e.a * 0.05 };
  const centralLabel = m.central === "la Terre" ? "Terre" : "Soleil";
  return figureSchema({
    fenetre: fen,
    axes: true,
    courbes: [{ points: pts, couleur: COULEURS.bleu, epaisseur: 2.2 }],
    segments: final ? [{ A: { x: 0, y: 0 }, B: { x: 0, y: e.b }, couleur: COULEURS.vert }] : [],
    points: [
      { P: { x: e.a, y: 0 }, label: m.proche, position: "ne" },
      { P: { x: -e.a, y: 0 }, label: m.loin, position: "no" },
      { P: { x: 0, y: 0 }, label: "O", position: "so" },
      ...(avecFoyer ? [{ P: { x: e.c, y: 0 }, label: centralLabel, position: "s" as const, couleur: COULEURS.accent }, { P: { x: -e.c, y: 0 }, couleur: "#9aa1ab", creux: true }] : []),
    ],
    textes: final ? [{ P: { x: e.a * 0.04, y: e.b * 0.5 }, texte: `b = ${milliersT(e.b)}`, couleur: COULEURS.vert, ancre: "start" }] : [],
  });
}

export function figure(e: E, p: PhaseKE): string {
  return figureKE(e, p === "excentricite" || p === "petitAxe", false);
}

// ---------------------------------------------------------------------------------------------
// Définition
// ---------------------------------------------------------------------------------------------

/** `6gen141` : a et c, corps central, excentricité, demi-petit axe (champs, trois tentatives). */
export const DEFINITION_KE: DefinitionEcrans<E, PhaseKE> = {
  phases: () => PHASES_KE,
  estChoix: () => false,
  mode: (e, p) => ({ type: "champs", champs: champs(e, p) }),
  libelle,
  consigneGenerale,
  figure,
  consigne,
  approchee,
  aide1,
  aide2,
  diagnostiquer,
  piege,
  messageIllisible,
  reponseAttendue: reponse,
  recap,
  correction: correctionDetailleeKE,
  apercuEnonce: (e) => [t(e.variante === "satellite" ? "Satellite : périgée " : "Orbite : périhélie "), ...longueurFr(e, perihelie(e) - e.R), t(e.variante === "satellite" ? " d'altitude, apogée " : ", aphélie "), ...longueurFr(e, aphelie(e) - e.R)],
};
