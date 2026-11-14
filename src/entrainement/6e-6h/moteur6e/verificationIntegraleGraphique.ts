import type { ExerciceIntegraleGraphique, Morceau } from "../core6e/integraleGraphique.types";
import type { StatutVerification } from "../moteur/statutVerification";
import { evaluerValeurExponentielle } from "./expressionExponentielle";
import type { PhaseIntegraleGraphique } from "./typesIntegraleGraphique";

/**
 * Couche B (6e) — valeurs exactes et vérification de `6gen77`. SOURCE UNIQUE des réponses attendues :
 * l'écran, le récapitulatif, le corrigé et le barème en dérivent.
 *
 * Toute intégrale de la variante est de la forme q + p·π avec q et p multiples de 1/4 (triangles et
 * trapèzes à côtés entiers : demi-unités ; demi-disque πr²/2 ; quart de disque πr²/4) : elle est
 * représentée EXACTEMENT par `{ q4, p4 }` (valeur = q4/4 + p4·π/4). La saisie (fraction, π, « 2π »,
 * « 7/2 − π »…) est lue par l'évaluateur d'expressions du chantier 6e et comparée à 1e-6 près :
 * une valeur arrondie (3,14…) n'est PAS acceptée, la consigne demande la valeur exacte.
 */

export interface ValeurExacte {
  q4: number;
  p4: number;
}

export const ZERO: ValeurExacte = { q4: 0, p4: 0 };

export function somme(valeurs: ValeurExacte[]): ValeurExacte {
  return valeurs.reduce((s, v) => ({ q4: s.q4 + v.q4, p4: s.p4 + v.p4 }), ZERO);
}

export function oppose(v: ValeurExacte): ValeurExacte {
  return { q4: -v.q4, p4: -v.p4 };
}

export function difference(a: ValeurExacte, b: ValeurExacte): ValeurExacte {
  return somme([a, oppose(b)]);
}

export function valeurNumerique(v: ValeurExacte): number {
  return v.q4 / 4 + (v.p4 * Math.PI) / 4;
}

/** Valeur absolue exacte (q et p sont de même signe sur un intervalle de signe constant ; sinon
 * on se fie à la valeur numérique). */
export function valeurAbsolue(v: ValeurExacte): ValeurExacte {
  return valeurNumerique(v) < 0 ? oppose(v) : v;
}

export function signeMorceau(m: Morceau): 1 | -1 {
  if (m.type === "segment") return m.y0 + m.y1 > 0 ? 1 : -1;
  return m.signe;
}

/** Intégrale signée exacte d'un morceau (aire de la figure, négative sous l'axe). */
export function integraleMorceau(m: Morceau): ValeurExacte {
  if (m.type === "segment") return { q4: 2 * (m.x1 - m.x0) * (m.y0 + m.y1), p4: 0 };
  if (m.type === "demiDisque") return { q4: 0, p4: m.signe * 2 * m.r * m.r };
  return { q4: 0, p4: m.signe * m.r * m.r };
}

/** Valeur de f en x (pour les figures). */
export function valeurEn(morceaux: Morceau[], x: number): number {
  const m = morceaux.find((p) => x >= p.x0 - 1e-12 && x <= p.x1 + 1e-12) ?? morceaux[morceaux.length - 1];
  if (m.type === "segment") return m.y0 + ((m.y1 - m.y0) * (x - m.x0)) / (m.x1 - m.x0);
  const cx = m.type === "demiDisque" ? (m.x0 + m.x1) / 2 : m.sens === "montant" ? m.x1 : m.x0;
  return m.signe * Math.sqrt(Math.max(0, m.r * m.r - (x - cx) * (x - cx)));
}

/** Bornes intérieures des morceaux : les abscisses où il faut découper (variante `calcul`). */
export function decoupesAttendues(e: ExerciceIntegraleGraphique): number[] {
  return e.morceaux.slice(1).map((m) => m.x0);
}

export interface IntervalleSigne {
  x0: number;
  x1: number;
  signe: 1 | -1;
  morceaux: Morceau[];
  valeur: ValeurExacte;
}

