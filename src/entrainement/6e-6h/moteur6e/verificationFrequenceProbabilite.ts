import type { ExerciceFrequenceProbabilite } from "../core6e/frequenceProbabilite.types";
import type { StatutVerification } from "../moteur/statutVerification";
import { evaluerValeurExponentielle } from "./expressionExponentielle";
import type { PhaseFrequenceProbabilite } from "./typesFrequenceProbabilite";
import { diagnostiquerProbabilite } from "./verificationProbabilites";

/**
 * Couche B (6e) — vérification de `6gen75` « Fréquence et probabilité ». SEULE source des grandeurs
 * dérivées (probabilité du modèle, fréquence, écart relatif, verdict, effectif attendu) : le
 * générateur, l'interface, le récapitulatif et l'adaptateur papier les lisent ICI.
 *
 * Règle de décision (donnée à l'élève, sans intervalle de fluctuation) : l'écart entre une fréquence
 * f et une probabilité p est jugé significatif quand l'écart relatif |f − p| / p dépasse un seuil qui
 * diminue quand le nombre d'essais n augmente (`SEUILS`). Probabilités et fréquences sont vérifiées
 * par `diagnostiquerProbabilite` (forme exacte, ou décimal correctement arrondi) ; l'effectif
 * attendu de l'écran 4 est accepté à une unité près.
 */

/** Paliers de la règle de décision, du plus petit au plus grand nombre d'essais. */
export const SEUILS: { nMax: number; seuil: number; libelle: string }[] = [
  { nMax: 99, seuil: 0.5, libelle: "moins de 100" },
  { nMax: 400, seuil: 0.25, libelle: "de 100 à 400" },
  { nMax: 1000, seuil: 0.18, libelle: "de 401 à 1 000" },
  { nMax: Number.POSITIVE_INFINITY, seuil: 0.12, libelle: "plus de 1 000" },
];

export function seuilRelatif(n: number): number {
  return (SEUILS.find((s) => n <= s.nMax) ?? SEUILS[SEUILS.length - 1]).seuil;
}

/** Nombre de couples (dé 1 ; dé 2) de la grille 6 × 6 dont la somme vaut `s`. */
export function couplesDeSomme(s: number): number {
  return s < 2 || s > 12 ? 0 : 6 - Math.abs(s - 7);
}

/** Nombre de cas favorables du modèle (faces en A, cases de la grille en B) et nombre total de cas. */
export function casModele(ex: ExerciceFrequenceProbabilite): { favorables: number; total: number } | null {
  if (ex.famille === "A") return { favorables: ex.evenement.faces.length, total: 6 };
  if (ex.famille === "B") return { favorables: ex.evenement.sommes.reduce((acc, s) => acc + couplesDeSomme(s), 0), total: 36 };
  return null;
}

/** Probabilité du modèle à laquelle on compare la fréquence : dé équilibré (A), grille 6 × 6 (B),
 * affirmation p₀ (C). */
export function probabiliteModele(ex: ExerciceFrequenceProbabilite): number {
  const cas = casModele(ex);
  if (cas) return cas.favorables / cas.total;
  if (ex.famille === "C") return ex.affirmation.num / ex.affirmation.den;
  return Number.NaN;
}

/** Probabilité du modèle « naïf » de B : les 11 sommes supposées équiprobables. */
export function probabiliteNaiveB(ex: ExerciceFrequenceProbabilite): number | null {
  return ex.famille === "B" ? ex.evenement.sommes.length / 11 : null;
}

/** Effectif observé de l'événement étudié. */
export function effectifEvenement(ex: ExerciceFrequenceProbabilite): number {
  if (ex.famille === "A") return ex.evenement.faces.reduce((acc, face) => acc + ex.effectifs[face - 1], 0);
  if (ex.famille === "B") return ex.evenement.sommes.reduce((acc, s) => acc + ex.effectifs[s - 2], 0);
  return ex.effectif;
}

export function frequenceObservee(ex: ExerciceFrequenceProbabilite): number {
  return effectifEvenement(ex) / ex.n;
}

export function ecartRelatif(f: number, p: number): number {
  return Math.abs(f - p) / p;
}

export type VerdictFrequence = "compatible" | "incompatible" | "piege";

/** Verdict de la règle : compatible si l'écart relatif ne dépasse pas le seuil. En B, si le modèle de
 * la grille est rejeté mais que les 11 sommes équiprobables passent, le verdict serait « piege » —
 * le générateur ne produit jamais ce cas (il trahirait le piège qu'on veut dénoncer). */
export function verdictAttendu(ex: ExerciceFrequenceProbabilite): VerdictFrequence {
  const f = frequenceObservee(ex);
  const s = seuilRelatif(ex.n);
  if (ecartRelatif(f, probabiliteModele(ex)) <= s) return "compatible";
  const naive = probabiliteNaiveB(ex);
  if (naive !== null && ecartRelatif(f, naive) <= s) return "piege";
  return "incompatible";
}

/** L'écran 4 utilise la probabilité du modèle quand celui-ci est confirmé (A, B), la fréquence
 * observée sinon — et TOUJOURS en C (une affirmation compatible n'est pas pour autant démontrée). */
export function utiliseModeleEcran4(ex: ExerciceFrequenceProbabilite): boolean {
  return ex.famille !== "C" && verdictAttendu(ex) === "compatible";
}

export function effectifAttendu(ex: ExerciceFrequenceProbabilite): number {
  return ex.nouveauxEssais * (utiliseModeleEcran4(ex) ? probabiliteModele(ex) : frequenceObservee(ex));
}

/** Réponse attendue à l'écran 1 de C (choix fermé). */
export const REPONSE_ECRAN1_C = "impossible";

function diagnostiquerEffectif(texte: string, cible: number): StatutVerification {
  // Espaces retirés AVANT l'évaluation : « 1 500 » serait sinon lu comme 500.
  const v = evaluerValeurExponentielle(texte.replace(/[\s  ]+/g, ""));
  if (v === null) return "parse_error";
  return Math.abs(v - cible) <= 1 + 1e-9 ? "correct" : "not_equivalent";
}

export function diagnostiquerEcran(ex: ExerciceFrequenceProbabilite, phase: PhaseFrequenceProbabilite, valeurs: string[]): StatutVerification {
  const v = valeurs[0] ?? "";
  switch (phase) {
    case "ecran1":
      if (ex.famille === "C") return v === REPONSE_ECRAN1_C ? "correct" : "not_equivalent";
      return diagnostiquerProbabilite(v, probabiliteModele(ex));
    case "ecran2":
      return diagnostiquerProbabilite(v, frequenceObservee(ex));
    case "ecran3":
      return v === verdictAttendu(ex) ? "correct" : "not_equivalent";
    case "ecran4":
      return diagnostiquerEffectif(v, effectifAttendu(ex));
  }
}

export function verifierEcran(ex: ExerciceFrequenceProbabilite, phase: PhaseFrequenceProbabilite, valeurs: string[]): boolean {
  return diagnostiquerEcran(ex, phase, valeurs) === "correct";
}
