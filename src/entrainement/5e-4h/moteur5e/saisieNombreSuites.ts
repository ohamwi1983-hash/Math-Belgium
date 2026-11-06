/**
 * Couche B (5e) — saisie des nombres pour 5gen14 (suites arithmétiques) et 5gen15 (suites
 * géométriques) UNIQUEMENT. Enveloppe `diagnostiquerNombre`/`diagnostiquerTermes`
 * (`verificationSuiteArithmetique.ts`, partagés avec 5gen16 — jamais modifiés ici) pour accepter
 * l'espace des milliers : « 1 234 » valait 1 × 234 = 234 pour l'évaluateur (multiplication
 * implicite), donc une bonne réponse saisie à la française était comptée fausse.
 */
import type { StatutVerification } from "../moteur/statutVerification";
import { diagnostiquerNombre as diagnostiquerNombreBrut } from "./verificationSuiteArithmetique";

/** Retire les espaces (ordinaires, insécables, fines insécables) placées ENTRE deux chiffres —
 * « 1 234 » → « 1234 », « −12 500,5 » → « −12500,5 ». Une espace autour d'un opérateur est gardée. */
export function sansEspacesMilliers(texte: string): string {
  return texte.replace(/(\d)[\s  ]+(?=\d)/g, "$1");
}

export function diagnostiquerNombre(texte: string, cible: number): StatutVerification {
  return diagnostiquerNombreBrut(sansEspacesMilliers(texte), cible);
}

/** N champs numériques, TOUS corrects requis (parse_error prioritaire sur not_equivalent) — même
 * convention que `diagnostiquerTermes` de `verificationSuiteArithmetique.ts`. */
export function diagnostiquerTermes(textes: string[], cibles: number[]): StatutVerification {
  const statuts = textes.map((t, i) => diagnostiquerNombre(t, cibles[i]));
  if (statuts.some((s) => s === "parse_error")) return "parse_error";
  return statuts.every((s) => s === "correct") ? "correct" : "not_equivalent";
}

/** Écran « Pose l'équation » : vrai si la saisie est déjà une SOLUTION (« x = −3 », « n = 120 »,
 * « −3 = x ») — un membre réduit à la seule inconnue, l'autre sans aucune lettre. L'écran demande
 * l'équation qui traduit les données ; la résoudre est l'écran suivant (décision de l'utilisateur :
 * refuser, avec un message qui demande l'équation, sans consommer de tentative). */
export function estSolutionDirecte(texte: string, inconnue: "x" | "n"): boolean {
  const parties = texte.split("=");
  if (parties.length !== 2) return false;
  const [g, d] = parties.map((p) => p.trim().toLowerCase());
  const sansLettre = (p: string) => p.length > 0 && !/[a-z]/i.test(p);
  return (g === inconnue && sansLettre(d)) || (d === inconnue && sansLettre(g));
}

export const MESSAGE_SOLUTION_DIRECTE =
  "Écris l'équation qui traduit les données, pas directement la valeur de l'inconnue : tu la calculeras à l'écran suivant.";
