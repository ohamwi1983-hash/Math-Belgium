import type { ExTrig, ExerciceRestreindre } from "../core6e/restreindreInverser";
import { g, gY0 } from "../core6e/restreindreInverser";
import type { StatutVerification } from "../../5e-4h/moteur/statutVerification";
import type { Frag } from "../../5e-4h/ui5e/ecransTrigo.types";
import { lx, tx } from "../../5e-4h/ui5e/ecransTrigo.types";
import type { PhaseRestreindre } from "../ui6e/formatRestreindreInverser";
import { imageTrinome, restriction } from "../ui6e/formatRestreindreInverser";
import { qVal } from "../ui6e/nombresCycloLotG";
import { decoderLigne } from "../../5e-4h/ui5e/ecransTrigo.types";
import { diagnostiquerEnsemble, estApprocheeDe, expressionVaut, lireBorne, lireValeur, statutExact, statutExpressionX } from "./lectureCycloLotG";

/**
 * Vérification de `6gen159` (statut à 3 valeurs). Intervalles exacts (π, crochets justes, ±∞ ouverts) ;
 * g(y₀) exact ; g(x) : toute expression équivalente (quatre points du domaine de g). Valeur approchée
 * d'une valeur en π : message sans perte de tentative.
 */

type E = ExerciceRestreindre;

export function pointsG(e: E): number[] {
  if (e.variante === "trinome") return [0.3, 1.7, 4.2, 9].map((t) => e.k + e.a * t);
  if (e.variante === "tangente") return [-3, -0.4, 0.7, 2.5];
  return [-0.83, -0.2, 0.35, 0.9];
}

const ensemble = (e: E, phase: PhaseRestreindre) => (phase === "image" && e.variante === "trinome" ? imageTrinome(e) : restriction(e));

export function diagnostiquer(e: E, phase: PhaseRestreindre, v: string[]): StatutVerification[] {
  switch (phase) {
    case "intervalle":
    case "image":
      return [diagnostiquerEnsemble(v, ensemble(e, phase)).statut];
    case "valeur":
      return [statutExact(v[0], qVal(gY0(e as ExTrig)) * Math.PI)];
    case "expression":
      return [statutExpressionX(v[0], (x) => g(e, x), pointsG(e))];
  }
}

export function approchee(e: E, phase: PhaseRestreindre, v: string[]): string | null {
  if (diagnostiquer(e, phase, v).every((s) => s === "correct")) return null;
  const MSG = "Valeur approchée : écris la valeur exacte (avec π ou une fraction). Cette saisie ne compte pas comme une tentative.";
  if (phase === "intervalle" || phase === "image") return diagnostiquerEnsemble(v, ensemble(e, phase)).raison === "approchee" ? MSG : null;
  if (phase === "valeur") return estApprocheeDe(v[0], qVal(gY0(e as ExTrig)) * Math.PI) ? MSG : null;
  return null;
}

const ARC = { sinus: Math.asin, cosinus: Math.acos, tangente: Math.atan } as const;
const NOM_ARC = { sinus: "arcsin", cosinus: "arccos", tangente: "arctan" } as const;

export function piege(e: E, phase: PhaseRestreindre, v: string[]): Frag[] | null {
  switch (phase) {
    case "intervalle":
    case "image": {
      const r = diagnostiquerEnsemble(v, ensemble(e, phase)).raison;
      if (r === "infini-ferme") return [tx("Un intervalle est toujours ouvert en "), lx("\\pm\\infty"), tx(".")];
      if (r === "crochet") return [tx(e.variante === "tangente" ? "Les asymptotes ne sont jamais atteintes : crochets ouverts." : "Les bornes sont justes ; vérifie les crochets (le sommet ou les extremums appartiennent à la restriction).")];
      if (phase === "intervalle" && e.variante === "trinome" && v.length === 1) {
        const l = decoderLigne(v[0]);
        const gB = lireBorne(l.gauche);
        const dB = lireBorne(l.droite);
        if ((gB === e.h && dB === Infinity) || (gB === -Infinity && dB === e.h)) return [tx("Le sommet est juste, mais "), lx("x_0"), tx(" doit appartenir à l'intervalle : de quel côté du sommet est-il ?")];
      }
      if (phase === "intervalle" && e.variante !== "trinome" && v.length === 1) {
        const l = decoderLigne(v[0]);
        const gB = lireBorne(l.gauche);
        const dB = lireBorne(l.droite);
        const principal = e.variante === "cosinus" ? [0, Math.PI] : [-Math.PI / 2, Math.PI / 2];
        if (gB !== null && dB !== null && Math.abs(gB - principal[0]) < 1e-9 && Math.abs(dB - principal[1]) < 1e-9) return [tx("C'est la restriction principale du cours, mais elle ne contient pas "), lx("x_0"), tx(".")];
      }
      return null;
    }
    case "valeur": {
      const t = e as ExTrig;
      const x = lireValeur(v[0]);
      if (x !== null && Math.abs(x - ARC[t.variante](t.y0.v)) < 1e-9) return [tx(`C'est ${NOM_ARC[t.variante]} de cette valeur, un angle de la restriction principale : il n'est pas dans l'intervalle de l'énoncé.`)];
      return null;
    }
    case "expression": {
      const pts = pointsG(e);
      if (e.variante === "trinome") {
        if (expressionVaut(v[0], (x) => 2 * e.h - g(e, x), pts)) return [tx("Le signe devant la racine : g prend ses valeurs dans la restriction, donc "), lx(e.s > 0 ? `g(x)\\geq ${e.h}` : `g(x)\\leq ${e.h}`), tx(".")];
        return null;
      }
      const t = e as ExTrig;
      if (expressionVaut(v[0], (x) => ARC[t.variante](x), pts)) return [tx(`${NOM_ARC[t.variante]} x seul donne un angle de la restriction principale, pas de l'intervalle de l'énoncé.`)];
      const periode = t.variante === "tangente" ? Math.PI : 2 * Math.PI;
      if (expressionVaut(v[0], (x) => g(e, x) + periode, pts) || expressionVaut(v[0], (x) => g(e, x) - periode, pts))
        return [tx("Ta formule donne un angle de la bonne valeur trigonométrique, mais une période trop loin : g(x) doit tomber dans l'intervalle.")];
      return null;
    }
  }
}
