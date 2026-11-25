import type { StatutVerification } from "../../5e-4h/moteur/statutVerification";
import type { Frag } from "../../5e-4h/ui5e/ecransTrigo.types";
import type { ExerciceLC, PhaseLC } from "../core6e/lieuxContexte";
import { coordonnees, ecranCoordonnees, extremites, generatrice, generatriceDonnee, nature, parametre, polyLieu } from "../core6e/lieuxContexte";
import type { Pt } from "../ui6e/outilsLieuxLotH2";
import { evalPoly, l, t } from "../ui6e/outilsLieuxLotH2";
import { egalNum, equationXY, lireExpression, lirePoints, memesPoints, proportionnelle } from "./lectureLieuxLotH2";

/**
 * Vérification de `6gen130`. Tout est LU avant tout verdict (illisible → `parse_error`, aucune
 * tentative). Coordonnées en fonction du paramètre : comparées en quatre valeurs (toute écriture
 * équivalente : « √(100 − a²)/2 », « √(25 − a²/4) »…), champ par champ. Génératrice en m : droite
 * comparée par proportionnalité pour quatre valeurs de m (« y = −(x − 3)/m », « x + my − 3 = 0 »…).
 * Lieu complet : par proportionnalité. Extrémités : ensemble de points sans ordre.
 */

type E = ExerciceLC;

const VALEURS_M = [0.37, 2.3, 3.7, 0.81];
const valeursParam = (e: E): number[] => (e.variante === "echelle" ? [0.6, 1.7, 0.55 * e.L, 0.83 * e.L] : [-1.3, 0.4, 2.1, 0.77]);

export function messageIllisible(e: E, p: PhaseLC): string {
  if (p === "parametre" && ecranCoordonnees(e)) return `Expression non reconnue : écris une expression en ${parametre(e)}, par exemple ${e.variante === "echelle" ? "a/2 ou √(36 − a²)/2" : "1 + t ou (4 + 3t)/3"}. Cette saisie ne compte pas comme une tentative.`;
  if (p === "parametre") return "Équation non reconnue : écris une égalité en x, y et m, par exemple y = −(x − 3)/m ou x + m(y − 2) = 0. Cette saisie ne compte pas comme une tentative.";
  if (p === "extremites") return "Points non reconnus : écris-les entre parenthèses, séparés par « ; », par exemple (3 ; 0) ; (0 ; 3). Cette saisie ne compte pas comme une tentative.";
  return "Équation non reconnue : écris une égalité en x et y, par exemple x² + y² = 9 ou 2x − y + 1 = 0. Cette saisie ne compte pas comme une tentative.";
}

function statutCoordonnee(e: E, saisie: string, axe: "x" | "y"): StatutVerification {
  const f = lireExpression(saisie, parametre(e));
  if (!f) return "parse_error";
  return valeursParam(e).every((s) => egalNum(f(s), coordonnees(e, s)[axe], 1e-7)) ? "correct" : "not_equivalent";
}

function generatriceJuste(e: E, saisie: string): StatutVerification {
  const f0 = equationXY(saisie, { m: 1.1 });
  if (!f0) return "parse_error";
  for (const m of VALEURS_M) {
    const f = equationXY(saisie, { m });
    if (!f) return "parse_error";
    const d = generatrice(e, m);
    if (!proportionnelle(f, (p) => d.a * p.x + d.b * p.y + d.c)) return "not_equivalent";
  }
  return "correct";
}

export function diagnostiquer(e: E, p: PhaseLC, valeurs: string[]): StatutVerification[] {
  if (p === "nature") return [valeurs[0] === nature(e) ? "correct" : "not_equivalent"];
  if (p === "parametre") {
    if (ecranCoordonnees(e)) return [statutCoordonnee(e, valeurs[0] ?? "", "x"), statutCoordonnee(e, valeurs[1] ?? "", "y")];
    return [generatriceJuste(e, valeurs[0] ?? "")];
  }
  if (p === "extremites") {
    const pts = lirePoints(valeurs[0] ?? "");
    if (pts === null) return ["parse_error"];
    return [memesPoints(pts, extremites(e)) ? "correct" : "not_equivalent"];
  }
  const f = equationXY(valeurs[0] ?? "");
  if (!f) return ["parse_error"];
  const P = polyLieu(e);
  return [proportionnelle(f, (q) => evalPoly(P, q.x, q.y)) ? "correct" : "not_equivalent"];
}

export function piege(e: E, p: PhaseLC, valeurs: string[]): Frag[] | null {
  if (diagnostiquer(e, p, valeurs).every((s) => s === "correct")) return null;
  const v = valeurs[0] ?? "";
  if (p === "parametre") {
    if (e.variante === "echelle") {
      const f = lireExpression(valeurs[1] ?? "", "a");
      if (f && valeursParam(e).every((s) => egalNum(f(s), Math.sqrt(e.L * e.L - s * s)))) return [t("C'est la hauteur du sommet "), l("B"), t(" : "), l("M"), t(" est le milieu de l'échelle.")];
      return null;
    }
    if (e.variante === "gravite") {
      const f = lireExpression(v, "t");
      if (f && valeursParam(e).every((s) => egalNum(f(s), 3 * coordonnees(e, s).x))) return [t("Il manque la division par 3 : le centre de gravité est la moyenne des trois sommets.")];
      return null;
    }
    // génératrice : la première génératrice recopiée
    const f = equationXY(v, { m: 2.3 });
    if (f) {
      const d = generatriceDonnee(e, 2.3);
      if (proportionnelle(f, (q) => d.a * q.x + d.b * q.y + d.c)) return [t(e.variante === "radars" ? "C'est le faisceau du radar A ; celui de B passe par B, avec l'autre pente." : "C'est l'équation de la barre ; la perpendiculaire passe par P.")];
    }
    return null;
  }
  if (p === "equation") {
    const f = equationXY(v);
    if (!f) return null;
    if (e.variante === "echelle" && proportionnelle(f, (q: Pt) => q.x * q.x + q.y * q.y - e.L * e.L)) return [t("Le rayon est la moitié de la longueur de l'échelle : "), l("M"), t(" est son milieu.")];
    return null;
  }
  if (p === "extremites") {
    const pts = lirePoints(v);
    if (pts && pts.length !== extremites(e).length) return [t(extremites(e).length === 1 ? "Un seul point est exclu." : "Il y a deux extrémités.")];
  }
  return null;
}
