import type { StatutVerification } from "../../5e-4h/moteur/statutVerification";
import type { Frag } from "../../5e-4h/ui5e/ecransTrigo.types";
import type { ExerciceCP, PhaseCP } from "../core6e/courbeParametree";
import { equationF, identite, pointsCourbe, pointsHorsCourbe } from "../core6e/courbeParametree";
import type { Pt } from "../ui6e/outilsLieuxLotH2";
import { l, t } from "../ui6e/outilsLieuxLotH2";
import { bonneCondition } from "../ui6e/formatCourbeParametree";
import { equationXY, memeEnsemble, POINTS_CONTROLE, proportionnelle } from "./lectureLieuxLotH2";

/**
 * Vérification de `6gen129`. Équation LUE avant tout verdict (illisible → `parse_error`, aucune
 * tentative), comparée par proportionnalité à l'équation de la courbe complète (toute écriture
 * équivalente : réduite, développée, « y = … », multipliée) ; astroïde : comparée sur le premier
 * quadrant (x^{2/3} n'est lue que pour x ≥ 0). Même ensemble mais écriture non polynomiale : « à
 * reprendre », sans tentative. Choix fermés comparés à leur identifiant (une tentative).
 */

type E = ExerciceCP;

function pointsControle(e: E): Pt[] {
  if (e.variante !== "astroide") return POINTS_CONTROLE;
  return [0.07, 0.19, 0.33, 0.52, 0.71, 0.88, 1.13, 0.27, 0.61, 0.95].map((a, i) => ({ x: a * e.r, y: ((i * 0.37 + 0.11) % 1.2) * e.r + 0.01 }));
}

export function messageIllisible(): string {
  return "Équation non reconnue : écris une égalité en x et y, par exemple (x − 2)² + (y + 1)² = 9 ou y = 2x² − 1. Cette saisie ne compte pas comme une tentative.";
}

export function diagnostiquer(e: E, p: PhaseCP, valeurs: string[]): StatutVerification[] {
  const v = valeurs[0] ?? "";
  if (p === "identite") return [v === identite(e) ? "correct" : "not_equivalent"];
  if (p === "partie") return [v === e.partie ? "correct" : "not_equivalent"];
  if (p === "condition") return [v === bonneCondition(e) ? "correct" : "not_equivalent"];
  const f = equationXY(v);
  if (!f) return ["parse_error"];
  return [proportionnelle(f, equationF(e), pointsControle(e)) ? "correct" : "not_equivalent"];
}

export function aReprendre(e: E, p: PhaseCP, valeurs: string[]): Frag[] | null {
  if (p !== "equation") return null;
  const f = equationXY(valeurs[0] ?? "");
  if (!f || proportionnelle(f, equationF(e), pointsControle(e))) return null;
  if (memeEnsemble(f, pointsCourbe(e), pointsHorsCourbe(e))) return [t("Ton équation décrit bien cette courbe, mais écris-la sans racine (forme du cours) : ça ne compte pas comme une tentative.")];
  return null;
}

export function piege(e: E, p: PhaseCP, valeurs: string[]): Frag[] | null {
  if (diagnostiquer(e, p, valeurs).every((s) => s === "correct")) return null;
  const v = valeurs[0] ?? "";
  if (p === "identite") {
    if (v === "tangente") return [t("Le quotient "), l("\\dfrac{\\sin t}{\\cos t}"), t(" n'élimine pas t ici : il reste une relation à trouver entre x et y.")];
    if (v === "duplication" && identite(e) !== "duplication") return [t("Aucune expression ne contient "), l("\\cos(2t)"), t(".")];
    return null;
  }
  if (p === "partie") {
    if (v === "entiere") return [t("Toute la courbe n'est pas atteinte : regarde les valeurs que peut prendre x (ou y) sur l'intervalle de t.")];
    if (e.partie === "entiere") return [t("Ici, x et y prennent toutes les valeurs de la courbe : aucune restriction.")];
    return null;
  }
  if (p !== "equation") return null;
  const f = equationXY(v);
  if (!f) return null;
  const pts = pointsControle(e);
  if (e.variante === "cercle" && proportionnelle(f, (m) => (m.x - e.a) ** 2 + (m.y - e.b) ** 2 - e.r, pts) && e.r !== 1) return [t("Le second membre est le carré du rayon : "), l(`${e.r}^2=${e.r * e.r}`), t(".")];
  if (e.variante === "parabole" && e.partie === "arc" && proportionnelle(f, (m) => e.k * (m.x - e.p) ** 2 + e.q - m.y, pts)) return [l("\\cos(2t)"), t(" n'est pas "), l("\\cos^2 t"), t(" : utilise "), l("\\cos(2t)=2\\cos^2 t-1"), t(".")];
  if (e.variante === "astroide" && proportionnelle(f, (m) => Math.cbrt(m.x * m.x) + Math.cbrt(m.y * m.y) - e.r, pts) && e.r !== 1) return [t("Le second membre est "), l(`${e.r}^{2/3}`), t(" : on élève au carré la racine cubique de "), l(`${e.r}`), t(".")];
  return null;
}
