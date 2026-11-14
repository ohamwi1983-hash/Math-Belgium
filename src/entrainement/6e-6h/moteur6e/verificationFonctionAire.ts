import type { ExerciceFonctionAire } from "../core6e/fonctionAire.types";
import type { StatutVerification } from "../moteur/statutVerification";
import { diagnostiquerValeur } from "./equivalenceExponentielle";
import { evaluerEnX } from "./expressionExponentielle";
import type { ValeurExacte } from "./modeleFonctionAire";
import {
  aireExacte,
  candidatsExtremums,
  evaluerF,
  extremumsA,
  integraleExacte,
  intervallesSens,
  natureEn,
  pointsTableau,
  valeurNumerique,
} from "./modeleFonctionAire";
import type { PhaseFonctionAire } from "./typesFonctionAire";

/**
 * Couche B (6e) — vérification de `6gen78`. N'importe rien de `generateurs6e/`. Valeurs numériques
 * jugées par `diagnostiquerValeur` (même moteur d'expressions que 6gen25/6gen26 : fractions, π,
 * √…) ; tolérance 0,006 : la valeur exacte, ou un arrondi au centième de π/2, 3π/4… est accepté.
 * Équation de tangente : expression en x comparée en plusieurs points.
 */

export const TOLERANCE = 0.006;

/** Intervalles de l'écran `aires` : entre les abscisses consécutives de {a} ∪ points. */
export function intervallesAires(e: ExerciceFonctionAire): [number, number][] {
  const coupes = [...new Set([...e.points, e.a])].sort((p, q) => p - q);
  return coupes.slice(1).map((c, i) => [coupes[i], c] as [number, number]);
}

/** Abscisses de l'écran `valeursA` : a d'abord (A(a) = 0, piège « oublier A(a) = 0 »), puis les
 * points demandés. */
export function abscissesValeursA(e: ExerciceFonctionAire): number[] {
  return [e.a, ...e.points];
}

/** Valeurs exactes attendues, champ par champ (écrans à champs numériques). */
export function valeursExactesAttendues(e: ExerciceFonctionAire, phase: PhaseFonctionAire): ValeurExacte[] {
  switch (phase) {
    case "aires":
      return intervallesAires(e).map(([u, v]) => integraleExacte(e, u, v));
    case "valeursA":
      return abscissesValeursA(e).map((x) => aireExacte(e, x));
    case "tableau":
      return pointsTableau(e).map((x) => aireExacte(e, x));
    case "valeursExt":
      return extremumsA(e).map((m) => aireExacte(e, m.x));
    case "tangente":
      return [aireExacte(e, e.points[0])];
    default:
      return [];
  }
}

/** f(p) aux points de l'écran `pentes` (entier, ou ±r au centre d'un demi-disque). */
export function pentesAttendues(e: ExerciceFonctionAire): number[] {
  return e.points.map((p) => Math.round(evaluerF(e, p) * 1e9) / 1e9 + 0);
}

/** Tangente à la courbe de A au point d'abscisse p₁ : y = m(x − p₁) + A(p₁). */
export function tangenteAttendue(e: ExerciceFonctionAire): (x: number) => number {
  const p = e.points[0];
  const m = pentesAttendues(e)[0];
  const ap = valeurNumerique(aireExacte(e, p));
  return (x) => m * (x - p) + ap;
}

function diagnostiquerTangente(e: ExerciceFonctionAire, texte: string): StatutVerification {
  const membre = texte.replace(/^\s*y\s*=/i, "");
  const cible = tangenteAttendue(e);
  try {
    for (const x of [-2, -0.5, 0, 1, 2.5, 4]) {
      const v = evaluerEnX(membre, x);
      if (!Number.isFinite(v) || Math.abs(v - cible(x)) > TOLERANCE * 2) return "not_equivalent";
    }
    return "correct";
  } catch {
    return "parse_error";
  }
}

/** Option correcte de chaque ligne d'un écran à choix (`sens` : « c »/« d » ; `nature` :
 * « max »/« min »/« aucun » ; `choixGraphique` : indice canonique « 0 »). */
export function choixCorrects(e: ExerciceFonctionAire, phase: PhaseFonctionAire): string[] {
  if (phase === "sens") return intervallesSens(e).map((i) => (i.sens > 0 ? "c" : "d"));
  if (phase === "nature") return candidatsExtremums(e).map((x) => natureEn(e, x));
  if (phase === "choixGraphique") return ["0"];
  return [];
}

/** Statut champ par champ (ligne par ligne pour un écran à choix). */
export function diagnostiquerChamps(e: ExerciceFonctionAire, phase: PhaseFonctionAire, valeurs: string[]): StatutVerification[] {
  const corrects = choixCorrects(e, phase);
  if (corrects.length > 0) return corrects.map((c, i) => (valeurs[i] === c ? "correct" : "not_equivalent"));
  if (phase === "pentes") return pentesAttendues(e).map((m, i) => diagnostiquerValeur(valeurs[i] ?? "", m, TOLERANCE));
  const exactes = valeursExactesAttendues(e, phase).map((v, i) => diagnostiquerValeur(valeurs[i] ?? "", valeurNumerique(v), TOLERANCE));
  if (phase === "tangente") return [...exactes, diagnostiquerTangente(e, valeurs[1] ?? "")];
  return exactes;
}

/** Statut global : `parse_error` prioritaire (message de syntaxe, aucune tentative décomptée). */
export function diagnostiquerEcran(e: ExerciceFonctionAire, phase: PhaseFonctionAire, valeurs: string[]): StatutVerification {
  const statuts = diagnostiquerChamps(e, phase, valeurs);
  if (statuts.includes("parse_error")) return "parse_error";
  return statuts.every((s) => s === "correct") ? "correct" : "not_equivalent";
}

export function verifierEcran(e: ExerciceFonctionAire, phase: PhaseFonctionAire, valeurs: string[]): boolean {
  return diagnostiquerEcran(e, phase, valeurs) === "correct";
}
