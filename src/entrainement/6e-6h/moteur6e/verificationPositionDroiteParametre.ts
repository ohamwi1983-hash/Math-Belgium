import type { StatutVerification } from "../../5e-4h/moteur/statutVerification";
import type { Frag } from "../../5e-4h/ui5e/ecransTrigo.types";
import type { ExercicePD, PhasePD } from "../core6e/positionDroiteParametre";
import { degreChute, points, valeursTangence, valeurXK } from "../core6e/positionDroiteParametre";
import { ecritureDecimale, l, lireValeurs, memesValeurs, t } from "../ui6e/outilsConiquesLotH2";
import { egalNum, lireEquation, lirePoints, memesPoints, proportionnelle } from "./lectureLieuxLotH2";

/**
 * Vérification de `6gen139`. Tout est LU avant tout verdict (illisible → `parse_error`, aucune tentative).
 * Équation en x et k : comparée par PROPORTIONNALITÉ au polynôme attendu en des points (x ; k) (toute
 * écriture : substituée non développée, développée, multipliée). Valeurs de k : ensemble (« ± », « ou »,
 * « ; », « aucune »), décimal arrondi refusé SANS tentative. Position : choix jugé (une tentative).
 * Points : ensemble sans ordre (« aucun »).
 */

type E = ExercicePD;

export function messageIllisible(_e: E, p: PhasePD): string {
  if (p === "equation") return "Équation non reconnue : écris une égalité en x et k seulement (y est remplacé), par exemple 25x² + 18kx + 9k² − 144 = 0. Cette saisie ne compte pas comme une tentative.";
  if (p === "condition") return "Valeurs non reconnues : écris par exemple k = ±5, 3 ; −3, 3/2, ou « aucune ». Cette saisie ne compte pas comme une tentative.";
  return "Points non reconnus : écris-les entre parenthèses, séparés par « ; », par exemple (3 ; 0) ; (0 ; 4), ou « aucun ». Cette saisie ne compte pas comme une tentative.";
}

export function approchee(e: E, p: PhasePD, valeurs: string[]): string | null {
  if (p !== "condition") return null;
  const v = valeurs[0] ?? "";
  const lues = lireValeurs(v);
  if (!lues || !ecritureDecimale(v)) return null;
  const att = valeursTangence(e);
  if (memesValeurs(lues, att)) return null;
  const proche = lues.length === att.length && lues.every((x) => att.some((a) => Math.abs(x - a) <= 0.01 * Math.max(1, Math.abs(a))));
  return proche ? "Ce sont des valeurs approchées : donne les valeurs exactes. Cette saisie ne compte pas comme une tentative." : null;
}

export function diagnostiquer(e: E, p: PhasePD, valeurs: string[]): StatutVerification[] {
  const v = valeurs[0] ?? "";
  if (p === "position") return [v === e.verdict ? "correct" : "not_equivalent"];
  if (p === "equation") {
    const f = lireEquation(v, ["x", "k"]);
    if (!f) return ["parse_error"];
    return [proportionnelle((q) => f({ x: q.x, k: q.y }), (q) => valeurXK(e, q.x, q.y)) ? "correct" : "not_equivalent"];
  }
  if (p === "condition") {
    const lues = lireValeurs(v);
    if (lues === null) return ["parse_error"];
    return [memesValeurs(lues, valeursTangence(e)) ? "correct" : "not_equivalent"];
  }
  const pts = lirePoints(v);
  if (pts === null) return ["parse_error"];
  return [memesPoints(pts, points(e)) ? "correct" : "not_equivalent"];
}

export function piege(e: E, p: PhasePD, valeurs: string[]): Frag[] | null {
  if (diagnostiquer(e, p, valeurs).every((s) => s === "correct")) return null;
  const v = valeurs[0] ?? "";
  const c = e.conique;
  if (p === "position") {
    if (v === "tangente" && e.verdict === "unPoint") return [t("Un seul point ne veut pas dire tangente : l'équation est du premier degré (droite parallèle à "), t(c.type === "hyperbole" ? "une asymptote" : "l'axe de la parabole"), t("), la droite traverse la conique.")];
    if (v === "exterieure" && e.verdict === "tangente") return [l("\\Delta=0"), t(" donne une racine double, donc un point : la droite touche la conique.")];
    if (v === "unPoint" && e.verdict === "tangente") return [t("Ici l'équation est bien du second degré : une racine double signifie tangente.")];
    return null;
  }
  if (p === "condition") {
    const lues = lireValeurs(v);
    if (!lues) return null;
    const att = valeursTangence(e);
    if (degreChute(e) && lues.length > 0) return [t("Le coefficient de "), l("x^2"), t(" est nul pour tout "), l("k"), t(" : l'équation est du premier degré, elle n'a jamais de racine double.")];
    if (!degreChute(e) && lues.length === 0) return [t("L'équation est du second degré : résous "), l("\\Delta=0"), t(" en "), l("k"), t(".")];
    if (c.type !== "parabole" && att.length === 2 && lues.length === 1 && att.some((a) => egalNum(a, lues[0]!, 1e-9))) return [t("Il y a deux tangentes de pente "), l("m"), t(", symétriques par rapport au centre : deux valeurs de "), l("k"), t(".")];
    if (c.type !== "parabole") {
      const autre = c.a * c.a * e.m * e.m + (c.type === "ellipse" ? -1 : 1) * c.b * c.b;
      if (autre > 0 && memesValeurs(lues, [Math.sqrt(autre), -Math.sqrt(autre)])) return [t(c.type === "ellipse" ? "Pour l'ellipse, la condition est " : "Pour l'hyperbole, la condition est "), l(c.type === "ellipse" ? "k^2=a^2m^2+b^2" : "k^2=a^2m^2-b^2"), t(".")];
    }
    return null;
  }
  if (p === "points") {
    const pts = lirePoints(v);
    if (!pts) return null;
    const n = points(e).length;
    if (pts.length !== n) return [t(n === 0 ? "Il n'y a aucun point commun." : n === 1 ? "Il y a un seul point commun." : "Il y a deux points communs.")];
  }
  return null;
}
