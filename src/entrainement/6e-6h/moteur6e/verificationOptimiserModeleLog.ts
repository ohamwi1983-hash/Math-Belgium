import type { ExerciceOptimiserLog } from "../core6e/optimiserModeleLog.types";
import type { StatutVerification } from "../moteur/statutVerification";
import { diagnostiquerEquivalenceFonction } from "./equivalenceExponentielle";
import { evaluerValeurExponentielle } from "./expressionExponentielle";
import type { PhaseOptimiserLog } from "./typesOptimiserModeleLog";

/**
 * Couche B (6e) — vérification de `6gen91` « Optimiser un modèle logarithmique ». N'importe rien de
 * `generateurs6e/`. Toutes les valeurs attendues viennent de `modeleNumerique` (source UNIQUE :
 * écran, récapitulatif, corrigé, barème et figure en dérivent). Réutilise les briques du chapitre :
 * `diagnostiquerEquivalenceFonction` (dérivée comparée par échantillonnage, toute forme équivalente
 * acceptée) et `evaluerValeurExponentielle` (saisie exacte : fractions, ln, e, eᵏ, √, virgule).
 *
 * Écrans de valeur EXACTE (écran 3 ; écran 5 en mode `exacte`) : tolérance relative de 1e-7 — une
 * fraction, « e^(3/2) », « 100/e » passent, une valeur décimale approchée (2,72 au lieu de e) non ;
 * celle-ci reçoit un message « donne la valeur exacte » SANS consommer de tentative (comme une
 * saisie illisible). Écran 5 en mode `arrondie` : tolérance = demi-unité de la précision annoncée
 * plus une marge (arrondi intermédiaire), et une forme exacte saisie est acceptée aussi.
 */

export interface DomaineContexte {
  /** Borne gauche exclue (« ]0 ; … ») ou incluse (« [0 ; … »). */
  gaucheOuvert: boolean;
  gauche: number;
  droite: number;
}

export interface ModeleOptimiserLog {
  /** Nom de la variable (`x`, `q`, `v`) et de la fonction (`R`, `B`, `f`, `C`, `D`). */
  variable: string;
  nom: string;
  f: (x: number) => number;
  fp: (x: number) => number;
  domaine: DomaineContexte;
  /** Domaine de l'EXPRESSION seule (sans le contexte) : borne gauche exclue. */
  domaineFormule: number;
  xEtoile: number;
  valeur: number;
  nature: "max" | "min";
  /** Écran 5 : l'optimum et la valeur optimale traduits dans les unités du contexte. */
  optimumContexte: number;
  valeurContexte: number;
  /** Tolérances de l'écran 5 (absolues) ; `null` = valeur exacte exigée (tolérance relative 1e-7). */
  tolerances: { optimum: number | null; valeur: number | null };
  /** Points d'échantillonnage de la dérivée, dans le domaine du contexte. */
  points: number[];
}

function pointsDans(g: number, d: number): number[] {
  return [0.13, 0.37, 0.61, 0.89].map((p) => g + (d - g) * p);
}

