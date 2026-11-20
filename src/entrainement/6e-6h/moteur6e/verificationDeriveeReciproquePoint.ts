import type { ExerciceDeriveeReciproque } from "../core6e/deriveeReciproquePoint.types";
import type { StatutVerification } from "../moteur/statutVerification";
import type { Frag } from "../ui6e/ecransExp.types";
import { lx, tx } from "../ui6e/ecransExp.types";
import { bonneOption } from "../ui6e/formatDeriveeReciproquePoint";
import type { PhaseReciproque } from "../ui6e/formatDeriveeReciproquePoint";
import { modele, y0V } from "./modeleDeriveeReciproquePoint";
import { egal, estApprochee, lireNombre } from "./lectureValeurExp";

/**
 * Vérification de `6gen155` : valeurs comparées NUMÉRIQUEMENT (toute écriture juste acceptée : e, π,
 * fractions, « − », préfixe « x₀ = » recopié) ; une valeur décimale approchée est arrêtée par un
 * message SANS tentative ; messages ciblés : f(y₀) au lieu de f⁻¹(y₀), f′(y₀) au lieu de f′(x₀),
 * f′(x₀) non inversé, −1/f′(x₀), 1/f′(y₀).
 */

type E = ExerciceDeriveeReciproque;
const t = tx;
const l = lx;

const sansPrefixe = (s: string): string => s.replace(/^\s*(x\s*_?\s*0?|x₀|f\s*'?\s*\(\s*x\s*_?\s*0?\s*\))\s*=\s*/i, "");

export function valeurAttendue(e: E, phase: PhaseReciproque): number {
  const p = modele(e).point;
  if (phase === "x0") return p.x0V;
  if (phase === "derivee") return p.fpV;
  return 1 / p.fpV;
}

export function diagnostiquer(e: E, phase: PhaseReciproque, valeurs: string[]): StatutVerification[] {
  if (phase === "theoreme") return [valeurs[0] === bonneOption(e) ? "correct" : "not_equivalent"];
  const v = lireNombre(sansPrefixe(valeurs[0] ?? ""));
  if (v === null) return ["parse_error"];
  return [egal(v, valeurAttendue(e, phase)) ? "correct" : "not_equivalent"];
}

export function approchee(e: E, phase: PhaseReciproque, valeurs: string[]): string | null {
  if (phase === "theoreme") return null;
  if (estApprochee(sansPrefixe(valeurs[0] ?? ""), valeurAttendue(e, phase)))
    return "Ta valeur est une valeur approchée : on demande la valeur exacte (fraction, e, π). Cela ne compte pas comme une tentative.";
  return null;
}

export function piege(e: E, phase: PhaseReciproque, valeurs: string[]): Frag[] | null {
  const m = modele(e);
  const y0 = y0V(e);
  if (phase === "theoreme") {
    if (valeurs[0] === "inj") return [t("Une fonction strictement croissante est injective même si sa dérivée s'annule en un point isolé (pense à "), l("x^{3}"), t(" en "), l("0"), t(") : c'est le théorème seul qui ne s'applique pas.")];
    if (valeurs[0] === "oui") return [l("f'(x_0)=0"), t(" : le quotient "), l("\\dfrac{1}{f'(x_0)}"), t(" n'existe pas.")];
    return [l("f'(x_0)"), t(" n'est pas nul : l'hypothèse du théorème est remplie.")];
  }
  const v = lireNombre(sansPrefixe(valeurs[0] ?? ""));
  if (v === null) return null;
  const essai = (g: (x: number) => number, x: number): number | null => {
    try {
      const r = g(x);
      return Number.isFinite(r) ? r : null;
    } catch {
      return null;
    }
  };
  if (phase === "x0") {
    const fy = essai(m.f, y0);
    if (fy !== null && egal(v, fy)) return [t("Tu as calculé "), l("f(y_0)"), t(" : on cherche le réel "), l("x_0"), t(" dont l'image par "), l("f"), t(" vaut "), l("y_0"), t(".")];
    if (egal(v, y0)) return [l("x_0"), t(" n'est pas "), l("y_0"), t(" : on cherche "), l("x_0"), t(" tel que "), l("f(x_0)=y_0"), t(".")];
    if (y0 !== 0 && egal(v, 1 / y0)) return [l("f^{-1}"), t(" n'est pas "), l("\\dfrac{1}{f}"), t(" : c'est la fonction qui défait "), l("f"), t(".")];
    const fv = essai(m.f, v);
    if (fv !== null) return [t("Contrôle : l'image de ta valeur par "), l("f"), t(" ne vaut pas "), l("y_0"), t(".")];
    return null;
  }
  if (phase === "derivee") {
    const fpy = essai(m.fp, y0);
    if (fpy !== null && egal(v, fpy)) return [t("Tu as remplacé "), l("x"), t(" par "), l("y_0"), t(" : le nombre dérivé se calcule en "), l("x_0=f^{-1}(y_0)"), t(".")];
    if (egal(v, y0)) return [t("C'est "), l("f(x_0)=y_0"), t(", pas "), l("f'(x_0)"), t(".")];
    return null;
  }
  const fp = m.point.fpV;
  if (egal(v, fp)) return [t("Tu as donné "), l("f'(x_0)"), t(" : la dérivée de la réciproque est son inverse.")];
  if (egal(v, -1 / fp)) return [t("Pas de signe « − » : les pentes de "), l("f"), t(" et de "), l("f^{-1}"), t(" sont inverses, pas « perpendiculaires ».")];
  const fpy = essai(m.fp, y0);
  if (fpy !== null && fpy !== 0 && egal(v, 1 / fpy)) return [t("Le nombre dérivé de "), l("f"), t(" se prend en "), l("x_0=f^{-1}(y_0)"), t(", pas en "), l("y_0"), t(".")];
  return null;
}
