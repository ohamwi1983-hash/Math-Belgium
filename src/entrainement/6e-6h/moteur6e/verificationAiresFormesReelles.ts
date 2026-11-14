import type { ExerciceAiresFormesReelles } from "../core6e/airesFormesReelles.types";
import type { StatutVerification } from "../moteur/statutVerification";
import { diagnostiquerValeur } from "./equivalenceExponentielle";
import { evaluerExpressionExponentielle, evaluerValeurExponentielle } from "./expressionExponentielle";
import type { Arc, PhaseFormesReelles } from "./modeleAiresFormesReelles";
import { aireCourbe, arcExercice, bornesCorrige, fonctionArcPied, fonctionParcelle, litresPeinture, nombrePots, valeurCout, valeurTotal, valeurVolume } from "./modeleAiresFormesReelles";

/**
 * Couche B (6e) — vérification de `6gen81` « Aires de formes réelles ». Toutes les cibles viennent
 * de `modeleAiresFormesReelles.ts` (valeurs CORRECTES de l'exercice, jamais la saisie d'un écran
 * précédent).
 *
 * Tolérances (annoncées dans les consignes) :
 * - aires : valeur exacte ou arrondie au centième → max(0,01 ; 0,05 % de la valeur), comme 6gen26 ;
 * - résultats du contexte (surface totale, litres, volume, coût du verre, valeur du terrain),
 *   calculés à partir d'une aire éventuellement arrondie au centième → max(0,01 ; 0,1 %) ;
 * - nombre de pots : entier exact (un pot entamé s'achète entier) ;
 * - bornes : 0,01 ; fonction : 1 % de la flèche (coefficients arrondis au millième acceptés).
 *
 * Écran « modéliser » quand la parabole est À RETROUVER (mur, section) : l'élève place l'origine où
 * il veut sur l'axe des abscisses (le long de la base de l'arc). Sa fonction est acceptée si c'est
 * l'arc attendu TRANSLATÉ horizontalement, et ses bornes si ce sont les pieds de l'arc dans SON
 * repère (déduit du sommet de sa parabole).
 */

const TOLERANCE_BORNE = 0.01;

export function toleranceAire(cible: number): number {
  return Math.max(0.01, 5e-4 * Math.abs(cible));
}

export function toleranceContexte(cible: number): number {
  return Math.max(0.01, 1e-3 * Math.abs(cible));
}

/** Retire un éventuel « f(x) = » ou « y = » devant l'expression saisie. */
export function nettoyerFonction(texte: string): string {
  return texte.replace(/^\s*(?:f\s*\(\s*x\s*\)|y)\s*=/i, "");
}

function evaluerFonction(texte: string, x: number): number {
  return evaluerExpressionExponentielle(nettoyerFonction(texte), { x });
}

/** `parse_error` si la saisie n'est pas lisible comme fonction de x. */
function lisibleCommeFonction(texte: string): boolean {
  if (texte.trim() === "") return false;
  try {
    evaluerFonction(texte, 0.37);
    return true;
  } catch {
    return false;
  }
}

function diagnostiquerBorne(texte: string, cible: number): StatutVerification {
  return diagnostiquerValeur(texte, cible, TOLERANCE_BORNE);
}

/** Arc à retrouver, origine libre sur l'axe : statuts [fonction, a, b]. */
function diagnostiquerArcLibre(arc: Arc, valeurs: string[]): StatutVerification[] {
  const [texteF, texteA, texteB] = valeurs;
  const a = evaluerValeurExponentielle(texteA ?? "");
  const b = evaluerValeurExponentielle(texteB ?? "");
  const statutA: StatutVerification = a === null ? "parse_error" : "not_equivalent";
  const statutB: StatutVerification = b === null ? "parse_error" : "not_equivalent";
  if (!lisibleCommeFonction(texteF ?? "")) return ["parse_error", statutA, statutB];

  const tol = 0.01 * arc.fleche + 0.003;
  const pied = fonctionArcPied(arc);
  let statutF: StatutVerification = "not_equivalent";
  let t: number | null = null;
  try {
    // Parabole de l'élève : coefficients lus en 0, 1, 2, sommet, puis translation t de son origine.
    const q0 = evaluerFonction(texteF, 0);
    const q1 = evaluerFonction(texteF, 1);
    const q2 = evaluerFonction(texteF, 2);
    const p2 = (q2 - 2 * q1 + q0) / 2;
    const p1 = q1 - q0 - p2;
    if (Number.isFinite(p2) && Math.abs(p2) > 1e-9) {
      const sommet = -p1 / (2 * p2);
      const tt = sommet - arc.largeur / 2;
      const points = [0, 0.15, 0.3, 0.5, 0.65, 0.85, 1, -0.2, 1.2].map((u) => tt + u * arc.largeur);
      const conforme = points.every((x) => {
        const v = evaluerFonction(texteF, x);
        return Number.isFinite(v) && Math.abs(v - pied(x - tt)) <= tol;
      });
      if (conforme) {
        statutF = "correct";
        t = tt;
      }
    }
  } catch {
    return ["parse_error", statutA, statutB];
  }

  if (a === null || b === null) return [statutF, statutA, statutB];
  if (t !== null) {
    return [statutF, Math.abs(a - t) <= 0.02 ? "correct" : "not_equivalent", Math.abs(b - (t + arc.largeur)) <= 0.02 ? "correct" : "not_equivalent"];
  }
  // Fonction fausse : bornes jugées sur leur écart (la largeur de l'arc).
  const ecartJuste = Math.abs(b - a - arc.largeur) <= 0.02;
  return [statutF, ecartJuste ? "correct" : "not_equivalent", ecartJuste ? "correct" : "not_equivalent"];
}

