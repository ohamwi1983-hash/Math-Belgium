import type { StatutVerification } from "../../5e-4h/moteur/statutVerification";
import type { Frag } from "../../5e-4h/ui5e/ecransTrigo.types";
import { lx, tx } from "../../5e-4h/ui5e/ecransTrigo.types";
import type { Exercice113, Phase113 } from "../core6e/densiteProbabilite";
import { aireTotale, aireUnites, bornesQueue, esperance113, integraleXG, primitiveG, probaIntervalle113, probaQueue113, support, valeurK } from "../core6e/densiteProbabilite";
import { moins, val } from "../ui6e/outilsVariablesAleatoiresLotH1";
import { MESSAGE_APPROCHEE, egalNum, estApprochee, lireVA, statutExact } from "./lectureVariablesAleatoiresLotH1";

/**
 * Vérification de `6gen113`. Saisie LUE avant tout verdict (illisible → `parse_error`, aucune
 * tentative) ; valeurs exactes à 1e-9, décimal proche mais faux = valeur approchée (sans tentative).
 * Messages ciblés : aire totale donnée pour k (inverse oublié), aire sans k (k oublié), f(b) ou f(a)
 * pris pour une probabilité, complément oublié / pris à tort, E(X) = milieu de l'intervalle, k oublié
 * dans l'espérance, ∫ f (= 1) au lieu de ∫ x f.
 */

type E = Exercice113;
type P = Phase113;
const t = tx;
const l = lx;

function attendu(e: E, p: P): number {
  switch (p) {
    case "k":
      return val(valeurK(e));
    case "intervalle":
      return val(probaIntervalle113(e));
    case "queue":
      return val(probaQueue113(e));
    case "esperance":
      return val(esperance113(e));
  }
}

export function diagnostiquer113(e: E, p: P, valeurs: string[]): StatutVerification[] {
  return [statutExact(valeurs[0] ?? "", attendu(e, p))];
}

export function approchee113(e: E, p: P, valeurs: string[]): string | null {
  return estApprochee(valeurs[0] ?? "", attendu(e, p)) ? MESSAGE_APPROCHEE : null;
}

/** f(x) numérique (avec la vraie valeur de k). */
function f(e: E, x: number): number {
  const k = val(valeurK(e));
  if (e.variante === "formule") {
    const L = e.L!;
    const g = e.g === "x" ? x : e.g === "x2" ? x * x : e.g === "Lmx" ? L - x : x * (L - x);
    return k * g;
  }
  for (const s of e.segments!) if (x >= s.x0 && x <= s.x1) return k * (s.y0 + ((s.y1 - s.y0) * (x - s.x0)) / (s.x1 - s.x0));
  return 0;
}

export function piege113(e: E, p: P, valeurs: string[]): Frag[] | null {
  const r = lireVA(valeurs[0] ?? "");
  if (r === null) return null;
  const att = attendu(e, p);
  const cand: { valeur: number; message: Frag[] }[] = [];
  if (p === "k") {
    cand.push({ valeur: val(aireTotale(e)), message: [t("C'est l'aire totale pour "), l("k=1"), t(" : écris qu'elle vaut 1 quand on multiplie par k, puis résous.")] });
  }
  if (p === "intervalle" || p === "queue") {
    const [u, v] = p === "intervalle" ? [e.a, e.b] : bornesQueue(e);
    const aire = e.variante === "trace" ? val(aireUnites(e.segments!, u, v)) : val(moins(primitiveG(e.g!, e.L!, v), primitiveG(e.g!, e.L!, u)));
    cand.push({ valeur: aire, message: [t("Tu as oublié de multiplier par k : l'aire (ou l'intégrale) se calcule avec la vraie hauteur de la courbe.")] });
    cand.push({ valeur: f(e, v), message: [t("C'est la valeur de "), l(`f(${v})`), t(" : une densité n'est pas une probabilité ; la probabilité est l'aire sous la courbe.")] });
    cand.push({ valeur: f(e, u), message: [t("C'est la valeur de "), l(`f(${u})`), t(" : une densité n'est pas une probabilité ; la probabilité est l'aire sous la courbe.")] });
    cand.push({ valeur: 1 - att, message: [t("C'est la probabilité de l'événement contraire : relis l'intervalle demandé.")] });
  }
  if (p === "esperance") {
    const [u, v] = support(e);
    cand.push({ valeur: (u + v) / 2, message: [t("C'est le milieu de l'intervalle : il n'est l'espérance que si la densité est symétrique. Calcule "), l("\\int x\\,f(x)\\,dx"), t(".")] });
    cand.push({ valeur: val(integraleXG(e.g!, e.L!)), message: [t("Tu as oublié le facteur k dans l'intégrale.")] });
    cand.push({ valeur: 1, message: [t("C'est l'intégrale de f (elle vaut toujours 1) : l'espérance est l'intégrale de "), l("x\\,f(x)"), t(".")] });
  }
  for (const c of cand) if (!egalNum(c.valeur, att) && egalNum(r, c.valeur)) return c.message;
  return null;
}
