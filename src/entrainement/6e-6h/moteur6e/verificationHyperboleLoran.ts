import type { StatutVerification } from "../../5e-4h/moteur/statutVerification";
import type { Frag } from "../../5e-4h/ui5e/ecransTrigo.types";
import type { ExerciceLO, PhaseLO } from "../core6e/hyperboleLoran";
import { deltaT, intersectionsRoute, positions } from "../core6e/hyperboleLoran";
import { estApprochee, l, lireMesure, t } from "../ui6e/outilsConiquesLotH2";
import { egalNum, equationXY, lirePoints, memesPoints, proportionnelle } from "./lectureLieuxLotH2";

/**
 * Vérification de `6gen142`. Tout est LU avant tout verdict (illisible → `parse_error`, aucune tentative).
 * Différence : nombre (préfixe, unité « km » tolérés). Branche : choix jugé. Équation : par
 * proportionnalité. Positions : ensemble de points sans ordre. Messages ciblés : a au lieu de 2a, unités
 * de temps, b² = a² + c², les deux intersections gardées (parallèle) ou une seule (perpendiculaire).
 */

type E = ExerciceLO;

export function messageIllisible(_e: E, p: PhaseLO): string {
  if (p === "difference") return "Valeur non reconnue : écris un nombre de kilomètres, par exemple 60. Cette saisie ne compte pas comme une tentative.";
  if (p === "position") return "Points non reconnus : écris-les entre parenthèses, séparés par « ; », par exemple (50 ; 48) ; (50 ; −48). Cette saisie ne compte pas comme une tentative.";
  return "Équation non reconnue : écris une égalité en x et y, par exemple x²/900 − y²/1600 = 1. Cette saisie ne compte pas comme une tentative.";
}

export function approchee(e: E, p: PhaseLO, valeurs: string[]): string | null {
  if (p !== "difference") return null;
  const v = valeurs[0] ?? "";
  return estApprochee(v, lireMesure(v), 2 * e.a) ? "C'est une valeur approchée : le calcul tombe juste. Cette saisie ne compte pas comme une tentative." : null;
}

export function diagnostiquer(e: E, p: PhaseLO, valeurs: string[]): StatutVerification[] {
  const v = valeurs[0] ?? "";
  if (p === "branche") return [v === e.premier ? "correct" : "not_equivalent"];
  if (p === "difference") {
    const n = lireMesure(v);
    if (n === null) return ["parse_error"];
    return [egalNum(Math.abs(n), 2 * e.a, 1e-9) ? "correct" : "not_equivalent"];
  }
  if (p === "equation") {
    const f = equationXY(v);
    if (!f) return ["parse_error"];
    return [proportionnelle(f, (q) => e.b * e.b * q.x * q.x - e.a * e.a * q.y * q.y - e.a * e.a * e.b * e.b) ? "correct" : "not_equivalent"];
  }
  const pts = lirePoints(v);
  if (pts === null) return ["parse_error"];
  return [memesPoints(pts, positions(e)) ? "correct" : "not_equivalent"];
}

export function piege(e: E, p: PhaseLO, valeurs: string[]): Frag[] | null {
  if (diagnostiquer(e, p, valeurs).every((s) => s === "correct")) return null;
  const v = valeurs[0] ?? "";
  if (p === "difference") {
    const n = lireMesure(v);
    if (n === null) return null;
    if (egalNum(Math.abs(n), e.a, 1e-9)) return [t("C'est la moitié : la différence des distances vaut "), l("v\\cdot\\Delta t"), t(", c'est-à-dire "), l("2a"), t(".")];
    if (egalNum(Math.abs(n), 2 * e.a * 1000, 1e-9) || egalNum(Math.abs(n), 300000 * deltaT(e), 1e-9) || egalNum(Math.abs(n), 0.3 * deltaT(e) / 1000, 1e-9)) return [t("Vérifie les unités : "), l("1\\ \\mu\\text{s}=10^{-6}\\text{ s}"), t(", donc "), l("300\\,000\\text{ km/s}=0{,}3\\text{ km/}\\mu\\text{s}"), t(".")];
    return null;
  }
  if (p === "branche") {
    if (v === "deux") return [t("Le signe de "), l("PA-PB"), t(" est connu (le signal de "), l(e.premier), t(" arrive le premier) : une seule branche convient.")];
    return [t("Le navire est plus proche de l'émetteur dont le signal arrive en premier : "), l(e.premier), t(".")];
  }
  if (p === "equation") {
    const f = equationXY(v);
    if (!f) return null;
    if (proportionnelle(f, (q) => (q.x * q.x) / (4 * e.a * e.a) - (q.y * q.y) / (e.c * e.c - 4 * e.a * e.a || 1) - 1) || proportionnelle(f, (q) => (q.x * q.x) / (4 * e.a * e.a) - (q.y * q.y) / (e.b * e.b) - 1)) return [t("La différence des distances vaut "), l("2a"), t(" : divise-la par 2 pour avoir "), l("a"), t(".")];
    if (proportionnelle(f, (q) => (q.x * q.x) / (e.a * e.a) - (q.y * q.y) / (e.a * e.a + e.c * e.c) - 1)) return [t("Pour l'hyperbole, "), l("c^2=a^2+b^2"), t(", donc "), l("b^2=c^2-a^2"), t(".")];
    return null;
  }
  const pts = lirePoints(v);
  if (!pts) return null;
  if (e.variante === "parallele" && memesPoints(pts, intersectionsRoute(e))) return [t("Un des deux points est sur l'autre branche : il est plus proche de "), l(e.premier === "A" ? "B" : "A"), t(".")];
  if (e.variante === "perpendiculaire" && pts.length === 1) return [t("Les deux points de la route sont sur la bonne branche : les deux positions sont possibles.")];
  return null;
}
