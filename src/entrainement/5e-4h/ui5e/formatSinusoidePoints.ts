import type { FragmentConsigne } from "../../export/genererFeuilleExercices";
import { souderPonctuation } from "../../4e/ui/formatDetectiveVecteurs";
import { omegaEnLigne, piLatex, ratLatex, type Rat } from "../moteur5e/trigExact";
import { expressionLatex, omegaLatex } from "../moteur5e/sinusoideExacte";
import { Phi, T, cadre, pointsPeriode, pointsReport, quart, sinusoide, xColonne, type ExerciceSinusoidePoints, type PointCle } from "../moteur5e/modeleSinusoidePoints";

/**
 * Textes de 5gen52 « Construire une sinusoïde point par point » (écran ET papier). Notation du cours
 * (§ 4) : A, b, ω, φ, T = 2π/ω, Φ = −φ/ω ; méthode : y = b, une période partagée en 4 à partir de
 * Φ, ordre b, max, b, min, b (min d'abord si A < 0), puis report.
 */

type Fragments = FragmentConsigne[];
type E = ExerciceSinusoidePoints;
const t = (valeur: string): FragmentConsigne => ({ type: "texte", valeur });
const l = (valeur: string): FragmentConsigne => ({ type: "latex", valeur });

export { souderPonctuation };

export const TITRES_ECRANS = ["Les paramètres A, b, T, Φ", "Une période à partir de Φ", "Prolonger la courbe"];

export const CONSIGNE_GENERALE = "Construis la courbe de f point par point, avec la méthode du cours.";

/** Abscisse exacte (multiple de π ou rationnel). */
export function xLatex(e: E, x: Rat): string {
  return e.enPi ? piLatex(x) : ratLatex(x);
}

export function fonctionLatex(e: E): string {
  return expressionLatex(sinusoide(e));
}

export function intervalleLatex(e: E): string {
  const c = cadre(e);
  return `\\left[${xLatex(e, c.xMin)}\\,;\\,${xLatex(e, xColonne(c, c.colonnes))}\\right]`;
}

export function enonceExercice(e: E): Fragments {
  return souderPonctuation([t("On donne "), l(fonctionLatex(e)), t(", à représenter sur "), l(intervalleLatex(e)), t(".")]);
}

export function consignePapier(e: E): Fragments {
  return souderPonctuation([
    t("Donne "),
    l("A"),
    t(", "),
    l("b"),
    t(", la période "),
    l("T"),
    t(" et le décalage horizontal "),
    l("\\Phi"),
    t(" ; place les cinq points d'une période à partir de "),
    l("\\Phi"),
    t(", puis prolonge la courbe sur "),
    l(intervalleLatex(e)),
    t("."),
  ]);
}

export function consignesEcrans(e: E): Fragments[] {
  return [
    souderPonctuation([t("Donne l'amplitude "), l("A"), t(" (avec son signe), le décalage vertical "), l("b"), t(", la période "), l("T"), t(" et le décalage horizontal "), l("\\Phi"), t(".")]),
    souderPonctuation([t("Place les cinq points d'une période, à partir de "), l(`\\Phi = ${xLatex(e, Phi(e))}`), t(".")]),
    souderPonctuation([t("Prolonge la courbe sur "), l(intervalleLatex(e)), t(" : place les quatre points clés qui manquent, par périodicité.")]),
  ];
}

// ---------------------------------------------------------------------------------------------
// Réponses
// ---------------------------------------------------------------------------------------------

export function reponseParametres(e: E): Fragments {
  return [l(`A = ${e.A}`), t(", "), l(`b = ${e.b}`), t(", "), l(`T = ${xLatex(e, T(e))}`), t(", "), l(`\\Phi = ${xLatex(e, Phi(e))}`)];
}

export function pointLatex(e: E, p: PointCle): string {
  return `\\left(${xLatex(e, p.x)}\\,;\\,${p.y}\\right)`;
}

/** Liste de points, une formule par point (la liste passe à la ligne entre deux points). */
export function listePoints(e: E, pts: PointCle[]): Fragments {
  return pts.flatMap((p, k) => (k === 0 ? [l(pointLatex(e, p))] : [t(" ; "), l(pointLatex(e, p))]));
}

export function reponsePeriode(e: E): Fragments {
  return listePoints(e, pointsPeriode(e));
}

export function reponseReport(e: E): Fragments {
  return listePoints(e, pointsReport(e));
}

export function reponsesEcrans(e: E): Fragments[] {
  return [reponseParametres(e), reponsePeriode(e), reponseReport(e)];
}

// ---------------------------------------------------------------------------------------------
// Aides (deux niveaux ; jamais la réponse)
// ---------------------------------------------------------------------------------------------

