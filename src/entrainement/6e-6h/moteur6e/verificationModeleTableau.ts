import type { ExerciceModeleTableau } from "../core6e/modeleTableau.types";
import type { StatutVerification } from "../moteur/statutVerification";
import type { Frag } from "../ui6e/ecransExp.types";
import { lx, tx } from "../ui6e/ecransExp.types";
import { valeurModele } from "../generateurs6e/modeleTableau";
import { ctx, differences, mesures, pasArrondi, rapports } from "../ui6e/formatModeleTableau";
import type { PhaseModeleTableau } from "../ui6e/formatModeleTableau";
import { qVal } from "../ui6e/nombresExp";
import { egal, estApprochee, lireNombre, MESSAGE_APPROCHEE } from "./lectureValeurExp";

/**
 * Vérification de 6gen147. Rapports : valeur exacte (fraction, décimal) ou arrondie au centième.
 * Paramètres : valeurs exactes (1,5 ou 3/2). Prévision : la valeur exacte ou son arrondi à la
 * précision demandée (centième, ou unité pour un effectif). Une valeur trop peu précise reçoit un
 * message sans consommer de tentative.
 */

type E = ExerciceModeleTableau;

function attendus(e: E, phase: PhaseModeleTableau): number[] {
  if (phase === "rapports") return rapports(e).map(qVal);
  if (phase === "parametres") return e.genre === "exponentiel" ? [qVal(e.b), qVal(e.a)] : [qVal(e.m), qVal(e.b)];
  return [qVal(valeurModele(e, e.T))];
}

function tolerance(e: E, phase: PhaseModeleTableau): number {
  if (phase === "rapports") return 0.005 + 1e-9;
  if (phase === "prevision") return pasArrondi(e) / 2 + 1e-9;
  return 0;
}

export function diagnostiquer(e: E, phase: PhaseModeleTableau, valeurs: string[]): StatutVerification[] {
  if (phase === "verdict") return [valeurs[0] === e.genre ? "correct" : "not_equivalent"];
  const att = attendus(e, phase);
  const tol = tolerance(e, phase);
  return att.map((a, i) => {
    const v = lireNombre(valeurs[i] ?? "");
    if (v === null) return "parse_error";
    return egal(v, a) || (tol > 0 && Math.abs(v - a) <= tol) ? "correct" : "not_equivalent";
  });
}

export function approchee(e: E, phase: PhaseModeleTableau, valeurs: string[]): string | null {
  if (phase === "verdict") return null;
  const att = attendus(e, phase);
  const tol = tolerance(e, phase);
  for (let i = 0; i < att.length; i++) {
    const s = valeurs[i] ?? "";
    const v = lireNombre(s);
    if (v === null || egal(v, att[i]) || Math.abs(v - att[i]) <= tol) continue;
    if (phase === "parametres" && estApprochee(s, att[i])) return MESSAGE_APPROCHEE;
    // « trop arrondie » : moins de décimales que demandé, et c'est bien l'arrondi de la valeur juste
    const tapees = /[.,](\d+)\s*$/.exec(s.trim())?.[1].length ?? 0;
    const voulues = phase === "rapports" ? 2 : ctx(e).entier ? 0 : 2;
    if (phase !== "parametres" && tapees < voulues && Math.abs(v - att[i]) <= 0.5 * 10 ** -tapees + 1e-9) {
      return phase === "rapports"
        ? "Ta valeur est trop arrondie : donne le rapport exact, ou arrondi au centième. Cela ne compte pas comme une tentative."
        : `Ta valeur est trop arrondie : on demande ${ctx(e).entier ? "l'arrondi à l'unité" : "l'arrondi au centième"}. Cela ne compte pas comme une tentative.`;
    }
  }
  return null;
}

export function piege(e: E, phase: PhaseModeleTableau, valeurs: string[]): Frag[] | null {
  if (phase === "verdict") return [tx(e.genre === "exponentiel" ? "Les différences ne sont pas égales, mais les rapports le sont : c'est le signe d'un modèle exponentiel." : "Les rapports ne sont pas égaux, mais les différences le sont : c'est le signe d'un modèle linéaire.")];
  const v = valeurs.map((s) => lireNombre(s));
  if (phase === "rapports") {
    const d = differences(e).map(qVal);
    const inv = rapports(e).map((r) => 1 / qVal(r));
    if (v.every((x, i) => x !== null && egal(x, d[i]))) return [tx("Ce sont des différences : un rapport est une division d'une mesure par la précédente.")];
    if (v.every((x, i) => x !== null && Math.abs(x - inv[i]) <= 0.005)) return [tx("Rapport inversé : divise chaque mesure par la précédente, pas l'inverse.")];
    return null;
  }
  if (phase === "parametres") {
    const y = mesures(e).map(qVal);
    if (e.genre === "exponentiel") {
      if (v[0] !== null && egal(v[0], y[1])) return [lx("b"), tx(" est la valeur en "), lx("t=0"), tx(".")];
      if (v[1] !== null && e.h === 2 && egal(v[1], qVal(rapports(e)[0]))) return [tx("Le rapport porte sur un écart de deux unités : il vaut "), lx("a^{2}"), tx(", pas "), lx("a"), tx(".")];
      if (v[1] !== null && egal(v[1], qVal(differences(e)[0]) / e.h)) return [lx("a"), tx(" est un facteur (un rapport), pas une différence.")];
      return null;
    }
    if (v[0] !== null && e.h === 2 && egal(v[0], qVal(differences(e)[0]))) return [tx("La différence porte sur un écart de deux unités : elle vaut "), lx("2m"), tx(".")];
    if (v[0] !== null && egal(v[0], qVal(rapports(e)[0]))) return [lx("m"), tx(" est une différence par unité de "), lx("t"), tx(", pas un rapport.")];
    if (v[1] !== null && egal(v[1], y[1])) return [lx("p"), tx(" est la valeur en "), lx("t=0"), tx(".")];
    return null;
  }
  const x = v[0];
  if (x === null) return null;
  if (e.genre === "exponentiel" && e.h === 2) {
    const faux = qVal(e.b) * qVal(rapports(e)[0]) ** e.T;
    if (Math.abs(x - faux) <= pasArrondi(e)) return [tx("Le facteur par unité est "), lx("a"), tx(", pas le rapport sur deux unités "), lx("a^{2}"), tx(".")];
  }
  return null;
}
