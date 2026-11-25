import type { StatutVerification } from "../../5e-4h/moteur/statutVerification";
import type { Frag } from "../../5e-4h/ui5e/ecransTrigo.types";
import type { ExerciceTL, PhaseTL } from "../core6e/traduireLieu";
import { cercleLieu, droitesLieu, exclus, pointsHors, pointsSur, polyLieu, raison } from "../core6e/traduireLieu";
import type { Poly, Pt } from "../ui6e/outilsLieuxLotH2";
import { dist2, evalPoly, l, polyCercle, polyDroite, droiteDeuxPoints, t } from "../ui6e/outilsLieuxLotH2";
import { equationXY, lirePoints, memeEnsemble, memesPoints, proportionnelle } from "./lectureLieuxLotH2";

/**
 * Vérification de `6gen128`. Équation LUE avant tout verdict (illisible → `parse_error`, aucune
 * tentative), comparée par proportionnalité à l'équation du lieu complet (toute écriture équivalente :
 * développée, réduite, « y = … », deux droites « … ou … ») ; une écriture qui décrit le même ensemble
 * sans être polynomiale (racine) est « à reprendre », sans tentative. Points : ensemble comparé sans
 * ordre. Choix fermés comparés à leur identifiant (une tentative).
 */

type E = ExerciceTL;

const proche = (f: (p: Pt) => number, P: Poly) => proportionnelle(f, (p) => evalPoly(P, p.x, p.y));

export function messageIllisible(_e: E, p: PhaseTL): string {
  if (p === "points") return "Points non reconnus : écris-les entre parenthèses, séparés par « ; », par exemple (1 ; 2) ; (−3 ; 0). Cette saisie ne compte pas comme une tentative.";
  return "Équation non reconnue : écris une égalité en x et y, par exemple x² + y² − 4x + 2 = 0 ou y = 2x − 1 (deux droites : x = 1 ou y = 2). Cette saisie ne compte pas comme une tentative.";
}

export function diagnostiquer(e: E, p: PhaseTL, valeurs: string[]): StatutVerification[] {
  const v = valeurs[0] ?? "";
  if (p === "nombre") return [v === `n${e.nbExclus}` ? "correct" : "not_equivalent"];
  if (p === "raison") return [v === raison(e) ? "correct" : "not_equivalent"];
  if (p === "points") {
    const pts = lirePoints(v);
    if (pts === null) return ["parse_error"];
    return [memesPoints(pts, exclus(e)) ? "correct" : "not_equivalent"];
  }
  const f = equationXY(v);
  if (!f) return ["parse_error"];
  return [proche(f, polyLieu(e)) ? "correct" : "not_equivalent"];
}

export function approchee(): string | null {
  return null;
}

export function aReprendre(e: E, p: PhaseTL, valeurs: string[]): Frag[] | null {
  if (p !== "equation") return null;
  const f = equationXY(valeurs[0] ?? "");
  if (!f || proche(f, polyLieu(e))) return null;
  if (memeEnsemble(f, pointsSur(e), pointsHors(e))) return [t("Ton équation décrit bien cet ensemble, mais écris-la sans racine ni valeur absolue (par exemple sous forme développée) : ça ne compte pas comme une tentative.")];
  return null;
}

export function piege(e: E, p: PhaseTL, valeurs: string[]): Frag[] | null {
  if (diagnostiquer(e, p, valeurs).every((s) => s === "correct")) return null;
  const v = valeurs[0] ?? "";
  if (p === "points") {
    const pts = lirePoints(v);
    if (!pts) return null;
    if (pts.length !== exclus(e).length) return [t(`Il y a ${exclus(e).length === 1 ? "un seul point" : "deux points"} à exclure.`)];
    return [t("Un point exclu est un point de l'ensemble trouvé pour lequel la figure de l'énoncé n'existe plus.")];
  }
  if (p !== "equation") return null;
  const f = equationXY(v);
  if (!f) return null;
  if (e.situation === "milieuExt" || e.situation === "corde") {
    if (proche(f, polyCercle(e.O, e.r * e.r))) return [t("C'est l'équation du cercle "), l("\\Gamma"), t(" parcouru par "), l("Q"), t(", pas celle du lieu du milieu "), l("I"), t(".")];
    const { c } = cercleLieu(e);
    if (proche(f, polyCercle(c, e.r * e.r))) return [t("Le centre est juste, mais le rayon est divisé par 2 lui aussi : l'homothétie de centre "), l("M"), t(" et de rapport "), l("\\tfrac12"), t(" réduit toutes les longueurs.")];
  }
  if (e.situation === "pythagore" || e.situation === "thales") {
    const { c } = cercleLieu(e);
    if (proche(f, polyCercle(c, dist2(e.A, e.B)))) return [t("Le rayon est la moitié de "), l("AB"), t(" : "), l("[AB]"), t(" est un diamètre du cercle.")];
  }
  if (e.situation === "mediatrice" || e.situation === "isocele") {
    if (proche(f, polyDroite(droiteDeuxPoints(e.A, e.B)))) return [t("C'est la droite "), l("(AB)"), t(" : le point cherché est à la même distance de "), l("A"), t(" et de "), l("B"), t(".")];
  }
  const ds = droitesLieu(e);
  if (ds.length === 2) {
    for (const d of ds) if (proche(f, polyDroite(d))) return [t("Une seule des deux droites : il en manque une (la condition donne deux équations).")];
  }
  return null;
}
