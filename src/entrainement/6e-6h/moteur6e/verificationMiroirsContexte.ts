import type { StatutVerification } from "../../5e-4h/moteur/statutVerification";
import type { Frag } from "../../5e-4h/ui5e/ecransTrigo.types";
import type { ExerciceMC, PhaseMC } from "../core6e/miroirsContexte";
import { conique, distance, grandeur, nature, pointT, reflechi, tangenteFtfp } from "../core6e/miroirsContexte";
import type { D, Pt } from "../ui6e/outilsConiquesLotH2";
import { estApprochee, evalPolyPt, l, lireMesure, polyConique, t } from "../ui6e/outilsConiquesLotH2";
import { egalNum, equationXY, lirePoints, memesPoints, proportionnelle } from "./lectureLieuxLotH2";

/**
 * Vérification de `6gen140`. Tout est LU avant tout verdict (illisible → `parse_error`, aucune tentative).
 * Équations (conique, tangente, rayon réfléchi) : par proportionnalité. Longueurs : nombre exact, préfixe
 * (« OF = ») et unité (« cm ») tolérés ; décimal arrondi refusé SANS tentative. Messages ciblés : rayon
 * pris pour le diamètre, p pris pour la distance focale, a et c confondus, définition de la conique.
 */

type E = ExerciceMC;
const valD = (d: D) => (p: Pt) => d.a * p.x + d.b * p.y + d.c;

export function messageIllisible(_e: E, p: PhaseMC): string {
  if (p === "grandeur" || p === "distance" || p === "distances") return "Longueur non reconnue : écris un nombre exact, par exemple 45, 75/2 ou 4√7 (« cm » permis). Cette saisie ne compte pas comme une tentative.";
  if (p === "pointT") return "Point non reconnu : écris ses coordonnées entre parenthèses, par exemple (−3 ; 0). Cette saisie ne compte pas comme une tentative.";
  return "Équation non reconnue : écris une égalité en x et y, par exemple y² = 180x ou x²/25 + y²/9 = 1. Cette saisie ne compte pas comme une tentative.";
}

/** Valeurs attendues des champs numériques de l'écran. */
function attendues(e: E, p: PhaseMC): number[] {
  if (p === "grandeur") return [grandeur(e)];
  if (p === "distance") return [distance(e)];
  if (p === "distances") return [grandeur(e), grandeur(e)];
  return [];
}

export function approchee(e: E, p: PhaseMC, valeurs: string[]): string | null {
  const att = attendues(e, p);
  if (!att.length) return null;
  return att.some((a, i) => estApprochee(valeurs[i] ?? "", lireMesure(valeurs[i] ?? ""), a)) ? "C'est une valeur approchée : donne la valeur exacte (fraction ou racine). Cette saisie ne compte pas comme une tentative." : null;
}

function equationJuste(saisie: string, F: (p: Pt) => number): StatutVerification {
  const f = equationXY(saisie);
  if (!f) return "parse_error";
  return proportionnelle(f, F) ? "correct" : "not_equivalent";
}

export function diagnostiquer(e: E, p: PhaseMC, valeurs: string[]): StatutVerification[] {
  const v = valeurs[0] ?? "";
  switch (p) {
    case "conique":
      return [v === nature(e) ? "correct" : "not_equivalent"];
    case "equation": {
      const P = polyConique(conique(e));
      return [equationJuste(v, (q) => evalPolyPt(P, q))];
    }
    case "tangente":
      return [equationJuste(v, valD(tangenteFtfp(e)))];
    case "reflechi":
      return [equationJuste(v, valD(reflechi(e)))];
    case "pointT": {
      const pts = lirePoints(v);
      if (pts === null) return ["parse_error"];
      return [memesPoints(pts, [pointT(e)]) ? "correct" : "not_equivalent"];
    }
    default:
      return attendues(e, p).map((a, i) => {
        const n = lireMesure(valeurs[i] ?? "");
        if (n === null) return "parse_error";
        return egalNum(n, a, 1e-9) ? "correct" : "not_equivalent";
      });
  }
}

