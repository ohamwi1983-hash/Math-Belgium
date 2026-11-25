import type { StatutVerification } from "../../5e-4h/moteur/statutVerification";
import type { Frag } from "../../5e-4h/ui5e/ecransTrigo.types";
import type { ExerciceKE, PhaseKE } from "../core6e/orbitesKepler";
import { aphelie, excentricite, perihelie } from "../core6e/orbitesKepler";
import { estApprochee, l, lireMesure, t } from "../ui6e/outilsConiquesLotH2";
import { egalNum, lirePoints, memesPoints } from "./lectureLieuxLotH2";

/**
 * Vérification de `6gen141`. Tout est LU avant tout verdict (illisible → `parse_error`, aucune tentative).
 * Longueurs : nombre exact (espaces de milliers, préfixe « a = », unité tolérés) ; excentricité : fraction
 * ou décimal exact, décimal arrondi refusé SANS tentative. Corps central : point. Messages ciblés : corps
 * central au centre, demi-somme oubliée, rayon terrestre oublié, e = b/a, b² = a² + c².
 */

type E = ExerciceKE;

export function messageIllisible(_e: E, p: PhaseKE): string {
  if (p === "foyer") return "Point non reconnu : écris ses coordonnées entre parenthèses, par exemple (12 ; 0). Cette saisie ne compte pas comme une tentative.";
  if (p === "excentricite") return "Valeur non reconnue : écris une fraction, par exemple 12/13. Cette saisie ne compte pas comme une tentative.";
  return "Longueur non reconnue : écris un nombre, par exemple 61 ou 10 000 (l'unité est permise). Cette saisie ne compte pas comme une tentative.";
}

function attendues(e: E, p: PhaseKE): number[] {
  if (p === "axes") return [e.a, e.c];
  if (p === "excentricite") return [excentricite(e)];
  if (p === "petitAxe") return [e.b];
  return [];
}

export function approchee(e: E, p: PhaseKE, valeurs: string[]): string | null {
  return attendues(e, p).some((a, i) => estApprochee(valeurs[i] ?? "", lireMesure(valeurs[i] ?? ""), a)) ? "C'est une valeur approchée : donne la valeur exacte (une fraction). Cette saisie ne compte pas comme une tentative." : null;
}

export function diagnostiquer(e: E, p: PhaseKE, valeurs: string[]): StatutVerification[] {
  if (p === "foyer") {
    const pts = lirePoints(valeurs[0] ?? "");
    if (pts === null) return ["parse_error"];
    return [memesPoints(pts, [{ x: e.c, y: 0 }]) ? "correct" : "not_equivalent"];
  }
  return attendues(e, p).map((a, i) => {
    const n = lireMesure(valeurs[i] ?? "");
    if (n === null) return "parse_error";
    return egalNum(n, a, 1e-9) ? "correct" : "not_equivalent";
  });
}

export function piege(e: E, p: PhaseKE, valeurs: string[]): Frag[] | null {
  if (diagnostiquer(e, p, valeurs).every((s) => s === "correct")) return null;
  const n0 = lireMesure(valeurs[0] ?? "");
  const n1 = lireMesure(valeurs[1] ?? "");
  const q = perihelie(e);
  const Q = aphelie(e);
  if (p === "axes") {
    if (e.R > 0 && n0 !== null && egalNum(n0, e.a - e.R, 1e-9)) return [t("Les altitudes se mesurent depuis le sol : ajoute le rayon de la Terre pour avoir les distances au centre de la Terre.")];
    if (n0 !== null && (egalNum(n0, q + Q, 1e-9) || egalNum(n0, Q, 1e-9))) return [l("2a"), t(" est la longueur du grand axe, du périhélie à l'aphélie : "), l("a=\\dfrac{q+Q}{2}"), t(".")];
    if (n1 !== null && (egalNum(n1, q, 1e-9) || egalNum(n1, Q - q, 1e-9))) return [l("c"), t(" est la distance du centre à un foyer : "), l("c=\\dfrac{Q-q}{2}"), t(".")];
    return null;
  }
  if (p === "foyer") {
    const pts = lirePoints(valeurs[0] ?? "");
    if (!pts || pts.length !== 1) return null;
    if (Math.abs(pts[0]!.x) < 1e-9 && Math.abs(pts[0]!.y) < 1e-9) return [t("Le corps central n'est pas au centre de l'orbite : d'après la première loi de Kepler, il occupe un foyer.")];
    if (egalNum(pts[0]!.x, -e.c, 1e-9)) return [t("C'est l'autre foyer, du côté de l'aphélie ; le corps central est du côté du point le plus proche.")];
    return null;
  }
  if (p === "excentricite") {
    if (n0 !== null && egalNum(n0, e.b / e.a, 1e-9)) return [t("L'excentricité est "), l("\\dfrac{c}{a}"), t(", pas "), l("\\dfrac{b}{a}"), t(".")];
    if (n0 !== null && n0 >= 1) return [t("Une ellipse a une excentricité strictement comprise entre 0 et 1 : "), l("e=\\dfrac{c}{a}"), t(".")];
    return null;
  }
  if (n0 !== null && egalNum(n0, Math.sqrt(e.a * e.a + e.c * e.c), 1e-9)) return [t("Pour une ellipse, "), l("b^2=a^2-c^2"), t(" (le « + » est celui de l'hyperbole).")];
  if (n0 !== null && egalNum(n0, q, 1e-9)) return [t("C'est la distance au périhélie, "), l("a-c"), t(" ; "), l("b"), t(" se calcule par "), l("b^2=a^2-c^2"), t(".")];
  return null;
}