/** Intervalles de signe constant (morceaux consécutifs de même signe regroupés). */
export function intervallesSigne(e: ExerciceIntegraleGraphique): IntervalleSigne[] {
  const res: IntervalleSigne[] = [];
  for (const m of e.morceaux) {
    const s = signeMorceau(m);
    const dernier = res[res.length - 1];
    if (dernier && dernier.signe === s) {
      dernier.x1 = m.x1;
      dernier.morceaux.push(m);
    } else {
      res.push({ x0: m.x0, x1: m.x1, signe: s, morceaux: [m], valeur: ZERO });
    }
  }
  for (const i of res) i.valeur = somme(i.morceaux.map(integraleMorceau));
  return res;
}

/** Abscisses (dans ]a ; b[) où f change de signe (variante `aireIntegrale`). */
export function zerosChangementSigne(e: ExerciceIntegraleGraphique): number[] {
  return intervallesSigne(e).slice(1).map((i) => i.x0);
}

/** Intégrale de f sur toute la partie tracée. */
export function integraleTotale(e: ExerciceIntegraleGraphique): ValeurExacte {
  return somme(e.morceaux.map(integraleMorceau));
}

/** Aire de la région entre la courbe et l'axe (somme des valeurs absolues). */
export function aireTotale(e: ExerciceIntegraleGraphique): ValeurExacte {
  return somme(intervallesSigne(e).map((i) => valeurAbsolue(i.valeur)));
}

/** `proprietes` : intégrale DONNÉE sur le grand intervalle (partie inconnue + partie connue). */
export function valeurDonnee(e: Extract<ExerciceIntegraleGraphique, { variante: "proprietes" }>): ValeurExacte {
  return somme([{ q4: 4 * e.inconnue, p4: 0 }, integraleTotale(e)]);
}

/** Valeurs exactes attendues, champ par champ, pour les écrans à champs. */
export function valeursAttendues(e: ExerciceIntegraleGraphique, phase: PhaseIntegraleGraphique): ValeurExacte[] {
  if (e.variante === "calcul") {
    if (phase === "ecran2") return e.morceaux.map(integraleMorceau);
    return [integraleTotale(e)];
  }
  if (e.variante === "aireIntegrale") {
    if (phase === "ecran2") return intervallesSigne(e).map((i) => i.valeur);
    return [integraleTotale(e), aireTotale(e)];
  }
  if (phase === "ecran1") return [integraleTotale(e)];
  if (phase === "ecran2") return [{ q4: 4 * e.inconnue, p4: 0 }];
  return [{ q4: -4 * e.inconnue, p4: 0 }];
}

/** Abscisses attendues sur l'écran de choix (découpe ou changements de signe). */
export function abscissesAttendues(e: ExerciceIntegraleGraphique): number[] {
  return e.variante === "aireIntegrale" ? zerosChangementSigne(e) : decoupesAttendues(e);
}

/** Codage de la sélection d'abscisses dans `valeurs[0]` : liste triée, séparée par « ; ». */
export function encoderSelection(abscisses: number[]): string {
  return [...abscisses].sort((x, y) => x - y).join(";");
}

function diagnostiquerExact(texte: string, cible: ValeurExacte): StatutVerification {
  const v = evaluerValeurExponentielle(texte);
  if (v === null) return "parse_error";
  return Math.abs(v - valeurNumerique(cible)) <= 1e-6 * Math.max(1, Math.abs(valeurNumerique(cible))) ? "correct" : "not_equivalent";
}

/** Statut champ par champ (`[statut]` pour l'écran de choix). */
export function diagnostiquerChamps(e: ExerciceIntegraleGraphique, phase: PhaseIntegraleGraphique, valeurs: string[]): StatutVerification[] {
  if (phase === "ecran1" && e.variante !== "proprietes") {
    return [valeurs[0] === encoderSelection(abscissesAttendues(e)) ? "correct" : "not_equivalent"];
  }
  return valeursAttendues(e, phase).map((cible, i) => diagnostiquerExact(valeurs[i] ?? "", cible));
}

export function diagnostiquerEcran(e: ExerciceIntegraleGraphique, phase: PhaseIntegraleGraphique, valeurs: string[]): StatutVerification {
  const statuts = diagnostiquerChamps(e, phase, valeurs);
  if (statuts.includes("parse_error")) return "parse_error";
  return statuts.every((s) => s === "correct") ? "correct" : "not_equivalent";
}

export function verifierEcran(e: ExerciceIntegraleGraphique, phase: PhaseIntegraleGraphique, valeurs: string[]): boolean {
  return diagnostiquerEcran(e, phase, valeurs) === "correct";
}