export function modeleNumerique(e: ExerciceOptimiserLog): ModeleOptimiserLog {
  const exact = e.mode === "exacte";
  switch (e.variante) {
    case "engrais": {
      const xs = (e.a - e.b) / e.b;
      const f = (x: number) => e.c + e.a * Math.log(1 + x) - e.b * x;
      return {
        variable: "x",
        nom: "R",
        f,
        fp: (x) => e.a / (1 + x) - e.b,
        domaine: { gaucheOuvert: false, gauche: 0, droite: e.M },
        domaineFormule: -1,
        xEtoile: xs,
        valeur: f(xs),
        nature: "max",
        optimumContexte: 100 * xs,
        valeurContexte: f(xs),
        tolerances: { optimum: 0.5, valeur: 0.06 },
        points: pointsDans(0, e.M),
      };
    }
    case "benefice": {
      const qs = e.a / e.b;
      const f = (q: number) => e.a * Math.log(q) - e.b * q - e.c;
      return {
        variable: "q",
        nom: "B",
        f,
        fp: (q) => e.a / q - e.b,
        domaine: { gaucheOuvert: true, gauche: 0, droite: e.M },
        domaineFormule: 0,
        xEtoile: qs,
        valeur: f(qs),
        nature: "max",
        optimumContexte: 100 * qs,
        valeurContexte: 1000 * f(qs),
        tolerances: { optimum: 0.5, valeur: 1.5 },
        points: pointsDans(0, e.M),
      };
    }
    case "rendement-moyen": {
      const xs = Math.exp(e.k);
      const f = (x: number) => (e.a * Math.log(x) + e.d) / x;
      return {
        variable: "x",
        nom: "f",
        f,
        fp: (x) => (e.a - e.d - e.a * Math.log(x)) / (x * x),
        domaine: { gaucheOuvert: true, gauche: 0, droite: e.M },
        domaineFormule: 0,
        xEtoile: xs,
        valeur: f(xs),
        nature: "max",
        optimumContexte: 1000 * xs,
        valeurContexte: f(xs),
        tolerances: exact ? { optimum: null, valeur: null } : { optimum: 1, valeur: 0.006 },
        points: pointsDans(0, e.M),
      };
    }
    case "cout-moyen": {
      const xs = Math.exp(e.k);
      const f = (x: number) => e.a * x * Math.log(x) - e.b * x + e.c;
      return {
        variable: "x",
        nom: "C",
        f,
        fp: (x) => e.a * Math.log(x) + e.a - e.b,
        domaine: { gaucheOuvert: true, gauche: 0, droite: e.M },
        domaineFormule: 0,
        xEtoile: xs,
        valeur: f(xs),
        nature: "min",
        optimumContexte: 100 * xs,
        valeurContexte: f(xs),
        tolerances: exact ? { optimum: null, valeur: null } : { optimum: 1, valeur: 0.006 },
        points: pointsDans(0, e.M),
      };
    }
    case "debit": {
      const vs = Math.exp(e.k);
      const f = (v: number) => e.a * v - e.b * v * Math.log(v);
      return {
        variable: "v",
        nom: "D",
        f,
        fp: (v) => e.a - e.b - e.b * Math.log(v),
        domaine: { gaucheOuvert: true, gauche: 0, droite: e.M },
        domaineFormule: 0,
        xEtoile: vs,
        valeur: f(vs),
        nature: "max",
        optimumContexte: 10 * vs,
        valeurContexte: 100 * f(vs),
        tolerances: exact ? { optimum: null, valeur: null } : { optimum: 1, valeur: 1 },
        points: pointsDans(0, e.M),
      };
    }
  }
}

/** Identifiant de l'option correcte de l'écran « nature » (option canonique 0). */
export const ID_NATURE_CORRECTE = "0";

// ============================================================================
// Lecture des saisies.
// ============================================================================

/** « 12 045 » (espace des milliers) se lit 12045, jamais 12 × 45. */
function sansMilliers(texte: string): string {
  return texte.replace(/(\d)[\s  ]+(?=\d{3}(?!\d))/g, "$1");
}

function lireValeur(texte: string): number | null {
  if (texte.trim() === "") return null;
  const v = evaluerValeurExponentielle(sansMilliers(texte));
  return v === null || !Number.isFinite(v) ? null : v;
}

function egalExact(v: number, cible: number): boolean {
  return Math.abs(v - cible) <= 1e-7 * Math.max(1, Math.abs(cible));
}

/** Vrai si `v` approche `cible` (à 1 % près) sans en être la valeur exacte. */
function approchee(v: number, cible: number): boolean {
  return !egalExact(v, cible) && Math.abs(v - cible) <= 0.01 * Math.max(1, Math.abs(cible));
}

export type DiagnosticOptimiser = StatutVerification | "approchee";