export function piege(e: E, p: PhaseMC, valeurs: string[]): Frag[] | null {
  if (diagnostiquer(e, p, valeurs).every((s) => s === "correct")) return null;
  const v = valeurs[0] ?? "";
  const n = lireMesure(v);
  switch (p) {
    case "conique":
      if (v === "ellipse" && nature(e) === "parabole") return [t("L'ellipse ne concentre pas les rayons parallèles : seule la parabole renvoie vers son foyer tous les rayons parallèles à son axe.")];
      if (v === "parabole" && nature(e) === "ellipse") return [t("Ici les ondes ne sont pas parallèles : elles partent d'un point et doivent passer par un autre, comme d'un foyer à l'autre.")];
      if (v === "cercle") return [t("Un miroir circulaire (sphérique) ne renvoie pas exactement tous les rayons vers un même point.")];
      if (nature(e) === "hyperbole") return [t("Les rayons qui allaient vers F repartent comme s'ils venaient de F′ : c'est la propriété d'un seul type de conique.")];
      return null;
    case "equation": {
      const f = equationXY(v);
      if (!f) return null;
      const c = conique(e);
      if (c.type === "parabole") {
        if (proportionnelle(f, (q) => q.y * q.y - c.p * q.x)) return [t("L'équation est "), l("y^2=2px"), t(" : le coefficient de "), l("x"), t(" est "), l("2p"), t(", pas "), l("p"), t(".")];
        if (proportionnelle(f, (q) => q.y * q.y - c.p * q.x / 2) || proportionnelle(f, (q) => q.y * q.y - 4 * c.p * q.x)) return [l("p"), t(" est la distance du foyer à la directrice, le double de la distance du sommet au foyer.")];
        return null;
      }
      if (c.type === "ellipse" && proportionnelle(f, (q) => q.x * q.x / (c.a * c.a) + q.y * q.y / (e.c * e.c) - 1)) return [t("Le dénominateur de "), l("y^2"), t(" est "), l("b^2=a^2-c^2"), t(", pas "), l("c^2"), t(".")];
      if (c.type === "hyperbole" && proportionnelle(f, (q) => (q.x * q.x) / (e.c * e.c) - (q.y * q.y) / (c.b * c.b) - 1)) return [l("a"), t(" est la distance du centre au sommet "), l("S"), t(", pas la moitié de "), l("FF'"), t(".")];
      if (c.type === "hyperbole" && proportionnelle(f, (q) => (q.x * q.x) / (c.a * c.a) + (q.y * q.y) / (c.b * c.b) - 1)) return [t("C'est l'équation d'une ellipse : pour l'hyperbole, le signe entre les deux termes est « − ».")];
      return null;
    }
    case "grandeur":
      if (n === null) return null;
      if (e.variante === "antenne" && egalNum(n, 2 * grandeur(e), 1e-9)) return [t("C'est "), l("p"), t(" : le foyer est à "), l("\\dfrac p2"), t(" du sommet.")];
      if ((e.variante === "antenne" || e.variante === "phare") && egalNum(n, 4 * grandeur(e), 1e-9)) return [t("Le bord est à la moitié du diamètre de l'axe : son ordonnée est le rayon de l'ouverture.")];
      if (e.variante === "lithotriteur" && (egalNum(n, e.a, 1e-9) || egalNum(n, e.c, 1e-9))) return [t("Le rayon de l'ouverture est l'ordonnée du point de l'ellipse d'abscisse 0 : "), l("b"), t(".")];
      if (e.variante === "cassegrain" && egalNum(n, 3 * e.c - e.a, 1e-9)) return [l("S"), t(" est entre "), l("F'"), t(" et "), l("F"), t(" : "), l("SF'=FF'-SF"), t(".")];
      return null;
    case "distance":
      if (n === null) return null;
      if ((e.variante === "lithotriteur" || e.variante === "cassegrain") && egalNum(n, 2 * e.c, 1e-9)) return [t("C'est la distance entre les foyers ; la définition de la conique donne "), l("2a"), t(".")];
      if ((e.variante === "lithotriteur" || e.variante === "cassegrain") && egalNum(n, e.a, 1e-9)) return [t("C'est "), l("a"), t(" : la définition donne "), l("2a"), t(".")];
      return null;
    case "pointT": {
      const pts = lirePoints(v);
      if (pts && pts.length === 1 && Math.abs(pts[0]!.x - e.P.x) < 1e-9 && Math.abs(pts[0]!.y) < 1e-9) return [t("Le point "), l("T"), t(" est de l'autre côté du sommet : son abscisse est l'opposé de "), l("x_P"), t(".")];
      return null;
    }
    case "tangente": {
      const f = equationXY(v);
      if (f && proportionnelle(f, (q) => q.y * e.P.y - 2 * e.p * (q.x + e.P.x))) return [t("Forme dédoublée : "), l("2px"), t(" devient "), l("p\\,(x+x_P)"), t(", le coefficient est "), l("p"), t(".")];
      return null;
    }
    case "reflechi": {
      const f = equationXY(v);
      if (f && proportionnelle(f, (q) => q.y - e.P.y)) return [t("C'est le rayon incident (parallèle à l'axe) ; le rayon réfléchi passe par le foyer.")];
      return null;
    }
    default:
      return null;
  }
}
