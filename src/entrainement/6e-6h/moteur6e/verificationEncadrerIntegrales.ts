import type { ExerciceEncadrerIntegrales, NombreExact } from "../core6e/encadrerIntegrales.types";
import type { StatutVerification } from "../moteur/statutVerification";
import { evaluerValeurExponentielle } from "./expressionExponentielle";
import { estPhaseChoix } from "./typesEncadrerIntegrales";
import type { PhaseChampsEncadrer, PhaseChoixEncadrer, PhaseEncadrerIntegrales } from "./typesEncadrerIntegrales";

/**
 * Couche B (6e) — vérification de `6gen79`. Champs libres : valeur exacte (fractions, e, ln, √,
 * puissances — même évaluateur que 6gen23 à 6gen28, `expressionExponentielle.ts`) ou arrondie au
 * centième ; tolérance de 6gen26 (0,01, relative pour les grands nombres). Choix fermés : l'identifiant
 * de l'option correcte. N'importe rien de `generateurs6e/`.
 */

const TOLERANCE = 0.01;

function tolerance(cible: number): number {
  return Math.max(TOLERANCE, 5e-4 * Math.abs(cible));
}

function lire(texte: string): number | null {
  return evaluerValeurExponentielle(texte ?? "");
}

function proche(v: number | null, cible: number): boolean {
  return v !== null && Math.abs(v - cible) <= tolerance(cible);
}

/** Valeurs attendues, champ par champ (source unique : écran, récapitulatif, corrigé, barème). */
export function cibles(e: ExerciceEncadrerIntegrales, phase: PhaseChampsEncadrer): NombreExact[] {
  if (e.variante !== "encadrer" && e.variante !== "moyenne") return [];
  switch (phase) {
    case "m":
      return [e.m];
    case "M":
      return [e.M];
    case "mM":
      return [e.m, e.M];
    case "bornes":
    case "bornesIntegrale":
      return [e.borneInf, e.borneSup];
    case "bornesMoyenne":
      return [e.m, e.M];
  }
}

/** Identifiant de l'option correcte d'un écran à choix fermé. */
export function optionCorrecte(e: ExerciceEncadrerIntegrales, phase: PhaseChoixEncadrer): string {
  if (e.variante === "signe") {
    if (phase === "conclusionSigne") {
      const positif = (e.signeF === "positif") !== e.inverse;
      return positif ? "positif" : "negatif";
    }
    return e.signeF;
  }
  if (e.variante === "comparer") {
    if (phase === "inegalite") return e.issue;
    return e.issue === "fInfG" ? "inf" : e.issue === "fSupG" ? "sup" : "inconnu";
  }
  return "";
}

/** Statut champ par champ (`[statut]` pour un écran à choix). */
export function diagnostiquerChamps(e: ExerciceEncadrerIntegrales, phase: PhaseEncadrerIntegrales, valeurs: string[]): StatutVerification[] {
  if (estPhaseChoix(phase)) return [valeurs[0] === optionCorrecte(e, phase) ? "correct" : "not_equivalent"];
  return cibles(e, phase).map((c, i) => {
    const v = lire(valeurs[i] ?? "");
    if (v === null) return "parse_error";
    return proche(v, c.valeur) ? "correct" : "not_equivalent";
  });
}

/** Statut global : `parse_error` prioritaire (aucune tentative décomptée), puis `not_equivalent`. */
export function diagnostiquerEcran(e: ExerciceEncadrerIntegrales, phase: PhaseEncadrerIntegrales, valeurs: string[]): StatutVerification {
  const statuts = diagnostiquerChamps(e, phase, valeurs);
  if (statuts.includes("parse_error")) return "parse_error";
  return statuts.every((s) => s === "correct") ? "correct" : "not_equivalent";
}

export function verifierEcran(e: ExerciceEncadrerIntegrales, phase: PhaseEncadrerIntegrales, valeurs: string[]): boolean {
  return diagnostiquerEcran(e, phase, valeurs) === "correct";
}

/** Message ciblé après une réponse fausse (en plus du compteur de tentatives) — jamais la réponse. */
export function messageSpecifique(e: ExerciceEncadrerIntegrales, phase: PhaseEncadrerIntegrales, valeurs: string[]): string | null {
  if (e.variante !== "encadrer" && e.variante !== "moyenne") return null;
  const v = valeurs.map((x) => lire(x ?? ""));
  const unite = Math.abs(e.longueur.valeur - 1) < 1e-9;
  switch (phase) {
    case "m":
      return Math.abs(e.M.valeur - e.m.valeur) > 1e-9 && proche(v[0], e.M.valeur) ? "C'est la plus grande valeur de f sur l'intervalle, pas la plus petite." : null;
    case "M":
      return Math.abs(e.M.valeur - e.m.valeur) > 1e-9 && proche(v[0], e.m.valeur) ? "C'est la plus petite valeur de f sur l'intervalle, pas la plus grande." : null;
    case "mM":
      return proche(v[0], e.M.valeur) && proche(v[1], e.m.valeur) ? "Tu as inversé le minimum et le maximum." : null;
    case "bornes":
    case "bornesIntegrale":
      if (!unite && proche(v[0], e.m.valeur) && proche(v[1], e.M.valeur)) return "Tu as encadré f(x) : pour encadrer l'intégrale, multiplie chaque membre par la longueur b − a de l'intervalle.";
      if (proche(v[0], e.borneSup.valeur) && proche(v[1], e.borneInf.valeur)) return "La borne inférieure doit être la plus petite des deux.";
      return null;
    case "bornesMoyenne":
      if (!unite && proche(v[0], e.borneInf.valeur) && proche(v[1], e.borneSup.valeur)) return "C'est l'encadrement de l'intégrale : la valeur moyenne s'obtient en divisant l'intégrale par b − a.";
      return null;
    default:
      return null;
  }
}