/** Diagnostic d'un champ de valeur : `tolerance === null` = valeur exacte exigée. */
function diagnostiquerChamp(texte: string, cible: number, tolerance: number | null): DiagnosticOptimiser {
  const v = lireValeur(texte);
  if (v === null) return "parse_error";
  if (tolerance === null) {
    if (egalExact(v, cible)) return "correct";
    return approchee(v, cible) ? "approchee" : "not_equivalent";
  }
  return Math.abs(v - cible) <= tolerance ? "correct" : "not_equivalent";
}

function combiner(diags: DiagnosticOptimiser[]): DiagnosticOptimiser {
  if (diags.includes("parse_error")) return "parse_error";
  if (diags.includes("approchee")) return "approchee";
  return diags.every((d) => d === "correct") ? "correct" : "not_equivalent";
}

/**
 * Diagnostic d'un écran. `valeurs` :
 * - `domaine` : [crochet gauche, borne gauche, borne droite, crochet droit] (crochets « [ » / « ] ») ;
 * - `derivee`, `zero` : [texte] ; `nature` : [id d'option] ;
 * - `valeur` : [optimum en contexte, valeur optimale en contexte].
 */
export function diagnostiquerEcranDetaille(e: ExerciceOptimiserLog, phase: PhaseOptimiserLog, valeurs: string[]): DiagnosticOptimiser {
  const m = modeleNumerique(e);
  switch (phase) {
    case "domaine": {
      const [cg, bg, bd, cd] = valeurs;
      const g = lireValeur(bg ?? "");
      const d = lireValeur(bd ?? "");
      if (g === null || d === null) return "parse_error";
      const crochetsJustes = cg === (m.domaine.gaucheOuvert ? "]" : "[") && cd === "]";
      return crochetsJustes && egalExact(g, m.domaine.gauche) && egalExact(d, m.domaine.droite) ? "correct" : "not_equivalent";
    }
    case "derivee": {
      const echelle = Math.max(1, ...m.points.map((x) => Math.abs(m.fp(x))));
      return diagnostiquerEquivalenceFonction(valeurs[0] ?? "", m.fp, m.points, Math.max(0.01, 1e-3 * echelle), m.variable);
    }
    case "zero":
      return diagnostiquerChamp(valeurs[0] ?? "", m.xEtoile, null);
    case "nature":
      return valeurs[0] === ID_NATURE_CORRECTE ? "correct" : "not_equivalent";
    case "valeur":
      return combiner([diagnostiquerChamp(valeurs[0] ?? "", m.optimumContexte, m.tolerances.optimum), diagnostiquerChamp(valeurs[1] ?? "", m.valeurContexte, m.tolerances.valeur)]);
  }
}

export function diagnostiquerEcran(e: ExerciceOptimiserLog, phase: PhaseOptimiserLog, valeurs: string[]): StatutVerification {
  const d = diagnostiquerEcranDetaille(e, phase, valeurs);
  return d === "approchee" ? "not_equivalent" : d;
}

/** Message d'une saisie qui NE consomme PAS de tentative (illisible, ou approchée alors que la
 * valeur exacte est demandée) ; `null` sinon. */
export function messageSaisieNonDecomptee(e: ExerciceOptimiserLog, phase: PhaseOptimiserLog, valeurs: string[]): string | null {
  const d = diagnostiquerEcranDetaille(e, phase, valeurs);
  if (d === "parse_error") {
    return phase === "domaine"
      ? "Bornes non reconnues — écris chaque borne comme un nombre seul (sans unité) ; aucune tentative n'est décomptée."
      : "Écriture non reconnue — vérifie la syntaxe (parenthèses, nombre seul sans unité, virgule décimale) ; aucune tentative n'est décomptée.";
  }
  if (d === "approchee") return "C'est une valeur approchée : donne la valeur EXACTE (fraction, e, puissance de e…) ; aucune tentative n'est décomptée.";
  return null;
}

export function verifierEcran(e: ExerciceOptimiserLog, phase: PhaseOptimiserLog, valeurs: string[]): boolean {
  return diagnostiquerEcranDetaille(e, phase, valeurs) === "correct";
}
