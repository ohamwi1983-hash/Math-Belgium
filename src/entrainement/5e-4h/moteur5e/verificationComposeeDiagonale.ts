import type { ExerciceComposeeDiagonale } from "../core5e/composeeDiagonale";
import { valeurCourbe } from "../core5e/composeeDiagonale";
import type { StatutVerification } from "../moteur/statutVerification";
import type { Frag } from "../ui5e/ecransTrigo.types";
import { lx, tx } from "../ui5e/ecransTrigo.types";
import type { PhaseComposeeDiagonale } from "../ui5e/formatComposeeDiagonale";
import { courbeI, courbeO, nomI, nomO } from "../ui5e/formatComposeeDiagonale";
import { qVal } from "../ui5e/nombresTrigo";
import { lireRationnel } from "./ensembleSaisi";

/**
 * Couche B — vérification de `5gen63`. Lectures entières (« − – — », virgule, « 3,0 » lus) ;
 * choix « existe / n'existe pas » à une tentative. Messages ciblés : mauvaise courbe (ordre), abscisse
 * donnée au lieu de l'ordonnée, arrêt sur la diagonale, f(a) au lieu de f(g(a)).
 */

type E = ExerciceComposeeDiagonale;
type P = PhaseComposeeDiagonale;

export function diagnostiquer(e: E, phase: P, valeurs: string[]): StatutVerification[] {
  if (phase === "existence") return [valeurs[0] === (e.existe ? "existe" : "nexistepas") ? "correct" : "not_equivalent"];
  const r = lireRationnel(valeurs[0]);
  if (!r) return ["parse_error"];
  const cible = phase === "premiere" ? e.v : e.w!;
  return [Math.abs(qVal(r) - cible) < 1e-9 ? "correct" : "not_equivalent"];
}

export function piege(e: E, phase: P, valeurs: string[]): Frag[] | null {
  if (phase === "existence") return null;
  const r = lireRationnel(valeurs[0]);
  if (!r) return null;
  const x = qVal(r);
  const i = nomI(e);
  const o = nomO(e);
  if (phase === "premiere") {
    const oa = valeurCourbe(courbeO(e), e.a);
    if (o !== i && oa !== null && x === oa && oa !== e.v) return [tx("Tu as lu sur "), lx(`C_${o}`), tx(" : dans "), lx(`${o}\\circ ${i}`), tx(", c'est "), lx(i), tx(" qui agit en premier.")];
    if (x === e.a) return [tx("Tu as donné l'abscisse : lis l'ordonnée du point de "), lx(`C_${i}`), tx(" d'abscisse "), lx(`${e.a}`), tx(".")];
    return null;
  }
  if (x === e.v) return [tx("Tu t'es arrêté sur la diagonale : continue verticalement jusqu'à "), lx(`C_${o}`), tx(".")];
  const oa = valeurCourbe(courbeO(e), e.a);
  if (oa !== null && x === oa) return [tx("C'est "), lx(`${o}(${e.a})`), tx(" : "), lx(o), tx(" reçoit "), lx(`${i}(${e.a})=${e.v}`), tx(", pas "), lx(`${e.a}`), tx(".")];
  const autre = e.variante === "ff" ? null : valeurCourbe(courbeI(e), e.v);
  if (autre !== null && x === autre) return [tx("Tu as lu sur "), lx(`C_${i}`), tx(" : la seconde lecture se fait sur "), lx(`C_${o}`), tx(".")];
  return null;
}