/** Fonction imposée dans un repère fixé (parcelle à retrouver). */
function diagnostiquerFonctionFixe(texte: string, reference: (x: number) => number, points: number[], tol: number): StatutVerification {
  if (!lisibleCommeFonction(texte)) return "parse_error";
  try {
    for (const x of points) {
      const v = evaluerFonction(texte, x);
      if (!Number.isFinite(v) || Math.abs(v - reference(x)) > tol) return "not_equivalent";
    }
    return "correct";
  } catch {
    return "parse_error";
  }
}

/** Nombre de champs de l'écran (même ordre que `champsEcran` côté ui). */
export function nombreChamps(e: ExerciceAiresFormesReelles, phase: PhaseFormesReelles): number {
  if (phase === "modeliser") return e.modele === "retrouver" ? 3 : 2;
  return phase === "peinture" ? 2 : 1;
}

/** Statut champ par champ. */
export function diagnostiquerChamps(e: ExerciceAiresFormesReelles, phase: PhaseFormesReelles, valeurs: string[]): StatutVerification[] {
  switch (phase) {
    case "modeliser": {
      if (e.situation === "parcelle" && e.modele === "retrouver") {
        const pts = [e.a, (e.a + e.b) / 2, e.b, e.m, 0, e.b + 1];
        return [diagnostiquerFonctionFixe(valeurs[0] ?? "", fonctionParcelle(e), pts, 0.01 * e.k + 0.003), diagnostiquerBorne(valeurs[1] ?? "", e.a), diagnostiquerBorne(valeurs[2] ?? "", e.b)];
      }
      if ((e.situation === "mur" || e.situation === "section") && e.modele === "retrouver") return diagnostiquerArcLibre(arcExercice(e), valeurs);
      const [a, b] = bornesCorrige(e);
      return [diagnostiquerBorne(valeurs[0] ?? "", a), diagnostiquerBorne(valeurs[1] ?? "", b)];
    }
    case "aire": {
      const v = aireCourbe(e);
      return [diagnostiquerValeur(valeurs[0] ?? "", v, toleranceAire(v))];
    }
    case "total": {
      const v = valeurTotal(e);
      return [diagnostiquerValeur(valeurs[0] ?? "", v, toleranceContexte(v))];
    }
    case "peinture": {
      if (e.situation !== "mur") return [];
      const l = litresPeinture(e);
      return [diagnostiquerValeur(valeurs[0] ?? "", l, toleranceContexte(l)), diagnostiquerValeur(valeurs[1] ?? "", nombrePots(e), 1e-6)];
    }
    case "cout": {
      const v = valeurCout(e);
      return [diagnostiquerValeur(valeurs[0] ?? "", v, e.situation === "mur" ? 0.01 : toleranceContexte(v))];
    }
    case "volume": {
      if (e.situation !== "section") return [];
      const v = valeurVolume(e);
      return [diagnostiquerValeur(valeurs[0] ?? "", v, toleranceContexte(v))];
    }
  }
}

/** Statut global : `parse_error` prioritaire, puis `not_equivalent`. */
export function diagnostiquerEcran(e: ExerciceAiresFormesReelles, phase: PhaseFormesReelles, valeurs: string[]): StatutVerification {
  const statuts = diagnostiquerChamps(e, phase, valeurs);
  if (statuts.includes("parse_error")) return "parse_error";
  return statuts.every((s) => s === "correct") ? "correct" : "not_equivalent";
}

export function verifierEcran(e: ExerciceAiresFormesReelles, phase: PhaseFormesReelles, valeurs: string[]): boolean {
  return diagnostiquerEcran(e, phase, valeurs) === "correct";
}