export function aidesEcran(e: E, ecran: number): Fragments[] {
  const s = sinusoide(e);
  const w = omegaLatex(s);
  if (ecran === 0)
    return [
      [t("Dans "), l("f(x) = A\\sin(\\omega x + \\varphi) + b"), t(" : "), l("A"), t(" est le coefficient devant le sinus, "), l("b"), t(" le terme ajouté, "), l("T = \\dfrac{2\\pi}{\\omega}"), t(" et "), l("\\Phi = -\\dfrac{\\varphi}{\\omega}"), t(" (cours, point 4).")],
      souderPonctuation([t("Ici "), l(`\\omega = ${w}`), t(" et "), l(`\\varphi = ${piLatex(e.phi)}`), t(" : remplace-les dans "), l("T = \\dfrac{2\\pi}{\\omega}"), t(" et dans "), l("\\Phi = -\\dfrac{\\varphi}{\\omega}"), t(".")]),
    ];
  if (ecran === 1)
    return [
      [t("À partir de "), l("\\Phi"), t(", partage une période en 4 : abscisses "), l("\\Phi"), t(", "), l("\\Phi + \\dfrac{T}{4}"), t(", "), l("\\Phi + \\dfrac{T}{2}"), t(", "), l("\\Phi + \\dfrac{3T}{4}"), t(", "), l("\\Phi + T"), t(" ; ordonnées "), l("b"), t(", "), l("b + A"), t(", "), l("b"), t(", "), l("b - A"), t(", "), l("b"), t(".")],
      souderPonctuation([
        t("Ici "),
        l(`\\dfrac{T}{4} = ${xLatex(e, quart(e))}`),
        t(" : les abscisses avancent d'un quart de période à partir de "),
        l(xLatex(e, Phi(e))),
        t(". La ligne moyenne est "),
        l(`y = ${e.b}`),
        t(e.A > 0 ? " et la courbe monte d'abord (" : " et la courbe descend d'abord ("),
        l(e.A > 0 ? "A > 0" : "A < 0"),
        t(e.A > 0 ? ") : le premier extremum est un maximum." : ") : le premier extremum est un minimum."),
      ]),
    ];
  return [
    [t("La courbe se répète tous les "), l("T"), t(" : ajoute ou retire "), l("T"), t(" aux abscisses des points de la période, les ordonnées restent les mêmes.")],
    souderPonctuation([t("Ici "), l(`T = ${xLatex(e, T(e))}`), t(" : il manque les points d'abscisses "), l("\\Phi - \\dfrac{T}{2}"), t(", "), l("\\Phi - \\dfrac{T}{4}"), t(", "), l("\\Phi + \\dfrac{5T}{4}"), t(" et "), l("\\Phi + \\dfrac{3T}{2}"), t(".")]),
  ];
}

export function aideSaisie(): string {
  return "Écris des valeurs exactes, par exemple 3π/2, −π/8 ou 1/2 (bouton π ou « pi »).";
}

// ---------------------------------------------------------------------------------------------
// Messages ciblés
// ---------------------------------------------------------------------------------------------

export const MSG_T_OMEGA: Fragments = [t("La période n'est pas "), l("\\omega"), t(" : "), l("T = \\dfrac{2\\pi}{\\omega}"), t(".")];
export const MSG_T_PRODUIT: Fragments = [t("On divise par "), l("\\omega"), t(" : "), l("T = \\dfrac{2\\pi}{\\omega}"), t(".")];
export const MSG_T_DEMI: Fragments = [t("Un tour complet mesure "), l("2\\pi"), t(" : "), l("T = \\dfrac{2\\pi}{\\omega}"), t(".")];
export const MSG_PHI_PHI: Fragments = [t("Le décalage horizontal n'est pas "), l("\\varphi"), t(" : "), l("\\Phi = -\\dfrac{\\varphi}{\\omega}"), t(".")];
export const MSG_PHI_SIGNE: Fragments = [t("Attention au signe : "), l("\\Phi = -\\dfrac{\\varphi}{\\omega}"), t(".")];
export const MSG_A_SIGNE: Fragments = [l("A"), t(" garde son signe : c'est le coefficient écrit devant le sinus.")];
export const MSG_B_SIGNE: Fragments = [l("b"), t(" est le terme ajouté au sinus, avec son signe.")];

export const MSG_ORDRE_NEG: Fragments = [t("Avec "), l("A < 0"), t(", la courbe est retournée : à partir de "), l("\\Phi"), t(", elle passe par le minimum avant le maximum.")];
export const MSG_ORDRE_POS: Fragments = [t("Avec "), l("A > 0"), t(", à partir de "), l("\\Phi"), t(", la courbe monte : le maximum vient avant le minimum.")];
export const MSG_ORDONNEES: Fragments = [t("Les abscisses sont justes ; revois les ordonnées : "), l("b"), t(", "), l("b + A"), t(", "), l("b"), t(", "), l("b - A"), t(", "), l("b"), t(".")];
export const MSG_DEPART: Fragments = [t("La période commence en "), l("x = \\Phi"), t(", pas en 0.")];
export const MSG_PAS: Fragments = [t("Deux points consécutifs sont séparés d'un quart de période, "), l("\\dfrac{T}{4}"), t(".")];
export const MSG_AUTRE_PERIODE: Fragments = [t("Ces points sont bien sur la courbe, mais la période demandée commence en "), l("x = \\Phi"), t(".")];
export const MSG_PAS_SUR_COURBE: Fragments = [t("Un point n'est pas sur la courbe : reporte un point de la période en ajoutant ou en retirant "), l("T"), t(" à son abscisse.")];

/** ω « en ligne » pour les fractions du corrigé. */
export function omegaTexte(e: E): string {
  return e.enPi ? omegaEnLigne(e.omega) : e.omega.n === 1 && e.omega.d === 1 ? "\\pi" : `${e.omega.n === 1 ? "" : e.omega.n}\\pi${e.omega.d === 1 ? "" : `/${e.omega.d}`}`;
}
