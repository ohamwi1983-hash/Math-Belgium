import type { ExerciceLireTransformee } from "../core6e/lireTransformeeArc";
import { cV, kV, mV, nV } from "../core6e/lireTransformeeArc";
import type { StatutVerification } from "../../5e-4h/moteur/statutVerification";
import type { Frag } from "../../5e-4h/ui5e/ecransTrigo.types";
import { lx, tx } from "../../5e-4h/ui5e/ecransTrigo.types";
import type { PhaseLireTransformee } from "../ui6e/formatLireTransformeeArc";
import { domaine, image, imageQ } from "../ui6e/formatLireTransformeeArc";
import { qVal } from "../ui6e/nombresCycloLotG";
import { diagnostiquerEnsemble, estApprocheeDe, lireValeur, statutExact } from "./lectureCycloLotG";

/**
 * Vérification de `6gen158` (statut à 3 valeurs). Domaine et image : intervalles exacts (bornes en π,
 * crochets justes, ±∞ ouverts) ; m, n, k, c : valeurs exactes (fractions, π) — une écriture décimale
 * approchée d'une valeur en π est signalée sans perte de tentative.
 */

type E = ExerciceLireTransformee;

function attendus(e: E, phase: PhaseLireTransformee): number[] {
  return phase === "mn" ? [mV(e), nV(e)] : [kV(e), cV(e)];
}

export function diagnostiquer(e: E, phase: PhaseLireTransformee, v: string[]): StatutVerification[] {
  if (phase === "domaine") return [diagnostiquerEnsemble(v, domaine(e)).statut];
  if (phase === "image") return [diagnostiquerEnsemble(v, image(e)).statut];
  return attendus(e, phase).map((a, i) => statutExact(v[i] ?? "", a));
}

export function approchee(e: E, phase: PhaseLireTransformee, v: string[]): string | null {
  if (diagnostiquer(e, phase, v).every((s) => s === "correct")) return null;
  const MSG = "Valeur approchée : écris la valeur exacte (avec π ou une fraction). Cette saisie ne compte pas comme une tentative.";
  if (phase === "domaine" || phase === "image") return diagnostiquerEnsemble(v, phase === "domaine" ? domaine(e) : image(e)).raison === "approchee" ? MSG : null;
  return attendus(e, phase).some((a, i) => estApprocheeDe(v[i] ?? "", a)) ? MSG : null;
}

export function piege(e: E, phase: PhaseLireTransformee, v: string[]): Frag[] | null {
  if (phase === "domaine" || phase === "image") {
    const r = diagnostiquerEnsemble(v, phase === "domaine" ? domaine(e) : image(e)).raison;
    if (r === "infini-ferme") return [tx("Un intervalle est toujours ouvert en "), lx("\\pm\\infty"), tx(".")];
    if (r === "crochet") return [tx(e.variante === "arctan" && phase === "image" ? "Les asymptotes ne sont jamais atteintes : crochets ouverts." : "Les bornes sont justes ; les points pleins sont atteints : vérifie les crochets.")];
    return null;
  }
  const x = v.map((s) => lireValeur(s));
  const pres = (a: number | null, b: number) => a !== null && Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(b));
  if (phase === "mn") {
    if (pres(x[0], 1 / mV(e)) && mV(e) !== 1) return [tx(e.variante === "arctan" ? "Le point marqué est à " : "La largeur du domaine vaut "), lx(e.variante === "arctan" ? "\\dfrac{1}{m}" : "\\dfrac{2}{m}"), tx(e.variante === "arctan" ? " unité(s) du centre : m est l'inverse de cet écart." : " (quand x parcourt le domaine, mx + n va de −1 à 1).")];
    if (pres(x[0], mV(e)) && nV(e) !== 0 && pres(x[1], -nV(e))) return [tx("Au centre "), lx("x_0"), tx(", "), lx("mx_0+n=0"), tx(" : "), lx("n=-m\\,x_0"), tx(", attention au signe.")];
    return null;
  }
  // kc
  if (pres(x[0], -kV(e)))
    return e.variante === "arccos"
      ? [tx("Le signe de k : arccos est décroissante et "), lx("m>0"), tx(", donc f est décroissante si "), lx("k>0"), tx(" et croissante si "), lx("k<0"), tx(".")]
      : [tx("Le signe de k : comme "), lx("m>0"), tx(", f est croissante si "), lx("k>0"), tx(" et décroissante si "), lx("k<0"), tx(".")];
  if (pres(x[0], 2 * kV(e)) || pres(x[0], kV(e) / 2)) return [tx("L'image de f a pour longueur "), lx("|k|\\cdot\\pi"), tx(" : divise la longueur lue par "), lx("\\pi"), tx(".")];
  if (e.variante === "arccos") {
    const [lo, hi] = imageQ(e);
    if (pres(x[1], ((qVal(lo) + qVal(hi)) / 2) * Math.PI)) return [tx("Pour arccos, c n'est pas le milieu de l'image : c'est la valeur de f à la borne droite, où "), lx("\\arccos 1=0"), tx(".")];
  }
  return null;
}
